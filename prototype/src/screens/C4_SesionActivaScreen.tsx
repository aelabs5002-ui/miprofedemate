import React, { useState, useEffect, useRef } from 'react';
import { CCAEventService } from '../servicios/CCAEventService';
import { detectErrorTag } from '../servicios/ErrorTagger';
import { SYSTEM_PROMPT_TUTOR } from '../data/tutorPrompt';
import { getTutorFeedback } from '../utils/tutorApi';
import { memoriaAlumno } from '../servicios/RepositorioMemoriaAlumno';
import { edgeApi } from '../servicios/edgeApi';
import MathKeyboard from '../components/MathKeyboard';
import { MissionPlan } from '../types/missionTypes';

interface C4SesionActivaScreenProps {
  alVolver: () => void;
  plan: MissionPlan;
  userId: string;
}

interface Intento {
  ejercicioId: string;
  respuesta: string;
  correcto: boolean;
  ts: number;
}

interface EventoTutor {
  missionId: string;
  stepId: string;
  turnType: "evaluate" | "hint" | "scaffold" | "advance" | "close";
  isCorrect: boolean | null;
  errorTag: string | null;
  hintsUsedDelta: 0 | 1;
  recommendNext: "retry" | "next_step" | "refuerzo" | "close";
  moodGuess: "normal" | "frustrado" | "confiado" | "cansado";
  voiceMode: "text" | "voice_disabled";
}

interface SessionStats {
  sessionStartTs: number;
  totalAttempts: number;
  correctAttempts: number;
  hintsUsedTotal: number;
  mistakesByTag: Record<string, number>;
  stepsCompleted: number;
  lastMood: string;
  lastDifficultyLevel: number;
}

const parseTutorResponse = (fullText: string): { message: string, event: EventoTutor | null } => {
  const lines = fullText.split('\n');
  let eventLineIndex = -1;

  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (line.startsWith('{') && line.endsWith('}')) {
      eventLineIndex = i;
      break;
    }
  }

  if (eventLineIndex !== -1) {
    try {
      const event = JSON.parse(lines[eventLineIndex]);
      if (typeof event === 'object' && event !== null) {
        const message = lines.slice(0, eventLineIndex).join('\n').trim();
        return { message, event: event as EventoTutor };
      }
    } catch (e) {
      console.warn("Error parseando EVENTO_JSON del tutor:", e);
    }
  }

  return { message: fullText, event: null };
};

