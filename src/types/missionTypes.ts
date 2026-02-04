import { MissionPlan } from './missionPlan';

export type MissionType = 'practice' | 'task';

export interface MissionRequest {
    studentId: string;
    type: MissionType;
    dateKey: string; // YYYY-MM-DD
    input?: {
        fileUrl?: string; // For 'task'
        text?: string;    // Observation or extra context
        timeAvailable?: number; // Minutes
        mode?: 'solve' | 'understand';
    };
    context?: {
        curriculumNodeId?: string;
        prevMissionId?: string;
    };
}

export interface MissionBuildStatus {
    missionId: string;
    studentId: string;
    state: 'creating' | 'ready' | 'error';
    progressPct?: number; // 0-100
    message?: string; // "Analizando tarea...", "Generando retos..."
    retryable?: boolean;
    errorCode?: string;
}

export type MissionLifecycleStatus = 'lista' | 'en_progreso' | 'completada' | 'abandonada';

export type { MissionPlan };
