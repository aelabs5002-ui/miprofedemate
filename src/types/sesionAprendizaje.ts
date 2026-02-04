/**
 * Estructura de datos para gestionar el flujo pedagógico y el estado de una sesión.
 */
export type EstadoSesion = 'inicio' | 'en_progreso' | 'cierre';

export interface SesionAprendizaje {
  idSesion: string;
  tema: string;
  fechaInicio: Date;
  fechaFin: Date;
  logros: string[];
  erroresDetectados: string[]; // Errores históricos/acumulados
  recomendacionSiguientePaso: string;
  
  // Nuevos campos pedagógicos para control de sesión actual
  erroresDetectadosEnSesion: string[]; 
  huboErroresEnSesion: boolean;
}