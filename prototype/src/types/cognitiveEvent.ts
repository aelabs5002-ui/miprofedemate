export type CognitiveEventType =
    | 'attempt_submitted'
    | 'attempt_correct'
    | 'attempt_incorrect'
    | 'hint_used';

export interface CognitiveEvent {
    alumnoId: string;
    missionId: string;
    motorId: string;        // ej: 'F'
    competenciaId: string;  // ej: 'ecuaciones_lineales'
    type: CognitiveEventType;
    correct?: boolean;
    errorTag?: string;      // ej: 'signos', 'despeje', 'fracciones' (si aplica)
    timeMs?: number;
    hintUsed?: boolean;
    timestamp: number;
}
