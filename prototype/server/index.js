import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { buildSystemPrompt, buildUserPrompt } from './prompts/tutor.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Validar que existe la API key
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ ERROR: OPENAI_API_KEY no está configurada en las variables de entorno');
  process.exit(1);
}

// Inicializar cliente de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL_NAME = process.env.MODEL_NAME || 'gpt-4o-mini';

// Middleware - CORS configurable
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;
app.use(cors({
  origin: FRONTEND_ORIGIN ? [FRONTEND_ORIGIN] : true
}));
app.use(express.json());

// Health check enriquecido
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    model: MODEL_NAME,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

/**
 * Endpoint principal: POST /api/tutor/respond
 * Recibe la respuesta del estudiante y devuelve feedback guiado del tutor IA
 */
app.post('/api/tutor/respond', async (req, res) => {
  try {
    const {
      userId,
      sessionId,
      exerciseId,
      grade = '1sec',
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

    // Construir prompts
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt({
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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📊 Modelo: ${MODEL_NAME}`);
  console.log(`🔑 API Key configurada: ${process.env.OPENAI_API_KEY ? '✅' : '❌'}`);
});