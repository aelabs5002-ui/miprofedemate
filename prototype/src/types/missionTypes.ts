// Basic types for Mission Logic
// SOURCE OF TRUTH: Matches Supabase Database & Edge Function Contract

export interface MissionRequest {
    studentId: string;
    dateKey: string;
    type: 'tarea' | 'practica';
}

export interface StepContent {
    question: string;
    options?: string[]; // Multiple choice
    correctAnswer: string;
    difficulty?: string;
    topic?: string;
    hint?: string; // Optional hint
}

export interface MissionStep {
    id: string;
    mission_id: string;
    step_index: number;
    type: 'exercise' | 'explanation' | 'video';
    content: StepContent;
    status: 'pendiente' | 'completado' | 'bloqueado';
}

export interface MissionPlan {
    id: string;
    student_id: string;
    date_key: string;
    type: 'tarea' | 'practica';
    status: 'creada' | 'en_progreso' | 'completada';
    origin?: 'ai' | 'manual';
    title: string;
    description: string;
    mission_steps: MissionStep[];

    // Optional context fields from legacy, adapted if needed or kept optional
    context?: any;
}

export interface AnswerRequest {
    missionId: string;
    stepId: string;
    studentId: string;
    answer: string | number;
}

export interface AnswerResponse {
    isCorrect: boolean;
    feedback: string;
    missionComplete: boolean;
    errorTag?: string;
}


export interface MissionBuildStatus {
    missionId: string;
    status: 'building' | 'ready' | 'error';
    progress: number;
    retryable?: boolean;
    step?: string;
    state?: string; // Legacy support
}
