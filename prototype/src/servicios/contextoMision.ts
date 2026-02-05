/**
 * Servicio para gestionar el contexto de la misión (tareas, observaciones).
 * Se persiste en localStorage para mantenerlo entre recargas.
 */

export type ContextoMision = {
    tareaTexto?: string;
    tareaNombre?: string;
    observacion?: string;
    ts: number;
};

const getStorageKey = (userId: string) => `mgx_contexto_mision_${userId}`;

export const getContextoMision = (userId: string): ContextoMision | null => {
    try {
        const item = localStorage.getItem(getStorageKey(userId));
        if (item) {
            return JSON.parse(item) as ContextoMision;
        }
        return null;
    } catch (error) {
        console.error('Error leyendo contexto de misión:', error);
        return null;
    }
};

export const setContextoMision = (userId: string, ctx: ContextoMision): void => {
    try {
        localStorage.setItem(getStorageKey(userId), JSON.stringify(ctx));
    } catch (error) {
        console.error('Error guardando contexto de misión:', error);
    }
};

export const clearContextoMision = (userId: string): void => {
    try {
        localStorage.removeItem(getStorageKey(userId));
    } catch (error) {
        console.error('Error limpiando contexto de misión:', error);
    }
};
