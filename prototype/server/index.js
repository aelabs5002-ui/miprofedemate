import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

// Imports de los nuevos Prompts Constitucionales
import { MOTOR_SYSTEM_PROMPT, buildMotorUserPrompt } from './prompts/motor.js';
import { TUTOR_SYSTEM_PROMPT, buildTutorUserPrompt } from './prompts/tutor.js';
import { buildSystemPrompt as legacyBuildSystem, buildUserPrompt as legacyBuildUser } from './prompts/legacy_tutor.js';


// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Inicializar Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Validar que existe la API key
if (!process.env.OPENAI_API_KEY) {
  console.log('⚠️ WARNING: OPENAI_API_KEY faltando - Usando MOCK o fallará (Check env)');
}

// Inicializar cliente de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'mock-key',
});

const MODEL_NAME = process.env.MODEL_NAME || 'gpt-4o-mini';

// Middleware - CORS configurable
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;
app.use(cors({
  origin: FRONTEND_ORIGIN ? [FRONTEND_ORIGIN] : true
}));
app.use(express.json());


/**
 * UTILS: Helper seguro para parsear JSON de OpenAI
 */
function safeParseJSON(text) {
  try {
    // Eliminar markdown fences si existen
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error('Error parseando JSON de AI:', text);
    throw new Error('Respuesta IA inválida (JSON malformado)');
  }
}

/**
 * ---------------------------------------------------------
 * ROL MOTOR: Generador de Misiones (Planificador)
 * POST /api/mission/build
 * Input: MissionRequest ({ type, grade, topics... })
 * Output: MissionPlan (JSON)
 * ---------------------------------------------------------
 */
