import { MissionPlan } from '../types/missionPlan';

export type MotorId = 'A' | 'F';

export const MotorRouter = {
    /**
     * Decide qué motor usar basándose en el plan de la misión.
     */
    resolveMotor: (plan: MissionPlan): MotorId => {
        // 1. Recomendación explícita
        if (plan.recommendedMotorId === 'A' || plan.recommendedMotorId === 'F') {
            return plan.recommendedMotorId;
        }

        // 2. Inferencia por Tags
        const tags = plan.focusErrorTags || [];
        if (tags.some(t => ['operaciones_basicas', 'fracciones'].includes(t))) {
            return 'A'; // Aritmética
        }

        if (tags.some(t => ['despeje', 'signos', 'igualdad'].includes(t))) {
            return 'F'; // Fundamental (Álgebra)
        }

        // 3. Default
        return 'F';
    }
};
