import React, { useState, useRef, useEffect } from 'react';
import BaseLayout from '../components/BaseLayout';
import MensajeChat from '../components/MensajeChat';
import { Mensaje } from '../types/chat';
import { EstadoSesion } from '../types/sesionAprendizaje';
import { memoriaAlumno } from '../servicios/RepositorioMemoriaAlumno';

/**
 * Pantalla del Tutor con arquitectura de cierre atómico por referencias.
 */
const TutorScreen: React.FC = () => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [entrada, setEntrada] = useState('');
  const [estaEscribiendo, setEstaEscribiendo] = useState(false);
  const [estadoSesion, setEstadoSesion] = useState<EstadoSesion>('inicio');
  const [feedbackPedagogico, setFeedbackPedagogico] = useState('');
  
  // Estado para UI solamente
  const [erroresDetectadosEnSesion, setErroresDetectadosEnSesion] = useState<string[]>([]);
  const [huboErroresEnSesionActual, setHuboErroresEnSesionActual] = useState(false);

  // REFS: Fuente de verdad síncrona para la lógica pedagógica
  const huboErroresEnSesionRef = useRef<boolean>(false);
  const erroresDetectadosEnSesionRef = useRef<string[]>([]);
  const categoriaPrincipalDeSesionRef = useRef<string>("Algebra");
  
  const finalDelChatRef = useRef<HTMLDivElement>(null);
  const tiempoInicioSesion = useRef<Date>(new Date());

  useEffect(() => {
    return () => {
      if (memoriaAlumno.sesionActiva()) {
        memoriaAlumno.finalizarSesionSinConfirmar();
      }
    };
  }, []);

  const hacerScrollAlFinal = () => {
    finalDelChatRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (estadoSesion === 'en_progreso') {
      hacerScrollAlFinal();
    }
  }, [mensajes, estaEscribiendo, estadoSesion]);

  const detectarErroresSimple = (texto: string) => {
    const t = texto.toLowerCase();
    const patrones = [
      { clave: 'fracciones', cat: 'Aritmetica', desc: 'Dificultad con fracciones' },
      { clave: 'signos', cat: 'Algebra', desc: 'Confusión con ley de signos' },
      { clave: 'dividir', cat: 'Aritmetica', desc: 'Problemas con la división' },
      { clave: 'ecuacion', cat: 'Algebra', desc: 'Duda en despeje de ecuaciones' }
    ];

    patrones.forEach(p => {
      if (t.includes(p.clave)) {
        // Registro en repositorio histórico
        memoriaAlumno.registrarError({
          id: `err_${Date.now()}`,
          categoria: p.cat,
          descripcionCorta: p.desc,
          conteo: 1,
          ultimaVez: new Date()
        });

        // ACTUALIZACIÓN INMEDIATA DE REFS
        huboErroresEnSesionRef.current = true;
        categoriaPrincipalDeSesionRef.current = p.cat;
        if (!erroresDetectadosEnSesionRef.current.includes(p.cat)) {
          erroresDetectadosEnSesionRef.current.push(p.cat);
        }

        // Sincronización de UI
        setHuboErroresEnSesionActual(true);
        setErroresDetectadosEnSesion([...erroresDetectadosEnSesionRef.current]);
      }
    });
  };

  const iniciarSesion = () => {
    memoriaAlumno.iniciarSesion();
    
    // Resetear Refs
    huboErroresEnSesionRef.current = false;
    erroresDetectadosEnSesionRef.current = [];
    categoriaPrincipalDeSesionRef.current = "Algebra";
    
    // Resetear State
    setHuboErroresEnSesionActual(false);
    setErroresDetectadosEnSesion([]);
    setFeedbackPedagogico('');
    
    setEstadoSesion('en_progreso');
    tiempoInicioSesion.current = new Date();
    
    setMensajes([{
      id: 'msg_welcome',
      remitente: 'tutor',
      texto: '¡Hola! Soy tu tutor de Álgebra y Aritmética. ¿En qué puedo ayudarte hoy?',
      tipoMensaje: 'normal',
      timestamp: new Date()
    }]);
  };

  /**
   * FUNCIÓN ÚNICA DE CIERRE: Unifica lógica pedagógica y de guardado.
   */
  const cerrarSesion = () => {
    if (estaEscribiendo) return;
    
    setEstaEscribiendo(true);

    // Delay mínimo para simular análisis de cierre
    setTimeout(() => {
      const categoriaActual = categoriaPrincipalDeSesionRef.current;
      const tuvoErrores = huboErroresEnSesionRef.current;
      const listaErrores = erroresDetectadosEnSesionRef.current;

      // a) Actualizar progreso según desempeño real de la sesión
      memoriaAlumno.actualizarProgresoPorCierreDeSesion(categoriaActual, tuvoErrores);

      // b) Guardar resumen usando datos de las refs
      memoriaAlumno.guardarResumenSesion({
        idSesion: Date.now().toString(),
        tema: `Sesión de ${categoriaActual}`,
        fechaInicio: tiempoInicioSesion.current,
        fechaFin: new Date(),
        logros: [tuvoErrores ? 'Identificación de debilidades' : 'Lección completada'],
        erroresDetectados: [...listaErrores],
        recomendacionSiguientePaso: tuvoErrores ? 'Repasar los temas señalados.' : 'Continúa con el siguiente módulo.'
      });

      // c) Confirmar sesión en repositorio
      memoriaAlumno.finalizarSesionYConfirmar();

      // d) Configurar estado final
      const mensajeFeedback = tuvoErrores 
        ? `Hemos detectado dudas en ${categoriaActual}. Tu progreso se mantiene para reforzar estos puntos.`
        : `¡Excelente trabajo en ${categoriaActual}! Tu progreso ha subido +5%.`;
      
      setFeedbackPedagogico(mensajeFeedback);
      setEstaEscribiendo(false);
      setEstadoSesion('cierre');
    }, 800);
  };

  const enviarMensaje = (e: React.FormEvent) => {
    e.preventDefault();
    const texto = entrada.trim();
    if (!texto || estaEscribiendo) return;

    setMensajes(prev => [...prev, {
      id: Date.now().toString(),
      remitente: 'usuario',
      texto,
      tipoMensaje: 'normal',
      timestamp: new Date()
    }]);
    
    setEntrada('');
    detectarErroresSimple(texto);

    if (texto.toLowerCase().includes('gracias') || texto.toLowerCase().includes('entendi') || texto.toLowerCase().includes('entendí')) {
      cerrarSesion();
      return;
    }
    
    setEstaEscribiendo(true);
    setTimeout(() => {
      setMensajes(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        remitente: 'tutor',
        texto: 'Entiendo. Vamos a analizar este concepto juntos.',
        tipoMensaje: 'normal',
        timestamp: new Date()
      }]);
      setEstaEscribiendo(false);
    }, 1000);
  };

  if (estadoSesion === 'inicio') {
    return (
      <BaseLayout titulo="Tutor IA">
        <div style={estilos.centro}>
          <div style={estilos.tarjeta}>
            <div style={estilos.icono}>🧠</div>
            <h2 style={estilos.titulo}>Tutoría Inteligente</h2>
            <p style={estilos.texto}>Suma +5% completando sesiones sin errores nuevos.</p>
            <button onClick={iniciarSesion} style={estilos.boton}>Empezar ahora</button>
          </div>
        </div>
      </BaseLayout>
    );
  }

  if (estadoSesion === 'cierre') {
    return (
      <BaseLayout titulo="Resultados">
        <div style={estilos.centro}>
          <div style={estilos.tarjetaResumen}>
            <div style={estilos.icono}>📊</div>
            <h3 style={estilos.tituloFeedback}>Sesión Finalizada</h3>
            <div style={{
              ...estilos.feedbackBox,
              backgroundColor: huboErroresEnSesionActual ? '#FFF3CD' : '#D1E7DD',
              color: huboErroresEnSesionActual ? '#856404' : '#0F5132'
            }}>
              {feedbackPedagogico}
            </div>
            <button onClick={() => setEstadoSesion('inicio')} style={estilos.botonCierre}>Nueva tutoría</button>
          </div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout titulo="Tutor IA">
      <div style={estilos.chat}>
        <div style={estilos.headerAcciones}>
          <span style={estilos.tagTema}>{categoriaPrincipalDeSesionRef.current}</span>
          <button onClick={cerrarSesion} style={estilos.botonFinalizar} disabled={estaEscribiendo}>
            Finalizar tutoría
          </button>
        </div>
        <div style={estilos.lista}>
          {mensajes.map(m => <MensajeChat key={m.id} mensaje={m} />)}
          {estaEscribiendo && <div style={estilos.typing}>El Tutor está analizando...</div>}
          <div ref={finalDelChatRef} style={{ height: '30px' }} />
        </div>
        <form onSubmit={enviarMensaje} style={estilos.inputContainer}>
          <input
            type="text"
            placeholder="Dime tu duda matemática..."
            value={entrada}
            onChange={e => setEntrada(e.target.value)}
            style={estilos.input}
          />
          <button type="submit" style={estilos.send} disabled={!entrada.trim() || estaEscribiendo}>➤</button>
        </form>
      </div>
    </BaseLayout>
  );
};

