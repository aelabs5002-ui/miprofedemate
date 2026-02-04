import React from 'react';
import BaseLayout from '../components/BaseLayout';
import { useApp } from '../context/AppContext';

/**
 * Pantalla de inicio con resumen de actividad y recomendaciones.
 */
const HomeScreen: React.FC = () => {
  const { sesion } = useApp();

  return (
    <BaseLayout titulo="Inicio">
      <div style={styles.container}>
        <div style={styles.welcomeSection}>
          <h2 style={styles.greeting}>¡Hola, {sesion.usuario?.nombre || 'Estudiante'}! 👋</h2>
          <p style={styles.subtitle}>¿Listo para practicar matemáticas hoy?</p>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Siguiente lección</h3>
          <div style={styles.lessonCard}>
            <div style={styles.lessonInfo}>
              <span style={styles.lessonTag}>Álgebra</span>
              <h4 style={styles.lessonName}>Ecuaciones de primer grado</h4>
              <p style={styles.lessonDesc}>Aprende a despejar incógnitas básicas.</p>
            </div>
            <button style={styles.lessonButton}>Continuar</button>
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Actividad reciente</h3>
          <div style={styles.activityItem}>
            <span style={styles.dot} />
            <div>
              <p style={styles.activityText}>Completaste: <strong>Fracciones II</strong></p>
              <span style={styles.activityTime}>Hace 2 horas</span>
            </div>
          </div>
          <div style={styles.activityItem}>
            <span style={styles.dot} />
            <div>
              <p style={styles.activityText}>Hablaste con el Tutor sobre <strong>Geometría</strong></p>
              <span style={styles.activityTime}>Ayer</span>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

const styles = {
  container: {
    padding: '20px',
  },
  welcomeSection: {
    marginBottom: '30px',
  },
  greeting: {
    fontSize: '24px',
    margin: 0,
    color: '#212529',
  },
  subtitle: {
    color: '#6C757D',
    margin: '5px 0 0 0',
  },
  section: {
    marginBottom: '25px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#495057',
    marginBottom: '15px',
  },
  lessonCard: {
    backgroundColor: '#F8F9FA',
    border: '1px solid #DEE2E6',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
  },
  lessonTag: {
    fontSize: '11px',
    backgroundColor: '#E7F1FF',
    color: '#007BFF',
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: '700',
    display: 'inline-block',
    marginBottom: '8px',
  },
  lessonName: {
    margin: '0 0 5px 0',
    fontSize: '18px',
    color: '#212529',
  },
  lessonDesc: {
    margin: 0,
    fontSize: '14px',
    color: '#6C757D',
  },
  lessonButton: {
    backgroundColor: '#007BFF',
    color: 'white',
    border: 'none',
    padding: '12px',
    borderRadius: '10px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  activityItem: {
    display: 'flex',
    gap: '12px',
    marginBottom: '15px',
    alignItems: 'flex-start',
  },
  dot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#ADB5BD',
    borderRadius: '50%',
    marginTop: '6px',
  },
  activityText: {
    margin: 0,
    fontSize: '14px',
    color: '#495057',
  },
  activityTime: {
    fontSize: '12px',
    color: '#ADB5BD',
  }
};

export default HomeScreen;