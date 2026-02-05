/**
 * Tipos de datos extendidos para el sistema de tutoría pedagógica.
 */

export type Remitente = 'Tutor' | 'Alumno';
export type TipoMensaje = 'normal' | 'pista' | 'error';

export interface Mensaje {
  id: string;
  remitente: Remitente;
  texto: string;
  fecha: Date;
  tipoMensaje: TipoMensaje;
}