const estilos = {
  centro: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  tarjeta: { backgroundColor: 'white', padding: '30px', borderRadius: '24px', textAlign: 'center' as const, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' },
  tarjetaResumen: { backgroundColor: 'white', padding: '30px', borderRadius: '24px', textAlign: 'center' as const, boxShadow: '0 12px 32px rgba(0,0,0,0.1)', maxWidth: '320px' },
  icono: { fontSize: '48px', marginBottom: '16px' },
  titulo: { fontSize: '20px', fontWeight: 'bold' as const, marginBottom: '12px' },
  tituloFeedback: { fontSize: '18px', fontWeight: 'bold' as const, marginBottom: '20px' },
  texto: { color: '#6C757D', marginBottom: '25px', fontSize: '14px', lineHeight: '1.5' },
  boton: { width: '100%', padding: '14px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold' as const },
  botonCierre: { width: '100%', padding: '12px', backgroundColor: '#F8F9FA', color: '#495057', border: '1px solid #DEE2E6', borderRadius: '12px', fontSize: '14px' },
  feedbackBox: { padding: '15px', borderRadius: '12px', fontSize: '13px', lineHeight: '1.4', marginBottom: '25px', textAlign: 'left' as const },
  chat: { height: '100%', display: 'flex', flexDirection: 'column' as const },
  headerAcciones: { padding: '10px 15px', borderBottom: '1px solid #F1F3F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  tagTema: { fontSize: '11px', fontWeight: 'bold' as const, color: '#007BFF', backgroundColor: '#E7F1FF', padding: '4px 10px', borderRadius: '12px' },
  botonFinalizar: { padding: '6px 14px', backgroundColor: '#FFF0F0', color: '#DC3545', border: '1px solid #FFDADA', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  lista: { flex: 1, overflowY: 'auto' as const, padding: '10px' },
  typing: { padding: '10px 20px', fontSize: '12px', color: '#007BFF', fontStyle: 'italic' },
  inputContainer: { padding: '15px', borderTop: '1px solid #F1F3F5', display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '10px 16px', borderRadius: '20px', border: '1px solid #DEE2E6', outline: 'none' },
  send: { width: '40px', height: '40px', borderRadius: '20px', border: 'none', backgroundColor: '#007BFF', color: 'white' }
};

export default TutorScreen;