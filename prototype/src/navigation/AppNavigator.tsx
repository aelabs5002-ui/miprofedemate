import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MisionScreen from '../screens/MisionScreen';
import EntrenarScreen from '../screens/EntrenarScreen';
import ProgresoScreen from '../screens/ProgresoScreen';
import PerfilScreen from '../screens/PerfilScreen';
import SubirTareaScreen from '../screens/SubirTareaScreen';
import PadrePanelScreen from '../screens/PadrePanelScreen';
import C5_CreandoMisionScreen from '../screens/C5_CreandoMisionScreen';
import C5_ErrorCreandoMisionScreen from '../screens/C5_ErrorCreandoMisionScreen';
import { MissionBuildStatus, MissionRequest, MissionPlan } from '../types/missionTypes';
import { MissionService } from '../servicios/MissionService';
import PadreBibliotecaTutorScreen from '../screens/PadreBibliotecaTutorScreen';
import PanelAlumnoScreen from '../screens/PanelAlumnoScreen';

import { supabase } from '../lib/supabaseClient';
import StudentSelectionScreen from '../screens/StudentSelectionScreen';

// ... imports remain the same

const AppNavigator: React.FC = () => {
  const { sesion } = useApp();
  const [rutaActual, setRutaActual] = useState('Misión');
  const [vistaAuth, setVistaAuth] = useState<'Login' | 'Registro'>('Login');

  // Supabase Auth State
  const [supabaseSession, setSupabaseSession] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Check Supabase Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseSession(session);
      setLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Navigation Stacks/Modals
  const [mostrarSubirTarea, setMostrarSubirTarea] = useState(false);
  const [mostrarPadres, setMostrarPadres] = useState(false);
  const [mostrarAlumno, setMostrarAlumno] = useState(false);
  const [mostrarBiblioteca, setMostrarBiblioteca] = useState(false);

  // Mission & Session State
  const [sessionPlan, setSessionPlan] = useState<MissionPlan | null>(null);
  const [idMisionCreando, setIdMisionCreando] = useState<string | null>(null);
  const [errorMision, setErrorMision] = useState<MissionBuildStatus | null>(null);

  // --- RENDERING AUTH FLOW ---

  if (loadingAuth) {
    return <div style={{ color: 'white', padding: 20 }}>Cargando sesión...</div>;
  }

  // 1. Si no hay sesión de Supabase (Padre), mostrar Login/Registro
  if (!supabaseSession) {
    return vistaAuth === 'Login'
      ? <LoginScreen alIrARegistro={() => setVistaAuth('Registro')} />
      : <RegisterScreen alIrALogin={() => setVistaAuth('Login')} />;
  }

  // 2. Si hay sesión de Padre pero NO se ha elegido Alumno (Contexto App vacío), mostrar Selección
  if (supabaseSession && !sesion.estaAutenticado) {
    return <StudentSelectionScreen />;
  }

  // 3. Si hay Alumno seleccionado, mostrar App Principal


  const irASubirTarea = () => {
    setMostrarSubirTarea(true);
  };

  const volverDesdeSubirTarea = () => {
    setMostrarSubirTarea(false);
  };

  const irASesion = (plan: MissionPlan) => {
    setSessionPlan(plan);
    setIdMisionCreando(null); // Clear creating state logic
    setRutaActual('Entrenar'); // Switch to Entrenar tab automatically
  };

  const salirDeSesion = () => {
    setSessionPlan(null); // Clear active plan
    setRutaActual('Misión'); // Return to Mission tab
  };



  const irAAlumno = () => {
    setMostrarAlumno(true);
  };

  const volverDesdeAlumno = () => {
    setMostrarAlumno(false);
  };

  const irAPadres = () => {
    setMostrarPadres(true);
  };

  const volverDesdePadres = () => {
    setMostrarPadres(false);
  };

  const irABiblioteca = () => {
    setMostrarPadres(false); // Close parent panel (optional, or stack them) -> Let's replace simple
    setMostrarBiblioteca(true);
  };

  const volverDesdeBiblioteca = () => {
    setMostrarBiblioteca(false);
    setMostrarPadres(true); // Back to parent panel
  };

  // --- C5 Logic ---

  const iniciarCreacionMision = (missionId: string) => {
    setMostrarSubirTarea(false); // Close upload screen if open
    setIdMisionCreando(missionId);
    setErrorMision(null);
  };

  const manejarErrorCreacion = (status: MissionBuildStatus) => {
    setIdMisionCreando(null);
    setErrorMision(status);
  };

  const reintentarCreacion = async () => {
    if (errorMision) {
      try {
        await MissionService.retryMission(errorMision.missionId);
        // Volver a estado "creando" para mostrar spinner
        setErrorMision(null);
        setIdMisionCreando(errorMision.missionId);
      } catch (e) {
        console.error('Error al reintentar', e);
        // Si falla el retry síncrono, mantenerse en pantalla error o mostrar alerta
        alert('No se pudo reiniciar la misión.');
      }
    }
  };

  const cancelarCreacion = async () => {
    // Fallback: "Practicar sin tarea"
    // We trigger a new "practice" mission
    setErrorMision(null);

    const userId = sesion.usuario?.id || 'demo-user';
    const req: MissionRequest = {
      studentId: userId,
      type: 'practica',
      dateKey: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    };

    try {
      const status = await MissionService.buildMissionAsync(req);
      iniciarCreacionMision(status.missionId);
    } catch (e) {
      alert('Error crítico al iniciar práctica.');
    }
  };

  // Renderizado de pantallas según prioridad
  const renderizarPantalla = () => {
    // 1. Modales de Creación / Error (C5) - High priority over tabs if active
    if (idMisionCreando) {
      return (
        <C5_CreandoMisionScreen
          missionId={idMisionCreando}
          alTerminar={irASesion}
          alFallar={manejarErrorCreacion}
        />
      );
    }

    if (errorMision) {
      return (
        <C5_ErrorCreandoMisionScreen
          status={errorMision}
          alReintentar={errorMision.retryable ? reintentarCreacion : undefined}
          alSalir={cancelarCreacion}
        />
      );
    }

    // 2. Modales secundarios (Full Screen overlays)
    if (mostrarAlumno) {
      return <PanelAlumnoScreen alVolver={volverDesdeAlumno} />;
    }

    if (mostrarPadres) {
      const userId = sesion.usuario?.id || 'demo-user';
      return <PadrePanelScreen userId={userId} alVolver={volverDesdePadres} alIrABiblioteca={irABiblioteca} />;
    }

    if (mostrarBiblioteca) {
      const userId = sesion.usuario?.id || 'demo-user';
      return <PadreBibliotecaTutorScreen userId={userId} alVolver={volverDesdeBiblioteca} />;
    }

    if (mostrarSubirTarea) {
      return (
        <SubirTareaScreen
          alVolver={volverDesdeSubirTarea}
          alIniciarCreacion={iniciarCreacionMision}
        />
      );
    }

    // 3. Tabs principales
    switch (rutaActual) {
      case 'Misión':
        return (
          <MisionScreen
            alIrASubirTarea={irASubirTarea}
            alIrASesion={irASesion}
            alIniciarCreacion={iniciarCreacionMision}
          />
        );
      case 'Entrenar':
        return (
          <EntrenarScreen
            plan={sessionPlan}
            userId={sesion.usuario?.id || 'demo-user'}
            onExitSession={salirDeSesion}
          />
        );
      case 'Progreso': return <ProgresoScreen />;
      case 'Perfil': return <PerfilScreen alIrAPadres={irAPadres} alIrAAlumno={irAAlumno} />;
      default: return (
        <MisionScreen
          alIrASubirTarea={irASubirTarea}
          alIrASesion={irASesion}
          alIniciarCreacion={iniciarCreacionMision}
        />
      );
    }
  };

  // Configuración de pestañas
  const pestanas = [
    { id: 'Misión', etiqueta: 'Misión', icono: '🎯' },
    { id: 'Entrenar', etiqueta: 'Entrenar', icono: '💪' },
    { id: 'Progreso', etiqueta: 'Progreso', icono: '📊' },
    { id: 'Perfil', etiqueta: 'Perfil', icono: '👤' }
  ];

  // Hide tabs only when in critical "modal" flows (Creation/Error).
  // We show tabs for Padres, Alumno, Biblioteca, SubirTarea as requested.
  const hideTabs = !!(idMisionCreando || errorMision);

  return (
    <div style={estilos.contenedor}>
      <div style={estilos.areaPantalla}>
        {renderizarPantalla()}
      </div>

      {/* Bottom Tab Bar - Hidden in specific modes */}
      {!hideTabs && (
        <nav style={estilos.barraNavegacion}>
          <div style={estilos.contenedorNavegacion}>
            {pestanas.map((pestana) => (
              <button
                key={pestana.id}
                onClick={() => setRutaActual(pestana.id)}
                style={{
                  ...estilos.botonPestana,
                  borderTop: rutaActual === pestana.id ? '3px solid #007BFF' : '3px solid transparent',
                  color: rutaActual === pestana.id ? '#007BFF' : '#ADB5BD',
                }}
              >
                <span style={estilos.iconoPestana}>{pestana.icono}</span>
                <span style={estilos.textoPestana}>{pestana.etiqueta}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
};

const estilos = {
  contenedor: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: 'transparent', // Allow global background to show through
    overflow: 'hidden',
  },
  areaPantalla: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative' as const,
    width: '100%',
    height: '100%',
  },
  barraNavegacion: {
    height: '70px',
    backgroundColor: '#FFFFFF',
    borderTop: '1px solid #E9ECEF',
    position: 'fixed' as const,
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '390px', // Mobile constraint
    zIndex: 100,
    paddingBottom: 'env(safe-area-inset-bottom)',
    boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '0 4px',
  },
  contenedorNavegacion: {
    display: 'contents', // This allows children to be direct flex children of barraNavegacion
  },
  botonPestana: {
    flex: 1,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    gap: '4px',
    minWidth: '60px', // Ensure buttons have click area
  },
  iconoPestana: {
    fontSize: '20px',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoPestana: {
    fontSize: '10px',
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    lineHeight: '1',
  },
};

export default AppNavigator;