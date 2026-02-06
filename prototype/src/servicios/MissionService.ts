import { MissionRequest, MissionBuildStatus, MissionPlan } from '../types/missionTypes';

// Configuración API
const API_BASE = 'http://localhost:3001/api';

const STORAGE_KEY = 'missions_db_v1';

interface MissionRecord {
    status: MissionBuildStatus;
    plan?: MissionPlan;
    request: MissionRequest;
    createdAt: number;
}

const getDb = (): Record<string, MissionRecord> => {
    try {
        const s = localStorage.getItem(STORAGE_KEY);
        return s ? JSON.parse(s) : {};
    } catch (e) {
        console.warn('Error reading local storage DB', e);
        return {};
    }
};

const saveDb = (db: Record<string, MissionRecord>) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
        console.error('Error saving to local storage', e);
    }
};

export const MissionService = {
    /**
     * Inicia la creación de una misión (asíncrono via API).
     * Retorna estado 'creating' inmediato y lanza el fetch en background.
     */
    buildMissionAsync: async (request: MissionRequest): Promise<MissionBuildStatus> => {
        // 1. Deduplicación (Opcional: si ya existe para hoy, devolverla)
        // Por ahora, siempre creamos nueva o dejamos que el backend maneje lógica si quisiéramos.
        // Mantenemos lógica local de no re-crear inmediatamente si ya hay una "creando".

        const missionId = `m-${Date.now()}`; // ID temporal/tracking client-side
        // Nota: El backend generará el ID definitivo (UUID) que vendrá en el plan.
        // Pero usamos este ID para trackear el estado de la solicitud en el cliente.

        const initialStatus: MissionBuildStatus = {
            missionId,
            studentId: request.studentId,
            state: 'creating',
            message: request.type === 'task' ? 'Enviando tarea al tutor IA...' : 'Analizando perfil con IA...',
            progressPct: 5
        };

        const db = getDb();
        db[missionId] = {
            status: initialStatus,
            request,
            createdAt: Date.now()
        };
        saveDb(db);

        // Disparar proceso real en background
        triggerBackendBuild(missionId, request);

        return initialStatus;
    },

    /**
     * Reintenta una misión fallida usando el request original.
     */
    retryMission: async (missionId: string): Promise<void> => {
        const db = getDb();
        const record = db[missionId];
        if (!record) throw new Error('Misión no encontrada');

        // Reset status
        const newStatus: MissionBuildStatus = {
            ...record.status,
            state: 'creating',
            message: 'Reintentando conexión con IA...',
            progressPct: 5,
            retryable: false,
            errorCode: undefined
        };

        record.status = newStatus;
        saveDb(db);

        // Reiniciar proceso
        triggerBackendBuild(missionId, record.request);
    },

    /**
     * Consulta el estado actual (Polling).
     */
    checkStatus: async (missionId: string): Promise<MissionBuildStatus> => {
        const db = getDb();
        const record = db[missionId];
        if (!record) {
            return {
                missionId,
                studentId: 'unknown',
                state: 'error',
                message: 'Misión no encontrada',
                retryable: false
            };
        }
        return record.status;
    },

    /**
     * Recupera el plan final (solo si state='ready').
     */
    getPlan: async (missionId: string): Promise<MissionPlan | null> => {
        const db = getDb();
        const record = db[missionId];
        if (!record || !record.plan) return null;
        return record.plan;
    },

    /**
     * Actualiza el estado de la misión
     */
    updateMissionState: async (missionId: string, newState: MissionBuildStatus['state']): Promise<void> => {
        const db = getDb();
        if (db[missionId]) {
            db[missionId].status.state = newState;
            saveDb(db);
        }
    }
};


// --- Backend Trigger ---

async function triggerBackendBuild(tempMissionId: string, request: MissionRequest) {
    // Simulamos progreso inicial visual
    updateStatus(tempMissionId, { progressPct: 10 });

    try {
        // Llamada al Backend Real
        const response = await fetch(`${API_BASE}/mission/build`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `Error ${response.status}`);
        }

        const plan: MissionPlan = await response.json();

        // Éxito
        updateStatus(tempMissionId, {
            state: 'ready',
            message: '¡Misión lista!',
            progressPct: 100
        }, plan);

    } catch (error: any) {
        console.error('Mission Gen Error:', error);
        updateStatus(tempMissionId, {
            state: 'error',
            message: 'Error al generar misión: ' + error.message,
            retryable: true,
            errorCode: 'API_FAIL'
        });
    }
}

function updateStatus(missionId: string, updates: Partial<MissionBuildStatus>, plan?: MissionPlan) {
    const db = getDb();
    if (db[missionId]) {
        db[missionId].status = { ...db[missionId].status, ...updates };
        if (plan) db[missionId].plan = plan;
        saveDb(db);
    }
}