const C4_SesionActivaScreen: React.FC<C4SesionActivaScreenProps> = ({ alVolver, plan, userId }) => {
  // Use mission_steps from Unified Type. Filter for exercises.
  const ejercicios = plan.mission_steps?.filter(s => s.type === 'exercise') || [];

  const [indiceActual, setIndiceActual] = useState(0);
  const [respuestaUsuario, setRespuestaUsuario] = useState('');
  const [cargando, setCargando] = useState(false);
  const [backendDisponible, setBackendDisponible] = useState(true);
  const [feedback, setFeedback] = useState<{ tipo: 'correcto' | 'incorrecto' | null, mensaje: string }>({ tipo: null, mensaje: '' });
  const [mostrarPista, setMostrarPista] = useState(false);
  const [nextAction, setNextAction] = useState('retry');
  const [numeroIntento, setNumeroIntento] = useState(1);
  const [intentos, setIntentos] = useState<Intento[]>([]);
  const [sessionFinished, setSessionFinished] = useState<any>(null);

  // Parental Controls State
  const [parentalBlocked, setParentalBlocked] = useState<string | null>(null);

  // --- NEW: Refs & State for Keyboard/Canvas ---
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null); // For recentering
  const [zoom, setZoom] = useState(1.0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  // ---------------------------------------------

  const [controls] = useState(() => memoriaAlumno.getParentalControls(userId));

  // Checks on Mount
  useEffect(() => {
    if (controls.enabled) {
      // 1. Day Check
      const today = new Date().getDay(); // 0-6
      if (!controls.allowedDays.includes(today)) {
        setParentalBlocked("Hoy no es un día permitido para practicar. ¡Disfruta tu descanso!");
        return;
      }

      // 2. Time Limit Check
      const usage = memoriaAlumno.getDailyUsage(userId);
      if (usage.minutesUsed >= controls.dailyMinutesLimit) {
        setParentalBlocked(`Has alcanzado tu límite diario de ${controls.dailyMinutesLimit} minutos. ¡Vuelve mañana!`);
        return;
      }
    }
  }, [controls, userId]);

  // Start Session on Backend
  useEffect(() => {
    const startBackendSession = async () => {
      try {
        await edgeApi.sessionStart(plan.id, userId);
      } catch (e) {
        console.error("Error starting session:", e);
        setBackendDisponible(false);
      }
    };
    startBackendSession();
  }, [plan.id, userId]);

  // --- Enforcement State ---
  const [hintsUsedInStep, setHintsUsedInStep] = useState(0);
  const [voiceUsedSeconds, setVoiceUsedSeconds] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(controls.enabled ? controls.voiceAllowed : true);

  // --- Derived Enforcement Constants ---
  // No longer have direct access to 'durationTargetMin' on MissionPlan in unified type
  // Defaulting for MVP or need to add to unified type if critical
  const durationTargetMin: number = 15;
  const rules = {};
  const voiceCapSeconds = Math.round(durationTargetMin * 60 * 0.20);

  // Check content.difficulty or default
  const stepMaxHints = 2;
  const policyMax = controls.enabled && controls.maxHintsPerStepOverride
    ? controls.maxHintsPerStepOverride
    : ((rules as any).helpPolicy?.maxHintsPerStep ?? 2);
  const effectiveMaxHints = Math.min(stepMaxHints, policyMax, 2);
  const pistasAgotadas = hintsUsedInStep >= effectiveMaxHints;

  const statsRef = useRef<SessionStats>({
    sessionStartTs: Date.now(),
    totalAttempts: 0,
    correctAttempts: 0,
    hintsUsedTotal: 0,
    mistakesByTag: {},
    stepsCompleted: 0,
    lastMood: 'normal',
    lastDifficultyLevel: 1
  });

  const startTimeRef = useRef(Date.now());

  const ejercicioActual = ejercicios[indiceActual] || {
    content: { question: 'Fin de la misión', correctAnswer: '' },
    id: 'end',
    status: 'bloqueado'
  };
  const totalEjercicios = ejercicios.length;

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [indiceActual]);

  const finalizeSession = (reason: "close" | "user_exit" | "timeout") => {
    const stats = statsRef.current;
    const durationSec = (Date.now() - stats.sessionStartTs) / 1000;
    const accuracy = stats.totalAttempts > 0 ? stats.correctAttempts / stats.totalAttempts : 0;

    let topErrorTag = 'none';
    let maxCount = 0;
    Object.entries(stats.mistakesByTag).forEach(([tag, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topErrorTag = tag;
      }
    });

    const summary = {
      missionId: plan.id,
      studentId: userId,
      topic: "Entrenamiento", // logic needed to resolve topic?
      sourceMotor: plan.origin || 'ai',
      durationSec,
      totalAttempts: stats.totalAttempts,
      correctAttempts: stats.correctAttempts,
      accuracy,
      hintsUsedTotal: stats.hintsUsedTotal,
      mistakesByTag: stats.mistakesByTag,
      topErrorTag,
      stepsCompleted: stats.stepsCompleted,
      moodFinal: stats.lastMood,
      completedAt: new Date().toISOString()
    };

    // Save usage minutes
    if (controls.enabled) {
      const minutesUsed = Math.ceil(durationSec / 60);
      memoriaAlumno.addDailyUsageMinutes(userId, minutesUsed);
    }

    import('../servicios/RepositorioMemoriaAlumno').then(({ memoriaAlumno }) => {
      memoriaAlumno.guardarResumenSesion(summary);
    });

    if (reason === 'close' || reason === 'user_exit') {
      if (stats.totalAttempts > 0) {
        setSessionFinished({ accuracy, topErrorTag, steps: stats.stepsCompleted });
      } else {
        alVolver();
      }
    } else {
      alVolver();
    }
  };

  const validarRespuestaLocal = (respuesta: string) => {
    if (!ejercicioActual?.content?.correctAnswer) return false;
    return respuesta.trim().toLowerCase() === ejercicioActual.content.correctAnswer.trim().toLowerCase();
  };

  const usarValidacionLocal = (respuesta: string, baseEvent?: any) => {
    const esCorrecto = validarRespuestaLocal(respuesta);

    const evtContext = baseEvent || {
      alumnoId: userId,
      missionId: plan.id,
      motorId: 'F', // Default for now
      competenciaId: 'general', // Default
      timeMs: 0,
      timestamp: Date.now()
    };

    let errorTagCalculado: string | undefined = undefined;
    if (!esCorrecto) {
      errorTagCalculado = detectErrorTag({
        userAnswer: respuesta,
        expectedAnswer: ejercicioActual.content?.correctAnswer || '',
        prompt: ejercicioActual.content?.question || ''
      });
    }

    const stats = statsRef.current;
    stats.totalAttempts += 1;
    if (esCorrecto) stats.correctAttempts += 1;
    if (errorTagCalculado) {
      stats.mistakesByTag[errorTagCalculado] = (stats.mistakesByTag[errorTagCalculado] || 0) + 1;
    }

    CCAEventService.recordEvent({
      ...evtContext,
      type: esCorrecto ? 'attempt_correct' : 'attempt_incorrect',
      correct: esCorrecto,
      errorTag: errorTagCalculado
    });

    const nuevoIntento: Intento = {
      ejercicioId: ejercicioActual.id,
      respuesta: respuesta,
      correcto: esCorrecto,
      ts: Date.now()
    };
    setIntentos(prev => [...prev, nuevoIntento]);

    if (esCorrecto) {
      setFeedback({ tipo: 'correcto', mensaje: '✅ ¡Excelente! Tu respuesta es correcta.' });
      setNextAction('next');
      setMostrarPista(false);
      stats.stepsCompleted += 1;
    } else {
      setFeedback({ tipo: 'incorrecto', mensaje: '🧠 El error es útil para aprender. Intenta de nuevo.' });
      setNextAction('retry');
      setMostrarPista(true);
      setNumeroIntento(prev => prev + 1);
      startTimeRef.current = Date.now();
    }
  };

  const manejarEnviar = async (mensajeOverride?: string) => {
    const textoAEnviar = mensajeOverride || respuestaUsuario.trim();
    if (!textoAEnviar) return;

    if (!mensajeOverride) {
      // Only update input if it's a manual entry, otherwise keep current text
      // Actually for now let's just use what's in the box if no override
    }

    const timeMs = Date.now() - startTimeRef.current;
    const baseEvent = {
      alumnoId: userId,
      missionId: plan.id,
      motorId: 'F',
      competenciaId: 'general',
      timestamp: Date.now(),
      timeMs
    };

    if (!mensajeOverride) {
      CCAEventService.recordEvent({
        ...baseEvent,
        type: 'attempt_submitted',
        hintUsed: mostrarPista
      });
    }

    setCargando(true);

    if (backendDisponible) {
      try {
        // Use Edge Function for Answer
        const stepId = ejercicioActual.id; // Correct ID from MissionStep

        const response = await edgeApi.answerSubmit(plan.id, stepId, userId, textoAEnviar);

        if (response.isCorrect) {
          setFeedback({ tipo: 'correcto', mensaje: response.feedback || '¡Correcto!' });
          setNextAction('next');
          setMostrarPista(false);
          statsRef.current.correctAttempts += 1;
          statsRef.current.stepsCompleted += 1;
        } else {
          setFeedback({ tipo: 'incorrecto', mensaje: response.feedback || 'Incorrecto' });
          setNextAction('retry');
          setMostrarPista(true);
          setNumeroIntento(prev => prev + 1);
        }

        // Check mission complete
        if (response.missionComplete) {
          // Can trigger finish
          setSessionFinished({ accuracy: 1, topErrorTag: 'none', steps: statsRef.current.stepsCompleted });
        }

        // Record locally for stats/charts
        const nuevoIntento: Intento = {
          ejercicioId: ejercicioActual.id,
          respuesta: textoAEnviar,
          correcto: response.isCorrect,
          ts: Date.now()
        };
        setIntentos(prev => [...prev, nuevoIntento]);

      } catch (error) {
        console.error("Backend Answer Error:", error);
        setBackendDisponible(false);
        // Fallback to local
        usarValidacionLocal(textoAEnviar, baseEvent);
      }
    } else {
      usarValidacionLocal(textoAEnviar, baseEvent);
    }

    setCargando(false);
  };

  const manejarSiguiente = () => {
    if (indiceActual < totalEjercicios - 1) {
      setIndiceActual(prev => prev + 1);
      setRespuestaUsuario('');
      setFeedback({ tipo: null, mensaje: '' });
      setMostrarPista(false);
      setNumeroIntento(1);
      setHintsUsedInStep(0);
      setNextAction('retry');
    } else {
      finalizeSession('close');
    }
  };

  // --- NEW: Zoom & Recenter Handlers ---
  const handleZoomIn = () => setZoom(z => Math.min(1.4, z + 0.1));
  const handleZoomOut = () => setZoom(z => Math.max(0.8, z - 0.1));

  const handleRecenter = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  // -------------------------------------

  const handlePistaClick = () => {
    if (pistasAgotadas) {
      // Mostrar estrategia local
      alert("Estrategia: 1) Lee despacio. 2) Identifica datos. 3) Verifica signos.");
      CCAEventService.recordEvent({
        alumnoId: userId,
        missionId: plan.id,
        competenciaId: 'general',
        motorId: 'F',
        timeMs: Date.now() - startTimeRef.current,
        timestamp: Date.now(),
        type: 'help_limit_reached'
      } as any);
    } else {
      // Pedir pista al tutor
      manejarEnviar("Dame una pista");
    }
  };

  if (sessionFinished) {
    return (
      <div style={estilos.contenedorFull}>
        <div style={estilos.bgGrid} />
        <div style={estilos.tarjetaEjercicio}> // Reusing main card style
          <h2 style={{ ...estilos.tituloEjercicio, textAlign: 'center' }}>¡Sesión Terminada!</h2>
          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎉</div>
            <p>Has completado {sessionFinished.steps} ejercicios.</p>
            <p>Precisión: {(sessionFinished.accuracy * 100).toFixed(0)}%</p>
            {sessionFinished.topErrorTag !== 'none' && (
              <p style={{ color: '#ff6b6b', marginTop: '10px' }}>
                Ojo con: {sessionFinished.topErrorTag}. ¡Sigue practicando!
              </p>
            )}
          </div>
          <button style={estilos.botonSiguiente} onClick={alVolver}>
            Volver al Tablero
          </button>
        </div>
      </div>
    );
  }

  if (parentalBlocked) {
    return (
      <div style={estilos.contenedorFull}>
        <div style={estilos.bgGrid} />
        <div style={{ ...estilos.tarjetaEjercicio, margin: '20px' }}>
          <h2 style={{ ...estilos.tituloEjercicio, textAlign: 'center' }}>🛡️ Tiempo de descanso</h2>
          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>🛑</div>
            <p style={{ fontSize: '18px', color: '#E0FFF0' }}>{parentalBlocked}</p>
          </div>
          <button style={estilos.botonSiguiente} onClick={alVolver}>
            Volver al Tablero
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = ((indiceActual + (nextAction === 'next' ? 1 : 0)) / totalEjercicios) * 100;

  return (
    <div style={estilos.contenedorFull}>
      <style>
        {`
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: rgba(8, 16, 29, 0.5); }
          ::-webkit-scrollbar-thumb { background: rgba(0, 254, 156, 0.3); border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: rgba(0, 254, 156, 0.6); }
        `}
      </style>
      {/* --- NEW TOP INPUT BAR (Sticky) --- */}
      <div style={estilos.topInputBar}>
        <div style={estilos.inputContainer}>
          <button style={estilos.inputIconBtn}>+</button>
          <input
            ref={inputRef} // Input connected to keyboard
            type="text"
            value={respuestaUsuario}
            onChange={(e) => setRespuestaUsuario(e.target.value)}
            onFocus={() => setKeyboardVisible(true)}
            onBlur={() => setTimeout(() => setKeyboardVisible(false), 150)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && nextAction !== 'next' && !cargando) {
                manejarEnviar();
              }
            }}
            style={estilos.mainInput}
            placeholder="Escribe tu respuesta..."
            disabled={nextAction === 'next' || cargando}
          />
          {nextAction === 'next' ? (
            <button onClick={manejarSiguiente} style={estilos.sendButtonSuccess}>
              ➜
            </button>
          ) : (
            <button
              onClick={() => manejarEnviar()}
              disabled={cargando}
              style={estilos.sendButton}
            >
              {cargando ? '...' : '⬆'}
            </button>
          )}
        </div>
      </div>
      {/* ---------------------------------- */}

      {/* Main Content Area */}
      <main
        style={{
          ...estilos.contenidoPrincipal,
          paddingBottom: keyboardVisible ? '40vh' : '220px', // Dynamic safe area
          paddingTop: '80px', // Space for top bar
        }}
        ref={scrollContainerRef} // Attached for recenter logic
      >
        {/* Visual Zoom Wrapper: Applies Scale but layout remains flow-based (1200px) */}
        <div style={{
          width: '100%',
          minHeight: '1200px', // Matches the card minHeight to ensure wrapper grows
          display: 'flex',
          justifyContent: 'center',
          transform: `scale(${zoom})`,
          transformOrigin: 'top center',
          transition: 'transform 0.2s ease-out'
        }}>
          {/* Absolute Decorative Elements (Trees) - Optional/Simplified for react inline */}
          {/* We skip complex absolute trees to keep code clean, focusing on the grid and content */}

          {/* Floating UI: Minimap (Top Right) */}
          <div style={estilos.minimapContainer}>
            <div style={estilos.minimapContent}>
              <div style={estilos.minimapGrid} />
              <div style={estilos.minimapRect} />
            </div>
          </div>

          {/* Floating UI: Zoom (Bottom Right) */}
          <div style={estilos.zoomContainer}>
            <div style={estilos.zoomControls}>
              <button style={estilos.zoomBtn} onClick={handleZoomIn}>+</button>
              <button style={estilos.zoomBtn} onClick={handleZoomOut}>-</button>
            </div>
            <button style={estilos.focusBtn} onClick={handleRecenter}>
              {/* Target / Recenter Icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.5" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
                <path d="M12 2V6M12 18V22M2 12H6M18 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Exercise Card / Canvas */}
          <div style={estilos.tarjetaEjercicio}>
            {/* Context/Badge */}
            {!backendDisponible && <div style={estilos.badgeOffline}>OFFLINE</div>}
            {plan.context && (plan.context.observacion || plan.context.tareaNombre) && (
              <div style={estilos.contextoBadge}>Contexto: {plan.context.observacion || plan.context.tareaNombre}</div>
            )}

            <h2 style={estilos.tituloEjercicio}>Ejercicio {indiceActual + 1}</h2>

            {/* Enunciado Content */}
            <div style={estilos.enunciadoBox}>
              <p style={estilos.enunciadoTexto}>{ejercicioActual.content?.question}</p>
            </div>

            {/* Visual Placeholder for Geometry (Icon) */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
              <div style={{ fontSize: '60px', opacity: 0.8 }}>📐</div>
            </div>

          </div>

        </div> {/* End Zoom Wrapper */}
      </main>

      {/* Footer / Bottom Sheet Interface */}
      <footer style={estilos.footer}>
        <div style={estilos.bottomPanelWrapper}>
          {/* Feedback Row */}
          <div style={estilos.feedbackRow}>
            <div style={estilos.avatarWrapper}>
              <div style={estilos.avatar} /> {/* Placeholder for Tutor Avatar */}
            </div>
            <div style={estilos.feedbackBubble}>
              {feedback.mensaje ? (
                <span style={{ color: feedback.tipo === 'correcto' ? '#00FE9C' : '#FFD700' }}>
                  {feedback.mensaje}
                </span>
              ) : (
                <span style={{ color: '#F0F2F3', opacity: 0.9 }}>
                  Fíjate en el ejercicio. {hintsUsedInStep > 0 ? 'Revisa la pista.' : 'Tú puedes.'}
                </span>
              )
              }
            </div>
          </div>

          {/* Action Buttons (Hints) */}
          <div style={estilos.actionsRow}>
            {nextAction !== 'next' && (
              <button
                onClick={handlePistaClick}
                disabled={cargando}
                style={estilos.actionButton}
              >
                💡 {pistasAgotadas ? 'Estrategia' : 'Dame una pista'}
              </button>
            )}
            <button style={estilos.actionButton}>❓ ¿Cómo resuelvo?</button>
          </div>

          {/* Stats Tiny Footer */}
          <div style={estilos.statsRow}>
            <span style={{ marginRight: '10px' }}>🎤 {voiceEnabled && voiceUsedSeconds < voiceCapSeconds ? `${voiceUsedSeconds}/${voiceCapSeconds}s` : 'Off'}</span>
            <span>Mood: {statsRef.current.lastMood}</span>
          </div>
        </div>
      </footer>

      {/* Keyboard Layer */}
      <MathKeyboard
        visible={keyboardVisible}
        inputRef={inputRef as React.RefObject<HTMLInputElement>}
        onEnter={() => manejarEnviar()}
        onClose={() => setKeyboardVisible(false)}
      />
    </div>
  );
};

const estilos = {
  contenedorFull: {
    height: '100%',
    width: '100%',
    backgroundColor: '#08101D', // FORCE DARK NAVY
    color: '#F0F2F3',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'relative' as const,
    overflow: 'hidden',
    fontFamily: '"Space Grotesk", sans-serif',
  },
  topInputBar: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    padding: '12px 16px',
    backgroundColor: '#0A1525', // Slightly lighter navy
    borderBottom: '1px solid rgba(0, 254, 156, 0.2)', // Subtle Neon Border
    display: 'flex',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
  },
  bgGrid: {
    position: 'absolute' as const, // Fixed background
    top: 0,
    left: 0,
    right: 0,
    bottom: 0, // Covers entire containerFull
    backgroundImage: `
      linear-gradient(0deg, transparent 24%, rgba(0, 255, 156, 0.05) 25%, rgba(0, 255, 156, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 156, 0.05) 75%, rgba(0, 255, 156, 0.05) 76%, transparent 77%, transparent),
      linear-gradient(90deg, transparent 24%, rgba(0, 255, 156, 0.05) 25%, rgba(0, 255, 156, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 156, 0.05) 75%, rgba(0, 255, 156, 0.05) 76%, transparent 77%, transparent)
      `,
    backgroundSize: '40px 40px',
    pointerEvents: 'none' as const,
    zIndex: 0,
  },
  header: {
    height: '64px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    zIndex: 10,
    background: 'linear-gradient(to bottom, #0F3030 0%, transparent 100%)',
  },
  iconButton: {
    background: 'none',
    border: 'none',
    color: '#E0FFF0',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    margin: '0 20px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
  },
  headerTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    color: '#00FF9C',
    opacity: 0.8,
    marginBottom: '4px',
    letterSpacing: '0.2em',
  },
  progressBarContainer: {
    height: '4px',
    width: '100%',
    backgroundColor: 'rgba(224, 255, 240, 0.1)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00FF9C',
    boxShadow: '0 0 8px #00FF9C',
    transition: 'width 0.3s ease',
  },
  contenidoPrincipal: {
    flex: 1,
    height: '100%',
    position: 'relative' as const,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '24px 16px', // Added padding around card behavior
    paddingTop: '90px', // More space for top bar
    zIndex: 5,
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
    backgroundColor: '#08101D', // Neutral background matching body

    // Infinite Grid merged here for continuity
    // Grid Removed from here, moved to Card
  },
  tarjetaEjercicio: {
    width: '100%',
    maxWidth: '390px',
    minHeight: '600px', // Self contained height
    backgroundColor: '#0F3030', // Deep Green Canvas Background
    borderRadius: '24px', // ROUNDED CARD
    overflow: 'hidden', // CLIP CONTENT
    position: 'relative' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '24px',
    paddingTop: '60px',
    paddingBottom: '200px', // Space for internal scrolling
    boxShadow: '0 0 20px rgba(0, 254, 156, 0.1), 0 0 0 1px rgba(0, 254, 156, 0.1)', // Neon Glow
    // Grid Background Internal to Card
    backgroundImage: `
      linear-gradient(0deg, transparent 24%, rgba(0, 255, 156, 0.05) 25%, rgba(0, 255, 156, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 156, 0.05) 75%, rgba(0, 255, 156, 0.05) 76%, transparent 77%, transparent),
      linear-gradient(90deg, transparent 24%, rgba(0, 255, 156, 0.05) 25%, rgba(0, 255, 156, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 255, 156, 0.05) 75%, rgba(0, 255, 156, 0.05) 76%, transparent 77%, transparent)
    `,
    backgroundSize: '40px 40px',
    backgroundAttachment: 'local',
  },
  tituloEjercicio: {
    position: 'absolute' as const,
    top: '20px',
    left: 0,
    right: 0,
    fontSize: '12px',
    fontWeight: '600' as const,
    color: '#00FF9C',
    opacity: 0.6,
    textAlign: 'center' as const,
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
  },
  enunciadoBox: {
    marginBottom: '24px',
    textAlign: 'center' as const,
    padding: '0 10px',
    marginTop: '40px', // Space for title
  },
  enunciadoTexto: {
    fontSize: '20px',
    fontWeight: '500' as const,
    color: '#E0FFF0',
    lineHeight: '1.6',
    textAlign: 'center' as const,
    maxWidth: '320px', // Prevent wide stretching
    margin: '0 auto',
    whiteSpace: 'pre-wrap' as const, // Preserve intentional breaks
    wordBreak: 'break-word' as const, // Prevent overflow
  },
  minimapContainer: {
    position: 'absolute' as const,
    top: '20px',
    right: '20px',
    width: '80px',
    height: '60px',
    zIndex: 20,
  },
  minimapContent: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(15, 30, 30, 0.8)',
    border: '1px solid rgba(0, 255, 156, 0.4)',
    borderRadius: '8px',
    position: 'relative' as const,
    boxShadow: '0 0 10px rgba(0, 255, 156, 0.1)',
    overflow: 'hidden',
  },
  minimapGrid: {
    position: 'absolute' as const,
    inset: 0,
    backgroundImage: 'linear-gradient(0deg, rgba(0,255,156,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,156,0.2) 1px, transparent 1px)',
    backgroundSize: '8px 8px',
    opacity: 0.3,
  },
  minimapRect: {
    position: 'absolute' as const,
    top: '25%',
    left: '25%',
    width: '50%',
    height: '50%',
    border: '1px solid #00FF9C',
    backgroundColor: 'rgba(0, 255, 156, 0.1)',
  },
  zoomContainer: {
    position: 'absolute' as const,
    bottom: '30px', // Just above bottom edge of canvas area
    right: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    alignItems: 'center',
    zIndex: 20,
  },
  zoomControls: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    backgroundColor: 'rgba(15, 30, 30, 0.8)',
    padding: '6px',
    borderRadius: '30px',
    border: '1px solid rgba(0, 255, 156, 0.2)',
  },
  zoomBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    border: '1px solid rgba(0, 255, 156, 0.3)',
    color: '#00FF9C',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  focusBtn: {
    width: '48px',
    height: '48px',
    borderRadius: '16px',
    backgroundColor: 'rgba(15, 48, 48, 0.9)',
    border: '1px solid #00FF9C',
    color: '#00FF9C',
    fontSize: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 0 15px rgba(0, 255, 156, 0.3)',
    transition: 'transform 0.1s',
  },
  footer: {
    width: '100%',
    backgroundColor: 'transparent', // Transparent to show full dark bg
    padding: '20px',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column' as const,
    // borderTop removed to avoid cut
  },
  bottomPanelWrapper: {
    backgroundColor: 'rgba(31, 39, 74, 0.35)', // Semi-transparent Navy
    border: '1px solid rgba(0, 254, 156, 0.18)', // Subtle Neon Border
    borderRadius: '20px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    backdropFilter: 'blur(10px)',
  },
  feedbackRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '12px',
    marginBottom: '16px',
  },
  avatarWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    padding: '2px',
    border: '1px solid #00FF9C',
    backgroundColor: '#000',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #0F3030 0%, #00FF9C 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#0F3030',
    fontWeight: 'bold' as const,
    fontSize: '20px',
  },
  feedbackBubble: {
    flex: 1,
    backgroundColor: 'transparent', // Integrated into wrapper
    padding: '4px 8px', // Minimal padding
    fontSize: '14px',
    lineHeight: '1.4',
    color: '#F0F2F3', // Smoke White text
    display: 'flex',
    alignItems: 'center',
  },
  actionsRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '16px',
    overflowX: 'auto' as const,
  },
  actionButton: {
    flex: 1,
    padding: '10px 12px',
    backgroundColor: 'rgba(15, 48, 48, 0.8)',
    border: '1px solid rgba(0, 255, 156, 0.4)',
    borderRadius: '12px',
    color: '#00FF9C',
    fontSize: '12px',
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  inputContainer: {
    width: '100%', // Full width in bar
    maxWidth: '600px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#0F1515', // Dark input bg
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '8px 12px',
    transition: 'border-color 0.2s',
  },
  inputIconBtn: {
    background: 'none',
    border: 'none',
    color: '#595F68', // Slate 500
    cursor: 'pointer',
    fontSize: '20px',
  },
  mainInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#F0F2F3', // Light text for input
    fontSize: '14px',
    fontWeight: '500' as const,
    outline: 'none',
    padding: '8px 0',
  },
  sendButton: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#00FF9C',
    color: '#0F3030',
    border: 'none',
    fontWeight: 'bold' as const,
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 10px rgba(0, 255, 156, 0.4)',
  },
  sendButtonSuccess: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#28A745', // Kept for success state but could be themed
    color: '#FFF',
    border: 'none',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.3)',
    marginTop: '10px',
    padding: '0 4px',
  },
  badgeOffline: {
    position: 'absolute' as const,
    top: '-10px',
    left: '20px',
    backgroundColor: '#FFD700',
    color: '#000',
    fontSize: '10px',
    fontWeight: 'bold' as const,
    padding: '2px 8px',
    borderRadius: '4px',
  },
  contextoBadge: {
    fontSize: '10px',
    color: '#00FF9C',
    opacity: 0.7,
    marginBottom: '4px',
    textAlign: 'center' as const,
  },
  botonSiguiente: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#00FF9C',
    color: '#0F3030',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700' as const,
    cursor: 'pointer',
    marginTop: '20px',
  }
};

export default C4_SesionActivaScreen;