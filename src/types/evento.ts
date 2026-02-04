export interface EventoAprendizaje {
    tipo: 'ejercicio_completado' | 'sesion_iniciada' | 'sesion_finalizada' | 'mision_generada';
    userId: string;
    timestamp: number;
    payload: any;
}
