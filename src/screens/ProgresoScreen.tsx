import React, { useEffect, useState } from 'react';
import { memoriaAlumno } from '../servicios/RepositorioMemoriaAlumno';
import { ProgresoAlumno } from '../tipos/progresoAlumno';

// Mock data to match visual reference if real data is insufficient
// Logic preserved: using this constant as original code did
const VISUAL_MOCK_DATA = {
  streak: 12,
  level: 'Master',
  accuracy: 92,
  targetAccuracy: 95,
  studyGoalCurrent: 17,
  studyGoalTotal: 20
};

const ProgresoScreen: React.FC = () => {
  // Keep existing logic connection
  const [progreso, setProgreso] = useState<ProgresoAlumno>(memoriaAlumno.obtenerProgreso());

  useEffect(() => {
    setProgreso(memoriaAlumno.obtenerProgreso());
  }, []);

  // Helper for bar chart (Visual Component)
  const BarItem = ({ label, height, color }: { label: string, height: string, color: string }) => (
    <div style={styles.barColumn}>
      <div style={styles.barTrack}>
        <div style={{
          width: '100%',
          height: height,
          backgroundColor: color,
          borderRadius: 6,
          boxShadow: `0 0 10px ${color}40`, // 40 = alpha
          position: 'absolute' as const,
          bottom: 0,
          transition: 'height 0.5s ease'
        }} />
      </div>
      <span style={styles.barLabel}>{label}</span>
    </div>
  );

  return (
    <div style={styles.pageContainer}>
      {/* Mobile Frame */}
      <div style={styles.mobileFrame}>

        {/* Header */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>MI PROGRESO</h1>
            <p style={styles.headerSubtitle}>Resumen de tu avance</p>
          </div>
          {/* Visual placeholder for profile/settings icon */}
          <div style={styles.headerIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00ff9d" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          </div>
        </header>

        <div style={styles.scrollContent}>

          {/* Stats Overview Grid */}
          <div style={styles.statsGrid}>
            {/* Streak Card */}
            <div style={styles.glassCard}>
              <div style={styles.cardHeaderRow}>
                <span style={styles.cardLabel}>RACHA ACTUAL</span>
                <span style={{ fontSize: 16 }}>🔥</span>
              </div>
              <div style={styles.cardMainValue}>{VISUAL_MOCK_DATA.streak} <span style={styles.unitText}>Días</span></div>
              <div style={styles.trendSuccess}>
                ¡Sigue así!
              </div>
            </div>

            {/* Level Card (Replaced Ranking with Personal Level) */}
            <div style={styles.glassCard}>
              <div style={styles.cardHeaderRow}>
                <span style={styles.cardLabel}>NIVEL ACTUAL</span>
                <span style={{ fontSize: 16 }}>🚀</span>
              </div>
              <div style={styles.cardMainValue}>{VISUAL_MOCK_DATA.level}</div>
              <div style={styles.trendNeutral}>
                MAESTRÍA PERSONAL
              </div>
            </div>
          </div>

          {/* Section: Dominio de Temas (Precisión) */}
          <div style={styles.sectionContainer}>
            <div style={styles.sectionHeaderLine}>
              <h2 style={styles.sectionTitle}>PRECISIÓN GENERAL</h2>
              <span style={styles.mainAccuracy}>{VISUAL_MOCK_DATA.accuracy}%</span>
            </div>

            {/* Visual Bar Chart */}
            <div style={styles.chartContainer}>
              <BarItem label="ÁLG" height="80%" color="#3B82F6" />
              <BarItem label="CAL" height="60%" color="#00ff9d" />
              <BarItem label="GEO" height="40%" color="#F59E0B" />
              <BarItem label="LÓG" height="90%" color="#8B5CF6" />
            </div>

            <div style={styles.infoRow}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
              <span style={styles.infoText}>Meta sugerida: {VISUAL_MOCK_DATA.targetAccuracy}% de precisión</span>
            </div>
          </div>

          {/* Section: Resumen Semanal */}
          <div style={styles.sectionContainer}>
            <h2 style={styles.sectionTitle}>RESUMEN SEMANAL</h2>
            <div style={styles.summaryRow}>
              <div style={styles.ringWrapper}>
                {/* SVG Ring Visual */}
                <svg width="64" height="64" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1E293B" strokeWidth="4" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="#00ff9d" strokeWidth="4" strokeDasharray="85, 100" strokeLinecap="round" />
                </svg>
                <div style={styles.ringInnerIcon}>🎯</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={styles.summaryLabel}>Meta de Estudio</div>
                <div style={styles.progressBarBg}>
                  <div style={{ ...styles.progressBarFill, width: `${(VISUAL_MOCK_DATA.studyGoalCurrent / VISUAL_MOCK_DATA.studyGoalTotal) * 100}%` }}></div>
                </div>
                <div style={styles.summarySub}>
                  Completado {VISUAL_MOCK_DATA.studyGoalCurrent} de {VISUAL_MOCK_DATA.studyGoalTotal} lecciones
                </div>
              </div>
            </div>
          </div>

          {/* Section: Logros */}
          <div style={{ ...styles.sectionContainer, border: 'none', background: 'transparent', padding: 0 }}>
            <h2 style={styles.sectionTitle}>LOGROS RECIENTES</h2>

            <div style={styles.achievementsScroll}>
              {/* Achievement Item 1 */}
              <div style={styles.achievementCard}>
                <div style={styles.iconCircleGold}>⚡</div>
                <span style={styles.achName}>Veloz</span>
              </div>
              {/* Achievement Item 2 */}
              <div style={styles.achievementCard}>
                <div style={styles.iconCircleGreen}>🏆</div>
                <span style={styles.achName}>10 Perfectos</span>
              </div>
              {/* Achievement Item 3 (Locked) */}
              <div style={{ ...styles.achievementCard, opacity: 0.5 }}>
                <div style={styles.iconCircleLock}>🔒</div>
                <span style={styles.achName}>Genio</span>
              </div>
              {/* Achievement Item 4 (Locked) */}
              <div style={{ ...styles.achievementCard, opacity: 0.5 }}>
                <div style={styles.iconCircleLock}>🔒</div>
                <span style={styles.achName}>Constante</span>
              </div>
            </div>
          </div>

          {/* CTA Button - Handler Preserved (none was attached in original, just visual button 'Continuar Practicando') */}
          <button style={styles.ctaButton}>
            CONTINUAR PRACTICANDO
          </button>

          <div style={{ height: 100 }}></div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#000000', // Gutter black
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    fontFamily: '"Rajdhani", "Inter", sans-serif',
    color: '#F3F4F6',
    overflowX: 'hidden' as const,
  },
  mobileFrame: {
    width: '100%',
    maxWidth: '390px', // Mobile First Constraint
    minHeight: '100vh',
    backgroundColor: '#0B1120', // Background Navy
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'relative' as const,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 20px 16px 20px',
    backgroundColor: 'rgba(11, 17, 32, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'white',
    margin: 0,
    letterSpacing: '1px',
  },
  headerSubtitle: {
    fontSize: '12px',
    color: '#94A3B8',
    marginTop: 2,
  },
  headerIcon: {
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 255, 157, 0.1)',
  },
  scrollContent: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  },

  // Stats Grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  glassCard: {
    backgroundColor: '#162032',
    borderRadius: '16px',
    padding: '16px',
    border: '1px solid rgba(59, 130, 246, 0.1)',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    minHeight: '110px',
  },
  cardHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  cardMainValue: {
    fontSize: '28px',
    fontWeight: '800',
    color: 'white',
    lineHeight: 1,
  },
  unitText: {
    fontSize: '12px',
    color: '#64748B',
    fontWeight: '600',
  },
  trendSuccess: {
    fontSize: '10px',
    color: '#00ff9d',
    fontWeight: '600',
    marginTop: 4,
  },
  trendNeutral: {
    fontSize: '10px',
    color: '#3B82F6',
    fontWeight: '600',
    marginTop: 4,
  },

  // Sections
  sectionContainer: {
    backgroundColor: '#162032',
    borderRadius: '16px',
    padding: '16px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  sectionHeaderLine: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    margin: 0,
  },
  mainAccuracy: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#00ff9d',
  },

  // Chart
  chartContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    paddingBottom: 8,
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    marginBottom: 12,
  },
  barColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 6,
    height: '100%',
    width: 40,
  },
  barTrack: {
    flex: 1,
    width: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 6,
    position: 'relative' as const,
    overflow: 'hidden',
  },
  barLabel: {
    fontSize: '9px',
    fontWeight: '600',
    color: '#64748B',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
  },
  infoText: {
    fontSize: '11px',
    color: '#64748B',
  },

  // Summary
  summaryRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
  },
  ringWrapper: {
    position: 'relative' as const,
    width: 64,
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInnerIcon: {
    position: 'absolute' as const,
    fontSize: '24px',
  },
  summaryLabel: {
    fontSize: '14px',
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00ff9d',
    borderRadius: 3,
  },
  summarySub: {
    fontSize: '11px',
    color: '#94A3B8',
  },

  // Achievements
  achievementsScroll: {
    display: 'flex',
    gap: 12,
    overflowX: 'auto' as const,
    padding: '8px 0',
  },
  achievementCard: {
    minWidth: 90,
    backgroundColor: '#1E293B',
    borderRadius: '12px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: 8,
    border: '1px solid rgba(255,255,255,0.05)',
  },
  iconCircleGold: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    border: '1px solid #FCD34D',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
  },
  iconCircleGreen: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 255, 157, 0.1)',
    border: '1px solid #00ff9d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
  },
  iconCircleLock: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    backgroundColor: '#334155',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    color: '#94A3B8',
  },
  achName: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#E2E8F0',
    textAlign: 'center' as const,
  },

  // CTA
  ctaButton: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#00ff9d',
    color: '#064E3B', // Dark Green Text
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '800',
    letterSpacing: '1px',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0, 255, 157, 0.3)',
    marginTop: 12,
  },
};

export default ProgresoScreen;