export interface Ejercicio {
  id: string;
  enunciado: string;
  respuestaEsperada: string;
  pista: string;
  tema: string;
}

export interface MissionPlan {
  missionId: string;
  grade: string;
  topic: string;
  exercises: Ejercicio[];
  origin: 'auto' | 'observacion' | 'tarea' | 'tarea+observacion';
  difficulty?: number; // 1-5
  nEjercicios?: number;
  recommendedMotorId?: string;
  focusErrorTags?: string[];
  context?: {
    observacion?: string;
    tareaNombre?: string;
    tareaTexto?: string;
    createdAt: number;
  };
}
