export interface CartaCognitivaAlumno {
    alumnoId: string;
    grado: string;

    competencias: {
        competenciaId: string;
        nivel: number;          // 0–100
        dominada: boolean;
        ultimoIntento?: number; // timestamp
    }[];

    erroresFrecuentes: {
        errorTag: string;       // ej: "signos", "despeje", "fracciones"
        conteo: number;
        ultimoVisto: number;
    }[];

    motoresUsados: {
        motorId: string;        // ej: "A", "F"
        sesiones: number;
    }[];

    resumenReciente: {
        totalEjercicios: number;
        correctos: number;
        incorrectos: number;
        ayudasUsadas: number;
        tiempoPromedio: number;
    };

    ultimaActualizacion: number;
}
