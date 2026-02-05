import { createClient } from '@supabase/supabase-js';
import { MissionPlan, MissionRequest, AnswerResponse } from '../types/missionTypes';

// Initialize Supabase Client (Replace these with Env Vars in real app)
// For MVP we hardcode or assume global env. 
// User provided no env, so we assume they will add it or we use placeholder.
// Ideally should be import.meta.env.VITE_SUPABASE_URL etc.
// Assuming standard Vite env vars
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://YOUR_PROJECT_REF.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const edgeApi = {
    /**
     * Syncs mission: Gets existing or creates new one.
     */
    async missionSync(studentId: string, dateKey: string, type: 'tarea' | 'practica'): Promise<MissionPlan> {
        const { data, error } = await supabase.functions.invoke('mission_sync', {
            body: { studentId, dateKey, type }
        });

        if (error) throw error;
        return data as MissionPlan;
    },

    /**
     * Starts the session (marks mission in progress).
     */
    async sessionStart(missionId: string, studentId: string): Promise<any> {
        const { data, error } = await supabase.functions.invoke('session_start', {
            body: { missionId, studentId }
        });
        if (error) throw error;
        return data;
    },

    /**
     * Gets next exercise.
     */
    async exerciseNext(missionId: string, studentId: string): Promise<any> {
        const { data, error } = await supabase.functions.invoke('exercise_next', {
            body: { missionId, studentId }
        });
        if (error) throw error;
        return data;
    },

    /**
     * Submits answer.
     */
    async answerSubmit(missionId: string, stepId: string, studentId: string, answer: string): Promise<AnswerResponse> {
        const { data, error } = await supabase.functions.invoke('answer_submit', {
            body: { missionId, stepId, studentId, answer }
        });
        if (error) throw error;
        return data as AnswerResponse;
    },

    /**
     * Upload placeholder
     */
    async uploadAnalyze(file: any): Promise<any> {
        const { data, error } = await supabase.functions.invoke('upload_analyze', {
            body: { file } // passing file object directly might not work without FormData, but for placeholder is fine
        });
        if (error) throw error;
        return data;
    }
};
