import { CCAService } from './CCAService';
import { CartaCognitivaAlumno } from '../types/ccaTypes';

export interface AdaptiveMissionParams {
    difficulty: 1 | 2 | 3 | 4 | 5;
    nEjercicios: number; // 4–10
    recommendedMotorId?: string; // 'A'|'F' etc
    focusErrorTags?: string[]; // top tags
}

export const AdaptiveMissionSelector = {
    /**
     * Calcula parámetros adaptativos para la misión basados en la CCA del alumno.
     */
    selectAdaptiveParams: (alumnoId: string, fallbackGrade: string): AdaptiveMissionParams => {
        // 1. Obtener o crear CCA
        // Nota: Es síncrono porque usa localStorage
        const cca = CCAService.getOrCreateCCA(alumnoId, fallbackGrade);

        // 2. Calcular Nivel/Dificultad Base
        let difficulty: 1 | 2 | 3 | 4 | 5 = 3; // Default

        const { totalEjercicios, correctos } = cca.resumenReciente;
        const precision = totalEjercicios > 0 ? (correctos / totalEjercicios) : 0;

        if (totalEjercicios >= 5) { // Solo si hay suficiente data reciente
            if (precision >= 0.8) difficulty = 4; // Promoción
            else if (precision >= 0.6) difficulty = 3; // Mantener
            else if (precision >= 0.4) difficulty = 2; // Refuerzo
            else difficulty = 1; // Base

            // Bonus: Si lleva muchos ej, subir a 5? Por ahora simple 1-4.
        }

        // 3. Determinar número de ejercicios
        let nEjercicios = 6;
        if (difficulty <= 2) nEjercicios = 5; // Menos carga cognitiva
        if (difficulty >= 4) nEjercicios = 8; // Mayor desafío

        // 4. Identificar Focus Tags (Errores frecuentes)
        // Ordenar errores por conteo desc
        const sortedErrors = [...cca.erroresFrecuentes].sort((a, b) => b.conteo - a.conteo);
        const focusErrorTags = sortedErrors.slice(0, 3).map(e => e.errorTag);

        // 5. Recomendar Motor
        let recommendedMotorId = 'F'; // Default Fundamental

        // Reglas simples de motor
        const hasBasicErrors = focusErrorTags.some(t => ['operaciones_basicas', 'fracciones', 'signos'].includes(t));
        const hasAlgebraErrors = focusErrorTags.some(t => ['despeje', 'igualdad', 'distribucion'].includes(t));

        if (hasBasicErrors && !hasAlgebraErrors) {
            recommendedMotorId = 'A'; // Aritmética / Conceptos básicos
        }
        // Si tiene de todo, 'F' suele ser mejor mix, o un motor híbrido si existiera. 
        // Por ahora F es el principal implementado.

        return {
            difficulty,
            nEjercicios,
            recommendedMotorId,
            focusErrorTags
        };
    }
};
