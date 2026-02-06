import { createClient } from '@supabase/supabase-js';
import { MissionPlan, MissionRequest, AnswerResponse } from '../types/missionTypes';

// Configuración API Backend (Proxy manual)
const API_BASE = 'http://localhost:3001/api';

// Mantener Supabase client para otras cosas si es necesario (ej. Auth directo si no pasa por backend)
// Pero idealmente todo pasa por nuestra API ahora.
// Dejamos la config de supabase client por compatibilidad con código existente que lo use.
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const edgeApi = {
    /**
     * Syncs mission: Gets existing or creates new one.
     */
    async missionSync(studentId: string, dateKey: string, type: 'tarea' | 'practica'): Promise<MissionPlan> {
        // Fallback a MissionService o implementación directa si se usa en C5
        // Por ahora redirigimos al backend build si se usa
        console.warn('Deprecated edgeApi.missionSync called - use MissionService');
        throw new Error('Use MissionService');
    },

    /**
     * Starts the session (marks mission in progress).
     */
    async sessionStart(missionId: string, studentId: string): Promise<any> {
        // TODO: Implementar endpoint backend?
        console.log('Session start:', missionId);
        return { success: true };
    },

    /**
     * Gets next exercise. (Managed by local state in current architecture)
     */
    async exerciseNext(missionId: string, studentId: string): Promise<any> {
        return {};
    },

    /**
     * Submits answer.
     * Ahora redirige al Backend Node.js /api/tutor/step
     */
    async answerSubmit(missionId: string, stepId: string, studentId: string, answer: string, content?: any): Promise<AnswerResponse | any> {

        try {
            const response = await fetch(`${API_BASE}/tutor/step`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    missionId,
                    stepId,
                    studentId,
                    studentAnswer: answer,
                    content // Pasamos content si está disponible para contexto
                })
            });

            if (!response.ok) throw new Error('Error en tutor step');
            return await response.json();

        } catch (e) {
            console.error('Error submitting answer:', e);
            throw e;
        }
    },

    /**
     * Upload placeholder
     */
    async uploadAnalyze(file: any): Promise<any> {
        // TODO: Backend upload endpoint
        return { text: "Simulated text" };
    }
};
