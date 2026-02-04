import { buildMissionPlan, ContextInput } from './motorMision';
import { MissionRequest, MissionBuildStatus, MissionPlan } from '../types/missionTypes';

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
     * Inicia la creación de una misión (asíncrono).
     * Retorna estado 'creating' inmediato.
     */
    buildMissionAsync: async (request: MissionRequest): Promise<MissionBuildStatus> => {
        // 1. Deduplicación diaria: Buscar si ya existe para (studentId + dateKey)
        const db = getDb();
        const existingId = Object.keys(db).find(key => {
            const r = db[key];
            return r.request.studentId === request.studentId &&
                r.request.dateKey === request.dateKey &&
                r.status.state !== 'error'; // Si dio error, permitimos reintentar creando una nueva si se quiere, o reusar la fallida. 
            // Pero la logica general es: si ya hay una "activa" o "lista" para hoy, retornamos esa.
        });

        if (existingId) {
            console.log('Misión existente encontrada:', existingId);
            return db[existingId].status;
        }

        const missionId = `m-${Date.now()}`; // Generar ID único
        const initialStatus: MissionBuildStatus = {
            missionId,
            studentId: request.studentId,
            state: 'creating',
            message: request.type === 'task' ? 'Analizando tu tarea...' : 'Analizando tu memoria...',
            progressPct: 10
        };

        db[missionId] = {
            status: initialStatus,
            request,
            createdAt: Date.now()
        };
        saveDb(db);

        // Disparar proceso en "background"
        processMissionBackground(missionId, request);

        return initialStatus;
    },

    /**
     * Reintenta una misión fallida usando el request original.
     */
    retryMission: async (missionId: string): Promise<void> => {
        const db = getDb();
        const record = db[missionId];
        if (!record) {
            throw new Error('Misión no encontrada para reintentar');
        }

        // Reset status
        const newStatus: MissionBuildStatus = {
            ...record.status,
            state: 'creating',
            message: 'Reintentando...',
            progressPct: 10,
            retryable: false,
            errorCode: undefined
        };

        record.status = newStatus;
        saveDb(db);

        // Reiniciar proceso
        processMissionBackground(missionId, record.request);
    },

    /**
     * Consulta el estado actual (Polling).
     */
    checkStatus: async (missionId: string): Promise<MissionBuildStatus> => {
        const db = getDb();
        const record = db[missionId];
        if (!record) {
            // Si no existe, podría ser un error o expirado. 
            // Retornamos error genérico.
            return {
                missionId,
                studentId: 'unknown',
                state: 'error',
                message: 'Misión no encontrada o expirada',
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
     * Actualiza el estado de la misión (ej. al iniciar Tutor).
     */
    updateMissionState: async (missionId: string, newState: MissionBuildStatus['state']): Promise<void> => {
        updateStatus(missionId, { state: newState });
    }
};


// --- Background Simulator ---

async function processMissionBackground(missionId: string, request: MissionRequest) {
    // Fase 1: Análisis
    await delay(1500);

    // Simular error aleatorio (opcional, para probar flujo error)
    // if (Math.random() > 0.9) {
    //    updateStatus(missionId, { state: 'error', message: 'No pudimos leer el archivo.', errorCode: 'OCR_FAIL', retryable: true });
    //    return;
    // }

    if (request.type === 'task') {
        updateStatus(missionId, { message: 'Identificando ejercicios...', progressPct: 40 });
        await delay(1500);
        updateStatus(missionId, { message: 'Comprendiendo el tema...', progressPct: 70 });
        await delay(1500);
    } else {
        updateStatus(missionId, { message: 'Revisando tus temas recientes...', progressPct: 50 });
        await delay(1200);
    }

    // Fase 2: Construcción (llamada al motor)
    try {
        updateStatus(missionId, { message: 'Generando retos a tu medida...', progressPct: 90 });
        await delay(800);

        // Construir input para motor
        const contextInput: ContextInput = {
            observacion: request.input?.text
        };

        if (request.type === 'task') {
            // Simulamos OCR exitoso
            contextInput.tareaNombre = request.input?.fileUrl || 'archivo.pdf';
            contextInput.tareaTexto = 'Texto simulado extraído de la tarea...';
        }

        const plan = buildMissionPlan(request.studentId, { grade: '1sec', nEjercicios: 5 }, contextInput);

        // Forzar ID coincidente y asegurar consistencia
        plan.missionId = missionId;

        // Guardar resultado
        updateStatus(missionId, { state: 'ready', message: '¡Misión lista!', progressPct: 100 }, plan);

    } catch (e) {
        console.error(e);
        updateStatus(missionId, {
            state: 'error',
            message: 'Error interno al generar misión.',
            retryable: true,
            errorCode: 'ENGINE_FAIL'
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

function delay(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }
