import { PerfilAlumno } from '../tipos/perfilAlumno';
import { ProgresoAlumno } from '../tipos/progresoAlumno';
import { ErrorFrecuente } from '../tipos/errorFrecuente';
import { ResumenSesion } from '../tipos/resumenSesion';
import { EventoAprendizaje } from '../types/evento';
import { ParentalControls, DailyUsage } from '../tipos/parentalControls';

/**
 * Gestión de la persistencia y lógica de negocio para el progreso educativo.
 * Arquitectura EdTech para seguimiento de aprendizaje atómico.
 */
class RepositorioMemoriaAlumno {
  private CLAVE_PERFIL = 'mgx_perfil_alumno';
  private CLAVE_PROGRESO = 'mgx_progreso_alumno';
  private CLAVE_ERRORES = 'mgx_errores_frecuentes';
  private CLAVE_RESUMENES = 'mgx_resumenes_sesion';
  private CLAVE_SESION_ESTADO = 'mgx_sesion_estado';
  private CLAVE_SESION_DELTAS = 'mgx_sesion_deltas_por_categoria';
  private CLAVE_EVENTOS = 'mgx_eventos_aprendizaje';

  // Parental Controls Keys
  private CLAVE_PARENTAL = 'mgx_parental_controls_'; // suffix with studentId
  private CLAVE_DAILY_USAGE = 'mgx_daily_usage_';       // suffix with studentId_date

  /**
   * Gestión del Perfil del Alumno
   */
  obtenerPerfil(): PerfilAlumno | null {
    const datos = localStorage.getItem(this.CLAVE_PERFIL);
    return datos ? JSON.parse(datos) : null;
  }

  guardarPerfil(perfil: PerfilAlumno): void {
    localStorage.setItem(this.CLAVE_PERFIL, JSON.stringify(perfil));
  }

  /**
   * REGLA PEDAGÓGICA: Actualización de progreso por cierre de sesión.
   */
  actualizarProgresoPorCierreDeSesion(categoriaPrincipal: string, huboErroresEnSesion: boolean): void {
    if (!huboErroresEnSesion) {
      const progreso = this.obtenerProgreso();
      const claveCategoria = categoriaPrincipal as keyof typeof progreso.porcentajePorCategoria;

      if (progreso.porcentajePorCategoria.hasOwnProperty(claveCategoria)) {
        const valorActual = progreso.porcentajePorCategoria[claveCategoria] || 0;
        progreso.porcentajePorCategoria[claveCategoria] = Math.min(100, valorActual + 5);
        progreso.ultimaActualizacion = new Date();
        this.guardarProgreso(progreso);
      }
    }
  }

  /**
   * HERRAMIENTA DE PRUEBAS: Restablecer datos al estado inicial.
   */
  restablecerDatosDePrueba(): void {
    localStorage.removeItem(this.CLAVE_PERFIL);
    localStorage.removeItem(this.CLAVE_PROGRESO);
    localStorage.removeItem(this.CLAVE_ERRORES);
    localStorage.removeItem(this.CLAVE_RESUMENES);
    localStorage.removeItem(this.CLAVE_SESION_ESTADO);
    localStorage.removeItem(this.CLAVE_SESION_DELTAS);
  }

  /**
   * Gestión de Sesión Provisional
   */
  iniciarSesion(): void {
    localStorage.setItem(this.CLAVE_SESION_ESTADO, 'activa');
    const progresoHistorico = this.obtenerProgreso();
    const deltasIniciales: Record<string, number> = {};

    Object.keys(progresoHistorico.porcentajePorCategoria).forEach(categoria => {
      deltasIniciales[categoria] = 0;
    });

    localStorage.setItem(this.CLAVE_SESION_DELTAS, JSON.stringify(deltasIniciales));
  }

  sesionActiva(): boolean {
    return localStorage.getItem(this.CLAVE_SESION_ESTADO) === 'activa';
  }

  finalizarSesionYConfirmar(): void {
    localStorage.removeItem(this.CLAVE_SESION_ESTADO);
    localStorage.removeItem(this.CLAVE_SESION_DELTAS);
  }

  finalizarSesionSinConfirmar(): void {
    localStorage.removeItem(this.CLAVE_SESION_ESTADO);
    localStorage.removeItem(this.CLAVE_SESION_DELTAS);
  }

  /**
   * Gestión de Datos Históricos
   */
  obtenerProgreso(): ProgresoAlumno {
    const datos = localStorage.getItem(this.CLAVE_PROGRESO);
    if (!datos) {
      return {
        porcentajePorCategoria: {
          Algebra: 65,
          Geometria: 40,
          Aritmetica: 90,
          Estadistica: 20,
        },
        ultimaActualizacion: new Date()
      };
    }
    const progreso = JSON.parse(datos);
    return { ...progreso, ultimaActualizacion: new Date(progreso.ultimaActualizacion) };
  }

  guardarProgreso(progreso: ProgresoAlumno): void {
    localStorage.setItem(this.CLAVE_PROGRESO, JSON.stringify(progreso));
  }

  registrarError(errorEntrante: ErrorFrecuente): void {
    const datos = localStorage.getItem(this.CLAVE_ERRORES);
    const errores: ErrorFrecuente[] = datos ? JSON.parse(datos) : [];
    const indice = errores.findIndex(e => e.categoria === errorEntrante.categoria && e.descripcionCorta === errorEntrante.descripcionCorta);

    if (indice >= 0) {
      errores[indice].conteo += 1;
      errores[indice].ultimaVez = new Date();
    } else {
      errores.push({ ...errorEntrante, conteo: 1, ultimaVez: new Date() });
    }
    localStorage.setItem(this.CLAVE_ERRORES, JSON.stringify(errores));
  }

  guardarResumenSesion(resumen: ResumenSesion): void {
    // 1. Persistir Resumen de Sesión (LIFO limit 30)
    const datos = localStorage.getItem(this.CLAVE_RESUMENES);
    const resumenes: ResumenSesion[] = datos ? JSON.parse(datos) : [];
    resumenes.push(resumen);
    if (resumenes.length > 30) {
      resumenes.shift(); // Remove oldest
    }
    localStorage.setItem(this.CLAVE_RESUMENES, JSON.stringify(resumenes));

    // 2. Actualizar contadores de ErrorTags (Global Memory)
    if (resumen.mistakesByTag) {
      const errorKey = `memoria_errorTags_${resumen.studentId}`;
      const errorData = localStorage.getItem(errorKey);
      const globalErrors: Record<string, number> = errorData ? JSON.parse(errorData) : {};

      Object.entries(resumen.mistakesByTag).forEach(([tag, count]) => {
        globalErrors[tag] = (globalErrors[tag] || 0) + count;
      });
      localStorage.setItem(errorKey, JSON.stringify(globalErrors));
    }

    // 3. Actualizar Mastery/Progreso
    const masteryKey = `memoria_mastery_${resumen.studentId}`;
    const masteryData = localStorage.getItem(masteryKey);
    const masteryMap: Record<string, string> = masteryData ? JSON.parse(masteryData) : {};

    let newStatus = 'en_progreso';
    if (resumen.accuracy >= 0.85 && resumen.stepsCompleted >= 1) {
      newStatus = 'dominado';
    } else if (resumen.accuracy < 0.60 || (resumen.topErrorTag && resumen.topErrorTag !== 'none')) {
      newStatus = 'refuerzo';
    }
    // Solo actualizamos si "mejora" o si cae a refuerzo drásticamente (estrategia simple: overwrite)
    masteryMap[resumen.topic] = newStatus;
    localStorage.setItem(masteryKey, JSON.stringify(masteryMap));

    // 4. Registrar Mood Final
    const moodKey = `memoria_mood_${resumen.studentId}`;
    localStorage.setItem(moodKey, JSON.stringify({ mood: resumen.moodFinal, timestamp: Date.now() }));
  }

