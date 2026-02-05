/**
 * Define la identidad y preferencias de configuración del estudiante.
 */
export interface PerfilAlumno {
  idAlumno: string;
  nombre: string;
  grado?: string | number;
  rol: "Alumno";
  preferencias: {
    modoVozActivado: boolean;
    modoExplicacion: "paso_a_paso" | "resumen";
  };
}