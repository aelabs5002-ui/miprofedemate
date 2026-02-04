/**
 * Registra patrones de error detectados por la IA para reforzar el aprendizaje.
 */
export interface ErrorFrecuente {
  id: string;
  categoria: string;
  descripcionCorta: string;
  conteo: number;
  ultimaVez: Date;
}