import { CartaCognitivaAlumno } from '../types/ccaTypes';

const CCA_STORAGE_PREFIX = 'cca_v1_';

export const CCAService = {
    /**
     * Obtiene la CCA del alumno desde localStorage.
     * Si no existe, crea una nueva con valores por defecto.
     */
    getOrCreateCCA: (alumnoId: string, grado: string = '1sec'): CartaCognitivaAlumno => {
        const key = `${CCA_STORAGE_PREFIX}${alumnoId}`;
        const stored = localStorage.getItem(key);

        if (stored) {
            try {
                return JSON.parse(stored) as CartaCognitivaAlumno;
            } catch (e) {
                console.error('Error parsing CCA from storage, creating new one.', e);
            }
        }

        // Crear nueva CCA por defecto
        const newCCA: CartaCognitivaAlumno = {
            alumnoId,
            grado,
            competencias: [],
            erroresFrecuentes: [],
            motoresUsados: [],
            resumenReciente: {
                totalEjercicios: 0,
                correctos: 0,
                incorrectos: 0,
                ayudasUsadas: 0,
                tiempoPromedio: 0
            },
            ultimaActualizacion: Date.now()
        };

        localStorage.setItem(key, JSON.stringify(newCCA));
        return newCCA;
    },

    /**
     * Obtiene la CCA si existe, o null si no.
     */
    getCCA: (alumnoId: string): CartaCognitivaAlumno | null => {
        const key = `${CCA_STORAGE_PREFIX}${alumnoId}`;
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                return JSON.parse(stored) as CartaCognitivaAlumno;
            } catch (e) {
                return null;
            }
        }
        return null;
    },

    /**
     * Guarda la CCA actualizada en localStorage.
     */
    saveCCA: (cca: CartaCognitivaAlumno): void => {
        const key = `${CCA_STORAGE_PREFIX}${cca.alumnoId}`;
        cca.ultimaActualizacion = Date.now();
        localStorage.setItem(key, JSON.stringify(cca));
    },

    /**
     * Resetea la CCA del alumno (útil para debug).
     */
    resetCCA: (alumnoId: string): void => {
        const key = `${CCA_STORAGE_PREFIX}${alumnoId}`;
        localStorage.removeItem(key);
    }
};
