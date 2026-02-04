import { CognitiveEvent } from '../types/cognitiveEvent';
import { CCAService } from './CCAService';

const EVENTS_STORAGE_PREFIX = 'cca_events_v1_';
const MAX_EVENTS_LOG = 200;

export const CCAEventService = {
    /**
     * Registra un evento cognitivo y actualiza la CCA del alumno.
     */
    recordEvent: (event: CognitiveEvent): void => {
        // 1. Guardar en log de eventos (FIFO)
        const key = `${EVENTS_STORAGE_PREFIX}${event.alumnoId}`;
        let events: CognitiveEvent[] = [];
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                events = JSON.parse(stored);
            }
        } catch (e) {
            console.error('Error reading events log', e);
        }

        events.push(event);
        if (events.length > MAX_EVENTS_LOG) {
            events.shift(); // Remove oldest
        }
        localStorage.setItem(key, JSON.stringify(events));

        // 2. Actualizar CCA (Estadísticas Agregadas)
        const cca = CCAService.getOrCreateCCA(event.alumnoId);

        // Actualizar Resumen Reciente
        if (event.type === 'attempt_submitted') {
            cca.resumenReciente.totalEjercicios++;

            // Moving Average (Simple aproximación) para Tiempo Promedio
            if (event.timeMs && event.timeMs > 0) {
                // Si es el primer ejercicio
                if (cca.resumenReciente.totalEjercicios === 1) {
                    cca.resumenReciente.tiempoPromedio = event.timeMs;
                } else {
                    // Promedio móvil simple: (OldAvg * (N-1) + NewVal) / N
                    const n = cca.resumenReciente.totalEjercicios;
                    const oldAvg = cca.resumenReciente.tiempoPromedio;
                    cca.resumenReciente.tiempoPromedio = Math.round(((oldAvg * (n - 1)) + event.timeMs) / n);
                }
            }
        }

        if (event.type === 'attempt_correct') {
            cca.resumenReciente.correctos++;
        }

        if (event.type === 'attempt_incorrect') {
            cca.resumenReciente.incorrectos++;

            // Actualizar Errores Frecuentes
            if (event.errorTag) {
                const existingError = cca.erroresFrecuentes.find(e => e.errorTag === event.errorTag);
                if (existingError) {
                    existingError.conteo++;
                    existingError.ultimoVisto = Date.now();
                } else {
                    cca.erroresFrecuentes.push({
                        errorTag: event.errorTag,
                        conteo: 1,
                        ultimoVisto: Date.now()
                    });
                }
                // Ordenar por frecuencia desc
                cca.erroresFrecuentes.sort((a, b) => b.conteo - a.conteo);
            }
        }

        if (event.type === 'hint_used') {
            cca.resumenReciente.ayudasUsadas++;
        }

        // Actualizar Motores Usados
        if (event.motorId) {
            const existingMotor = cca.motoresUsados.find(m => m.motorId === event.motorId);
            if (existingMotor) {
                // Incrementar sesiones/uso (Simplificación: contador de interacciones por motor)
                existingMotor.sesiones++;
            } else {
                cca.motoresUsados.push({ motorId: event.motorId, sesiones: 1 });
            }
        }

        CCAService.saveCCA(cca);
    },

    /**
     * Obtiene los eventos recientes (para debug/análisis).
     */
    getRecentEvents: (alumnoId: string, limit: number = 50): CognitiveEvent[] => {
        const key = `${EVENTS_STORAGE_PREFIX}${alumnoId}`;
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                const events = JSON.parse(stored) as CognitiveEvent[];
                return events.slice(-limit).reverse(); // Newest first
            }
        } catch (e) {
            console.error('Error reading events log', e);
        }
        return [];
    }
};