app.post('/api/mission/build', async (req, res) => {
  const startTime = Date.now();
  console.log('🏗️ MOTOR: Iniciando construcción de misión...');

  /**
   * ---------------------------------------------------------
   * AUTH: Verificar Sesión y Obtener Alumnos
   * GET /api/auth/me
   * Headers: Authorization: Bearer <TOKEN>
   * ---------------------------------------------------------
   */
  app.get('/api/auth/me', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'No authorization header' });
      }

      const token = authHeader.replace('Bearer ', '');

      // 1. Verificar Token con Supabase
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
        console.error('❌ Auth Error:', authError?.message);
        return res.status(401).json({ error: 'Invalid token' });
      }

      const parentId = user.id;

      // 2. Ensuring 'parents' record exists (Auto-provisioning for S-1)
      // We check if parent exists, if not create it.
      const { data: parentRecord, error: parentCheckError } = await supabase
        .from('parents')
        .select('id')
        .eq('id', parentId)
        .single();

      if (!parentRecord && !parentCheckError) {
        // If not found but no error (returned null?), actually .single() returns error if not found.
        // Let's use Upsert or Ignore to be safe and simple.
        await supabase.from('parents').upsert({ id: parentId, email: user.email });
      } else if (parentCheckError && parentCheckError.code === 'PGRST116') {
        // Not found
        await supabase.from('parents').insert({ id: parentId, email: user.email });
      }

      // 3. Obtener Students asociados (Service Role - Bypass RLS)
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('parent_id', parentId);

      if (studentsError) {
        console.error('❌ Error fetching students:', studentsError);
        throw studentsError;
      }

      res.json({
        user: { id: parentId, email: user.email },
        students: students || []
      });

    } catch (error) {
      console.error('❌ AUTH ME ERROR:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  try {
    const { studentId, type, grade, topics, input } = req.body; // Basic validation
    if (!studentId) throw new Error('Falta studentId');

    const systemPrompt = MOTOR_SYSTEM_PROMPT;
    const userPrompt = buildMotorUserPrompt(req.body);

    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }, // FORCE JSON MODE
      max_tokens: 1500,
    });

    const assistantText = completion.choices[0].message.content;
    const missionPlan = safeParseJSON(assistantText);

    // Inyectar metadatos obligatorios para retorno
    missionPlan.student_id = studentId;
    missionPlan.status = 'creada';
    if (!missionPlan.mission_steps) missionPlan.mission_steps = [];

    // --- PERSISTENCIA SUPABASE ---
    console.log(`💾 Guardando misión en Supabase para student=${studentId}...`);

    // 1. Insertar Misión
    const { data: missionData, error: missionError } = await supabase
      .from('missions')
      .insert({
        student_id: studentId, // Debe ser UUID válido
        origin: 'ai',
        status: 'pending',
        title: missionPlan.title || 'Misión Personalizada',
        description: missionPlan.description || 'Generada por IA'
      })
      .select()
      .single();

    if (missionError) {
      console.error('❌ Error guardando misión en DB:', missionError);
      // Fallback: retornamos el plan sin guardar si falla la DB (o lanzar error)
      throw new Error(`Error DB Mision: ${missionError.message}`);
    }

    const missionId = missionData.id;
    missionPlan.missionId = missionId; // Asignar el UUID real generado
    missionPlan.id = missionId; // Compatible with frontend types

    // 2. Insertar Steps
    if (missionPlan.mission_steps.length > 0) {
      const stepsToInsert = missionPlan.mission_steps.map((step, index) => ({
        mission_id: missionId,
        step_index: index,
        content: step, // Guardamos todo el objeto del paso JSON
        status: 'pending'
      }));

      // Insertar y solicitar IDs generados para devolverlos al frontend si fuera necesario
      // O simplemente confiamos en el orden. El frontend usa .id?
      // Revisando frontend usage: key={step.id}. El motor genera IDs dummy?
      // Si el motor genera IDs, podemos usarlos, pero DB genera UUIDs.
      // Seria ideal devolver los steps con sus UUIDs de DB.

      const { data: stepsData, error: stepsError } = await supabase
        .from('mission_steps')
        .insert(stepsToInsert)
        .select();

      if (stepsError) {
        console.error('❌ Error guardando steps en DB:', stepsError);
      } else if (stepsData) {
        // Actualizar los steps del plan con los IDs reales de la DB
        missionPlan.mission_steps = stepsData.map(dbStep => ({
          ...dbStep.content, // Spread content (question, answer)
          id: dbStep.id,    // Overwrite ID with DB UUID
          status: dbStep.status
        }));
      }
    }
    // -----------------------------

    const responseTime = Date.now() - startTime;
    console.log(`✅ MOTOR: Misión generada y guardada (${missionId}) en ${responseTime}ms. Steps: ${missionPlan.mission_steps.length}`);

    res.json(missionPlan);

  } catch (error) {
    console.error('❌ MOTOR ERROR:', error.message);
    res.status(500).json({ error: error.message, details: 'Fallo en Motor IA o DB' });
  }
});

/**
 * ---------------------------------------------------------
 * ROL TUTOR: Guía Paso a Paso
 * POST /api/tutor/step
 * Input: TutorStepRequest ({ content, studentAnswer... })
 * Output: TutorStepResponse (JSON)
 * ---------------------------------------------------------
 */
