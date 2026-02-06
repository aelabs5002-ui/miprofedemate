// Basic types for Mission Logic
// SOURCE OF TRUTH: Matches Supabase Database & Edge Function Contract

export interface MissionRequest {
    studentId: string;
    dateKey: string;
    type: 'tarea' | 'practica';
    grade?: string;  // Optional: "1sec", "2prim", etc.
    topics?: string[]; // Optional: ["fracciones", "geometria"]
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

// ------------------------------------
// AI CORE TYPES (Strict JSON Contract)
// ------------------------------------

export interface TutorStepRequest {
    studentId: string;
    missionId: string;
    stepId: string;
    content: StepContent;       // The problem being solved
    studentAnswer: string;      // What the student wrote/selected
    history?: any[];            // Previous interactions in this step
    grade?: string;             // Context
}

export interface TutorStepResponse {
    feedback: string;           // Explanation or hint
    nextAction: 'try_again' | 'hint' | 'next_step' | 'explain_more';
    isCorrect: boolean;
    // Minimal metadata for frontend logic
    suggestedHint?: string;
}
