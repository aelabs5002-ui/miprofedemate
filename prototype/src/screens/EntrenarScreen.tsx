import React from 'react';
import BaseLayout from '../components/BaseLayout';
import C4_SesionActivaScreen from './C4_SesionActivaScreen';
import { MissionPlan } from '../types/missionTypes';

/**
 * Pantalla Entrenar - Bloque C1
 * Si hay un plan activo, muestra C4 (Tutor).
 * Si no, muestra el placeholder de entrenamiento libre/futuro.
 */

interface EntrenarScreenProps {
  plan?: MissionPlan | null;
  userId?: string;
  onExitSession?: () => void;
}

const EntrenarScreen: React.FC<EntrenarScreenProps> = ({ plan, userId, onExitSession }) => {
  // Caso: Sesión Activa (Embed C4)
  if (plan && userId && onExitSession) {
    return (
      <div style={estilos.contenedorSesion}>
        <div style={estilos.marcoSesion}>
          <C4_SesionActivaScreen
            plan={plan}
            userId={userId}
            alVolver={onExitSession}
          />
        </div>
      </div>
    );
  }

  // Caso: Placeholder (Sin sesión)
  return (
    <BaseLayout titulo="Entrenar">
      <div style={estilos.contenedorPlaceholder}>
        <div style={estilos.placeholder}>
          <span style={estilos.icono}>💪</span>
          <h2 style={estilos.titulo}>Zona de Entrenamiento</h2>
          <p style={estilos.descripcion}>
            Aquí podrás practicar ejercicios de matemáticas.
            {!plan && <br />}<small>(No tienes una misión activa ahora)</small>
          </p>
        </div>
      </div>
    </BaseLayout>
  );
};

const estilos = {
  // Styles for Active Session Wrapper
  contenedorSesion: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    overflowY: 'auto' as const, // Allows scrolling the content if needed
  },
  marcoSesion: {
    width: '100%',
    maxWidth: '420px', // Mobile-like frame constraint
    minHeight: '100%',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 0 20px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column' as const,
    // Add padding to avoid overlapping with AppNavigator's TabBar (approx 70px + safe area)
    paddingBottom: '90px',
    boxSizing: 'border-box' as const,
  },

  // Styles for Placeholder
  contenedorPlaceholder: {
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 140px)',
  },
  placeholder: {
    textAlign: 'center' as const,
    maxWidth: '300px',
  },
  icono: {
    fontSize: '64px',
    display: 'block',
    marginBottom: '20px',
  },
  titulo: {
    fontSize: '20px',
    fontWeight: '700' as const,
    color: '#212529',
    marginBottom: '10px',
  },
  descripcion: {
    fontSize: '14px',
    color: '#6C757D',
    lineHeight: '1.5',
  },
};

export default EntrenarScreen;