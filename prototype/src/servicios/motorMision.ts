import { MissionPlan, MissionStep } from '../types/missionTypes';
import { memoriaAlumno } from './RepositorioMemoriaAlumno';
import { BANCO_EJERCICIOS } from '../data/bancoEjercicios';

export interface MissionOptions {
    grade: string;
    nEjercicios?: number;
    topic?: string;
    motorId?: string; // Forzoso
}

export interface ContextInput {
    observacion?: string;
    tareaNombre?: string;
    tareaTexto?: string;
}

export const buildMissionPlan = (
    userId: string,
    config: MissionOptions,
    contextInput?: ContextInput
): MissionPlan => {
    let temaSeleccionado = config.topic || '';
    let maxErrores = -1;

    // Si no hay tema, inferir de errores frecuentes
    if (!temaSeleccionado) {
        const errores = memoriaAlumno.listarErroresFrecuentesOrdenadosPorConteo();

        // Simular lógica de agrupación por tema si necesario, o usar categorías directas
        // Asumimos que la categoría del error coincide con la clave en BANCO_EJERCICIOS
        const erroresPorTema: Record<string, number> = {};

        errores.forEach(e => {
            const tema = e.categoria; // Simplificación
            if (BANCO_EJERCICIOS[tema]) {
                erroresPorTema[tema] = (erroresPorTema[tema] || 0) + e.conteo;
            }
        });

        // Encontrar el tema con más errores
        Object.entries(erroresPorTema).forEach(([tema, count]) => {
            if (count > maxErrores) {
                maxErrores = count;
                temaSeleccionado = tema;
            }
        });
    }

    // Si no hay errores, o el tema no está en el banco, usar default
    if (!temaSeleccionado || !BANCO_EJERCICIOS[temaSeleccionado]) {
        // Fallback a primer tema disponible o uno por defecto
        const temasDisponibles = Object.keys(BANCO_EJERCICIOS);
        temaSeleccionado = temasDisponibles[0] || 'Ecuaciones lineales';
    }

    // 2. Seleccionar ejercicios del banco
    const ejerciciosDisponibles = BANCO_EJERCICIOS[temaSeleccionado] || [];

    // Selección aleatoria simple (shuffle y slice)
    const n = config.nEjercicios || 5;
    const ejerciciosSeleccionados = [...ejerciciosDisponibles]
        .sort(() => 0.5 - Math.random())
        .slice(0, n);

    // 3. Determinar Origen y Contexto
    let origin: 'ai' | 'manual' = 'manual'; // Default to manual/ai (locally generated is usually manual practice or ai simulation)
    // If it's "auto" generated locally, we map it to 'manual' or 'ai' depending on logic.
    // Let's use 'manual' for local practice without AI intervention, or 'ai' if mimicking AI.
    // Given it's "motor local", 'manual' (Práctica Libre) often fits, or we can use 'ai' if we consider the algorithm an AI.
    // Let's stick to 'manual' for local generation to distinguish from Edge Function AI.
    origin = 'manual';
    let finalContext: MissionPlan['context'] | undefined = undefined;

    if (contextInput && (contextInput.observacion || contextInput.tareaTexto || contextInput.tareaNombre)) {
        // Logic for context
        finalContext = {
            observacion: contextInput.observacion,
            tareaNombre: contextInput.tareaNombre,
            tareaTexto: contextInput.tareaTexto,
            createdAt: Date.now(),
            originDetail: 'mixed' // Legacy origin adaptation
        };
        origin = 'manual';
    }

    // Map to Unified MissionStep
    const missionId = `mission-${Date.now()}`;
    const missionSteps: MissionStep[] = ejerciciosSeleccionados.map((ej, index) => ({
        id: ej.id, // Or generate new ID
        mission_id: missionId,
        step_index: index,
        type: 'exercise',
        status: 'pendiente',
        content: {
            question: ej.enunciado,
            correctAnswer: ej.respuestaEsperada,
            topic: ej.tema,
            hint: ej.pista,
            difficulty: 'adaptative'
        }
    }));

    // Add extra context if needed for MotorRouter
    if (config.motorId) {
        if (!finalContext) finalContext = {};
        finalContext.recommendedMotorId = config.motorId;
    }

    const plan: MissionPlan = {
        id: missionId,
        student_id: userId,
        date_key: new Date().toISOString().split('T')[0],
        type: 'practica',
        status: 'creada',
        origin: origin, // 'ai' | 'manual'
        title: config.topic || 'Práctica',
        description: 'Misión generada localmente',
        mission_steps: missionSteps,
        context: finalContext
    };

    // 4. Persistir evento 'mision_generada'
    memoriaAlumno.appendEvento({
        tipo: 'mision_generada',
        userId,
        timestamp: Date.now(),
        payload: {
            origin: plan.origin,
            context: plan.context,
            missionId: plan.id,
            topic: plan.title,
            grade: config.grade, // Pass grade if needed in context
            nEjercicios: n
        }
    });

    return plan;
};
