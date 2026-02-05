/**
 * Almacena el resultado consolidado de una sesión de tutoría específica.
 */
export interface SessionSummary {
  missionId: string;
  studentId: string;
  topic: string;
  sourceMotor: string;
  durationSec: number;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  hintsUsedTotal: number;
  mistakesByTag: Record<string, number>;
  topErrorTag: string;
  stepsCompleted: number;
  moodFinal: string;
  completedAt: string;
}

/**
 * Alias de compatibilidad para código legado que use ResumenSesion
 */
export type ResumenSesion = SessionSummary;