  listarResumenesSesionRecientes(limite: number = 5, studentId?: string): ResumenSesion[] {
    const datos = localStorage.getItem(this.CLAVE_RESUMENES);
    if (!datos) return [];
    const lista = JSON.parse(datos);
    // Filter by studentId if provided
    const filtrada = studentId ? lista.filter((s: any) => s.studentId === studentId) : lista;

    // Sort by completion time (newest first)
    return filtrada.sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, limite);
  }

  obtenerGlobalErrorTags(studentId: string): Record<string, number> {
    const errorKey = `memoria_errorTags_${studentId}`;
    const data = localStorage.getItem(errorKey);
    return data ? JSON.parse(data) : {};
  }

  obtenerMasteryMap(studentId: string): Record<string, string> {
    const masteryKey = `memoria_mastery_${studentId}`;
    const data = localStorage.getItem(masteryKey);
    return data ? JSON.parse(data) : {};
  }

  obtenerMoodReciente(studentId: string): { mood: string, timestamp: number } | null {
    const moodKey = `memoria_mood_${studentId}`;
    const data = localStorage.getItem(moodKey);
    return data ? JSON.parse(data) : null;
  }


  listarErroresFrecuentesOrdenadosPorConteo(): ErrorFrecuente[] {
    const datos = localStorage.getItem(this.CLAVE_ERRORES);
    if (!datos) return [];
    const lista = JSON.parse(datos);
    return lista.map((e: any) => ({ ...e, ultimaVez: new Date(e.ultimaVez) }))
      .sort((a: any, b: any) => b.conteo - a.conteo);
  }

  /**
   * Registro de Eventos de Aprendizaje (Mission Engine)
   */
  getEventos(userId: string): EventoAprendizaje[] {
    const datos = localStorage.getItem(this.CLAVE_EVENTOS);
    if (!datos) return [];
    try {
      const todos: EventoAprendizaje[] = JSON.parse(datos);
      // Filter by userId to ensure user isolation if supported
      return todos.filter(e => e.userId === userId);
    } catch (e) {
      console.warn("Error leyendo eventos:", e);
      return [];
    }
  }

  appendEvento(evento: EventoAprendizaje): void {
    const datos = localStorage.getItem(this.CLAVE_EVENTOS);
    const todos: EventoAprendizaje[] = datos ? JSON.parse(datos) : [];
    todos.push(evento);
    localStorage.setItem(this.CLAVE_EVENTOS, JSON.stringify(todos));
  }

  /**
   * Parental Controls & Usage Tracking
   */
  getParentalControls(studentId: string): ParentalControls {
    const key = `${this.CLAVE_PARENTAL}${studentId}`;
    const data = localStorage.getItem(key);
    if (!data) {
      // Default Controls
      return {
        enabled: true,
        dailyMinutesLimit: 60, // 1 hour default
        allowedDays: [0, 1, 2, 3, 4, 5, 6],
        voiceAllowed: true
      };
    }
    return JSON.parse(data);
  }

  setParentalControls(studentId: string, controls: ParentalControls): void {
    const key = `${this.CLAVE_PARENTAL}${studentId}`;
    localStorage.setItem(key, JSON.stringify(controls));
  }

  getDailyUsage(studentId: string): DailyUsage {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const key = `${this.CLAVE_DAILY_USAGE}${studentId}_${today}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : { minutesUsed: 0, lastUpdated: Date.now() };
  }

  addDailyUsageMinutes(studentId: string, deltaMinutes: number): void {
    const today = new Date().toISOString().split('T')[0];
    const key = `${this.CLAVE_DAILY_USAGE}${studentId}_${today}`;
    const current = this.getDailyUsage(studentId);

    const updated: DailyUsage = {
      minutesUsed: current.minutesUsed + deltaMinutes,
      lastUpdated: Date.now()
    };

    localStorage.setItem(key, JSON.stringify(updated));
  }
}

export const memoriaAlumno = new RepositorioMemoriaAlumno();