app.post('/api/tutor/step', async (req, res) => {
  const startTime = Date.now();

  try {
    const { studentId, stepId, content, studentAnswer, missionId } = req.body;

    // Log básico sin PII sensible real
    console.log(`👨‍🏫 TUTOR: Step analizando intento. StepId=${stepId || 'N/A'}`);

    const systemPrompt = TUTOR_SYSTEM_PROMPT;
    const userPrompt = buildTutorUserPrompt(req.body);

    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.5,
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const assistantText = completion.choices[0].message.content;
    const tutorResponse = safeParseJSON(assistantText);

    const responseTime = Date.now() - startTime;
    const tokens = completion.usage;

    // --- PERSISTENCIA ATTEMPT ---
    // Solo guardamos si tenemos stepId válido (que venga de la DB) y un user input
    if (stepId && studentAnswer) {
      const isCorrect = tutorResponse.nextAction === 'next_step' || tutorResponse.solved === true;

      // Extract error_tag from AI response or default to 'none'.
      const validTags = ["sign_error", "procedure_error", "concept_error", "reading_error", "none"];
      let errorTag = tutorResponse.error_tag || 'none';
      if (!validTags.includes(errorTag)) errorTag = 'none';

      // DB-1 Contract: Do NOT persist feedback text. Only metrics + error classification.
      try {
        const { error: attemptError } = await supabase
          .from('attempts')
          .insert({
            step_id: stepId,
            student_id: studentId,
            user_input: studentAnswer,
            is_correct: isCorrect,
            error_tag: errorTag
            // feedback: REMOVED per privacy/size contract (generated live)
          });
        if (attemptError) console.error('Error insertando attempt:', attemptError.message);
      } catch (dbErr) {
        console.warn('Skipping metrics persistence (invalid ID?):', dbErr.message);
      }
    }
    // ----------------------------

    console.log(`✅ TUTOR: Resp en ${responseTime}ms. Tks: ${tokens?.total_tokens}. Action: ${tutorResponse.nextAction}`);

    res.json(tutorResponse);

  } catch (error) {
    console.error('❌ TUTOR ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Endpoint LEGACY: POST /api/tutor/respond
 * (Mantenido por compatibilidad, pero idealmente migrar a /step)
 */
app.post('/api/tutor/respond', async (req, res) => {
  try {
    const {
      userId,
      sessionId,
      exerciseId,
      grade = '1sec', // ... resto de params

      topic,
      studentAnswer,
      attemptNumber = 1,
      mode = 'text',
      exercisePrompt,
      hintAllowed = false
    } = req.body;

    // Validación básica
    if (!exercisePrompt || !studentAnswer) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: exercisePrompt y studentAnswer'
      });
    }

    console.log(`📝 Request: user=${userId}, session=${sessionId}, exercise=${exerciseId}, attempt=${attemptNumber}`);

    // Construir prompts (LEGACY)
    const systemPrompt = legacyBuildSystem();
    const userPrompt = legacyBuildUser({
      exercisePrompt,
      studentAnswer,
      attemptNumber,
      hintAllowed,
      grade,
      topic: topic || 'matemáticas'
    });

    // Llamada a OpenAI
    const startTime = Date.now();
    const completion = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const responseTime = Date.now() - startTime;

    const assistantText = completion.choices[0].message.content;
    const tokensIn = completion.usage?.prompt_tokens || 0;
    const tokensOut = completion.usage?.completion_tokens || 0;

    // Determinar nextAction basado en el contenido de la respuesta
    let nextAction = 'retry';
    const lowerText = assistantText.toLowerCase();

    if (lowerText.includes('correcto') || lowerText.includes('muy bien') || lowerText.includes('excelente')) {
      nextAction = 'next';
    } else if (lowerText.includes('pista') || lowerText.includes('ayuda') || lowerText.includes('intenta') || lowerText.includes('prueba')) {
      nextAction = 'hint';
    }

    console.log(`✅ Response: ${tokensOut} tokens, ${responseTime}ms, action=${nextAction}`);

    res.json({
      assistantText,
      nextAction,
      meta: {
        tokensIn,
        tokensOut,
        responseTime,
        model: MODEL_NAME
      }
    });

  } catch (error) {
    console.error('❌ Error en /api/tutor/respond:', error);

    // Manejo de errores específicos de OpenAI
    if (error.status === 401) {
      return res.status(500).json({
        error: 'Error de autenticación con OpenAI. Verifica la API key.'
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        error: 'Límite de rate excedido. Intenta de nuevo en unos momentos.'
      });
    }

    res.status(500).json({
      error: 'Error interno del servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});



app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📊 Modelo: ${MODEL_NAME}`);
  console.log(`🔑 API Key configurada: ${process.env.OPENAI_API_KEY ? '✅' : '❌'}`);
  console.log(`🐘 Supabase conectada a: ${process.env.SUPABASE_URL}`);
});