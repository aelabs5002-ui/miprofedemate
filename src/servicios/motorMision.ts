import { MissionPlan, Ejercicio } from '../types/missionPlan';
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
    let origin: 'auto' | 'observacion' | 'tarea' | 'tarea+observacion' = 'auto';
    let finalContext: MissionPlan['context'] | undefined = undefined;

    if (contextInput && (contextInput.observacion || contextInput.tareaTexto || contextInput.tareaNombre)) {
        const hasA = !!contextInput.tareaTexto || !!contextInput.tareaNombre;
        const hasB = !!contextInput.observacion;

        if (hasA && hasB) origin = 'tarea+observacion';
        else if (hasA) origin = 'tarea';
        else if (hasB) origin = 'observacion';

        finalContext = {
            observacion: contextInput.observacion,
            tareaNombre: contextInput.tareaNombre,
            tareaTexto: contextInput.tareaTexto,
            createdAt: Date.now()
        };
    }

    const plan: MissionPlan = {
        missionId: `mission-${Date.now()}`,
        grade: config.grade,
        topic: temaSeleccionado,
        exercises: ejerciciosSeleccionados,
        origin: origin,
        context: finalContext,
        recommendedMotorId: config.motorId,
        nEjercicios: n
    };

    // 4. Persistir evento 'mision_generada'
    memoriaAlumno.appendEvento({
        tipo: 'mision_generada',
        userId,
        timestamp: Date.now(),
        payload: {
            origin: plan.origin,
            context: plan.context,
            missionId: plan.missionId,
            topic: plan.topic,
            grade: plan.grade,
            nEjercicios: n
        }
    });

    return plan;
};
