import React from 'react';
import { Mensaje } from '../types/chat';

interface Props {
  mensaje: Mensaje;
}

/**
 * Componente de burbuja de chat con soporte para diferentes tipos pedagógicos.
 */
const MensajeChat: React.FC<Props> = ({ mensaje }) => {
  const esAlumno = mensaje.remitente === 'Alumno';
  
  // Estilos según el tipo de mensaje pedagógico
  const obtenerEstiloTipo = () => {
    switch (mensaje.tipoMensaje) {
      case 'pista': return { borderLeft: '4px solid #FFC107', fontStyle: 'italic' };
      case 'error': return { borderLeft: '4px solid #DC3545', color: '#721C24' };
      default: return {};
    }
  };

  // Formatear la fecha de forma segura
  const formatearFecha = (fecha: any) => {
    if (!fecha) return '';
    const d = fecha instanceof Date ? fecha : new Date(fecha);
    return isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{
      ...styles.bubbleContainer,
      justifyContent: esAlumno ? 'flex-end' : 'flex-start'
    }}>
      <div style={{
        ...styles.bubble,
        ...obtenerEstiloTipo(),
        backgroundColor: esAlumno ? '#007BFF' : '#FFFFFF',
        color: esAlumno ? '#FFFFFF' : '#212529',
        border: esAlumno ? 'none' : '1px solid #E9ECEF',
        borderRadius: esAlumno ? '18px 18px 2px 18px' : '2px 18px 18px 18px',
      }}>
        <div style={{
          ...styles.sender,
          color: esAlumno ? 'rgba(255,255,255,0.8)' : '#6C757D'
        }}>
          {mensaje.remitente} {mensaje.tipoMensaje !== 'normal' && ` • ${mensaje.tipoMensaje.toUpperCase()}`}
        </div>
        <div style={styles.text}>{mensaje.texto}</div>
        <div style={{
          ...styles.time,
          color: esAlumno ? 'rgba(255,255,255,0.6)' : '#ADB5BD'
        }}>
          {formatearFecha(mensaje.fecha)}
        </div>
      </div>
    </div>
  );
};

const styles = {
  bubbleContainer: {
    display: 'flex',
    width: '100%',
    marginBottom: '16px',
    padding: '0 12px',
    boxSizing: 'border-box' as const,
  },
  bubble: {
    maxWidth: '85%',
    padding: '12px 16px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    position: 'relative' as const,
  },
  sender: {
    fontSize: '10px',
    fontWeight: '700',
    marginBottom: '6px',
    letterSpacing: '0.5px',
  },
  text: {
    fontSize: '15px',
    lineHeight: '1.5',
    whiteSpace: 'pre-wrap' as const,
  },
  time: {
    fontSize: '10px',
    textAlign: 'right' as const,
    marginTop: '6px',
  }
};

export default MensajeChat;