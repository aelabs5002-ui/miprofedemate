/**
 * Definición de roles permitidos en la aplicación.
 */
export type RolUsuario = 'Padre' | 'Alumno';

/**
 * Representación básica de un usuario.
 */
export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: RolUsuario;
}

/**
 * Estado de la sesión del usuario.
 */
export interface EstadoSesion {
  estaAutenticado: boolean;
  usuario: Usuario | null;
  token?: string;
}

/**
 * Configuración de la aplicación basada en el rol.
 */
export interface ConfiguracionApp {
  tema: 'claro' | 'oscuro';
  notificacionesHabilitadas: boolean;
}