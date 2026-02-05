import { MissionPlan } from '../types/missionTypes';

export type MotorId = 'A' | 'F';

export const MotorRouter = {
    /**
     * Decide qué motor usar basándose en el plan de la misión.
     */
    resolveMotor: (plan: MissionPlan): MotorId => {
        const ctx = plan.context as any;
        // 1. Recomendación explícita (Stored in context now)
        const recMotor = ctx?.recommendedMotorId;
        if (recMotor === 'A' || recMotor === 'F') {
            return recMotor;
        }

        // 2. Inferencia por Tags
        const tags = ctx?.focusErrorTags || [];
        if (Array.isArray(tags) && tags.some((t: string) => ['operaciones_basicas', 'fracciones'].includes(t))) {
            return 'A'; // Aritmética
        }

        if (Array.isArray(tags) && tags.some((t: string) => ['despeje', 'signos', 'igualdad'].includes(t))) {
            return 'F'; // Fundamental (Álgebra)
        }

        // 3. Default
        return 'F';
    }
};
