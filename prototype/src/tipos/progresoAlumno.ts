/**
 * Representa el dominio del conocimiento del alumno en diferentes áreas.
 */
export interface ProgresoAlumno {
  porcentajePorCategoria: {
    Algebra: number;
    Geometria: number;
    Aritmetica: number;
    Estadistica: number;
  };
  ultimaActualizacion: Date;
}