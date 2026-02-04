import React from 'react';
// import BaseLayout from '../components/BaseLayout'; // Removed to allow transparency
import { useApp } from '../context/AppContext';

interface PerfilScreenProps {
  alIrAPadres?: () => void;
  alIrAAlumno?: () => void;
}

const PerfilScreen: React.FC<PerfilScreenProps> = ({ alIrAPadres, alIrAAlumno }) => {
  const { sesion } = useApp();
  // kept to preserve logic hooks if needed, though mostly visual update
  const userName = sesion.usuario?.nombre || 'Usuario';

  return (
    // <BaseLayout titulo="Mi Perfil"> -> Replaced with transparent native layout
    <div style={estilos.darkWrapper}>
      {/* Custom Header to match Mission Control */}
      <header style={estilos.headerRoot}>
        <h1 style={estilos.headerTitleText}>Mi Perfil</h1>
      </header>

      {/* Header Decorativo Interno */}
      <header style={estilos.headerInterno}>
        <div style={estilos.hubLabelContainer}>
          <span style={estilos.iconHub}>❖</span>
          <span style={estilos.hubLabel}>SISTEMA DE ACCESO</span>
        </div>
        <h1 style={estilos.mainTitle}>
          SELECCIONAR PORTAL
        </h1>
      </header>

      {/* Contenido Principal */}
      <div style={estilos.cardsContainer}>

        {/* Card Padres */}
        <div style={estilos.cardPadres}>
          <div style={estilos.cardContent}>
            <div style={estilos.cardHeaderRow}>
              <div style={estilos.iconBoxPadres}>
                <span>🛡️</span>
              </div>
              <span style={estilos.badgeSeguro}>SEGURO</span>
            </div>

            <h2 style={estilos.cardTitleWhite}>Portal de Padres</h2>
            <p style={estilos.cardDescPadres}>
              Supervisa el progreso, gestiona configuraciones y monitorea el aprendizaje.
            </p>

            <div style={estilos.cardActionRow}>
              <button
                style={estilos.btnPadres}
                onClick={alIrAPadres}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(42, 63, 56, 1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(42, 63, 56, 0.5)'}
              >
                <span>Acceder</span>
                <span style={estilos.arrowIcon}>➔</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card Alumno */}
        <div style={estilos.cardAlumno}>
          {/* Glow / Border effects simulated via box-shadow in styles */}
          <div style={estilos.cardContent}>
            <div style={estilos.cardHeaderRow}>
              <div style={estilos.iconBoxAlumno}>
                <span>🎮</span>
              </div>
              <div style={estilos.onlineBadge}>
                <span style={estilos.boltIcon}>⚡</span>
                <span>ONLINE</span>
              </div>
            </div>

            <h2 style={estilos.cardTitleNeon}>
              ZONA DEL<br />ESTUDIANTE
            </h2>

            <div style={estilos.tagsRow}>
              <span style={estilos.tagPurple}>Misiones</span>
              <span style={estilos.tagBlue}>Juegos</span>
              <span style={estilos.tagYellow}>+XP</span>
            </div>

            <p style={estilos.cardDescAlumno}>
              ¡Entra a la arena de matemáticas! Completa desafíos y gana recompensas.
            </p>

            <div style={estilos.cardActionRow}>
              <button
                style={estilos.btnAlumnoPrimary}
                onClick={alIrAAlumno}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#33ffb0';
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(0,255,157,0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#00ff9d';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(0,255,157,0.4)';
                }}
              >
                <span>JUGAR AHORA</span>
                <span>🚀</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer style={estilos.footer}>
        <button style={estilos.linkAyuda}>
          ❓ ¿Necesitas ayuda para acceder?
        </button>
      </footer>

    </div>
    // </BaseLayout>
  );
};

const estilos = {
  // Wrapper oscuro que "llena" el BaseLayout (offsetting padding if necessary)
  // Asumiendo que BaseLayout tiene padding, usamos margin negativo para cubrirlo visualmente
  // si es posible, o simplemente llenamos el espacio disponible.
  darkWrapper: {
    backgroundColor: 'transparent', // Explicit transparency for global bg
    height: '100%',
    width: '100%',
    padding: '0', // Full bleed, padding handles in children
    display: 'flex',
    flexDirection: 'column' as const,
    fontFamily: '"Space Grotesk", sans-serif',
    color: '#fff',
    overflowY: 'hidden' as const, // No scroll allowed requested
    position: 'relative' as const,
  },
  headerRoot: {
    height: '50px', // Compact header
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 16px',
    backgroundColor: 'transparent',
    // borderBottom: '1px solid rgba(255, 255, 255, 0.05)', // Removed border to blend fully
    zIndex: 10,
  },
  headerTitleText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#F0F2F3', // Blanco Humo
    margin: 0,
    letterSpacing: '0.02em',
  },
  headerInterno: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    marginTop: '12px',
    marginBottom: '12px', // Compact margin
    paddingTop: '0',
    flexShrink: 0,
  },
  hubLabelContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    opacity: 0.9,
  },
  iconHub: {
    color: '#00ff9d', // Primary Neon
    fontSize: '20px',
  },
  hubLabel: {
    color: '#00ff9d',
    fontSize: '10px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.2em',
    fontWeight: '500',
  },
  mainTitle: {
    fontSize: '28px',
    fontWeight: '700',
    textAlign: 'center' as const,
    margin: 0,
    background: 'linear-gradient(to bottom, #ffffff, rgba(255,255,255,0.7))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.02em',
  },
  cardsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px', // Compact gap
    maxWidth: '100%',
    margin: '0 auto',
    width: '100%',
    flex: 1,
    overflowY: 'auto' as const, // Scroll only within cards area if ABSOLUTELY needed, but aiming for fits
    padding: '0 16px',
  },
  // Card Padres
  cardPadres: {
    backgroundColor: '#14201d', // Sober dark
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.1)',
    overflow: 'hidden',
    position: 'relative' as const,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  cardContent: {
    padding: '16px', // Compact padding from 24px
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
  },
  cardHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  iconBoxPadres: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9abcaf',
    fontSize: '20px',
  },
  badgeSeguro: {
    fontSize: '10px',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    backgroundColor: '#2a3f38',
    color: '#9abcaf',
    border: '1px solid #3d574f',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  cardTitleWhite: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 4px 0',
  },
  cardDescPadres: {
    fontSize: '13px', // Slightly smaller
    color: '#9abcaf',
    lineHeight: '1.4',
    margin: '0 0 16px 0', // Reduced margin
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  },
  cardActionRow: {
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  btnPadres: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '8px',
    backgroundColor: 'rgba(42, 63, 56, 0.5)',
    border: '1px solid #3d574f',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  arrowIcon: {
    fontSize: '16px',
  },

  // Card Alumno
  cardAlumno: {
    backgroundColor: '#0a0f0d', // Darker
    borderRadius: '16px',
    border: '1px solid rgba(0, 255, 157, 0.3)', // Neon border
    overflow: 'hidden',
    position: 'relative' as const,
    boxShadow: '0 0 20px rgba(0, 255, 157, 0.1)',
    flex: 1, // Expand to fill available space like main content
    minHeight: '220px', // Ensure reasonable size
  },
  iconBoxAlumno: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: 'rgba(0, 255, 157, 0.2)',
    border: '1px solid rgba(0, 255, 157, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#00ff9d',
    fontSize: '24px',
    boxShadow: '0 0 10px rgba(0, 255, 157, 0.2)', // glow
  },
  onlineBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#00ff9d',
    letterSpacing: '0.05em',
  },
  boltIcon: {
    animation: 'pulse 2s infinite', // Note: CSS keyframes won't work in inline styes easily, but static is fine
  },
  cardTitleNeon: {
    fontSize: '24px', // Reduced from 28px
    fontWeight: '700',
    color: '#ffffff',
    margin: '4px 0',
    fontStyle: 'italic',
    textShadow: '0 0 10px rgba(0, 255, 157, 0.5)',
    lineHeight: '1',
  },
  tagsRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
    flexWrap: 'wrap' as const,
  },
  tagPurple: {
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    color: '#d8b4fe',
    border: '1px solid rgba(168, 85, 247, 0.3)',
  },
  tagBlue: {
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    color: '#93c5fd',
    border: '1px solid rgba(59, 130, 246, 0.3)',
  },
  tagYellow: {
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    color: '#fde047',
    border: '1px solid rgba(234, 179, 8, 0.3)',
  },
  cardDescAlumno: {
    fontSize: '13px',
    color: '#d1d5db',
    lineHeight: '1.4',
    margin: '0 0 16px 0',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  },
  btnAlumnoPrimary: {
    width: '100%',
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: '#00ff9d', // Neon Primary
    border: 'none',
    color: '#000000',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 0 15px rgba(0, 255, 157, 0.4)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },

  footer: {
    marginTop: '16px', // Reduced margin
    textAlign: 'center' as const,
    paddingBottom: '10px',
    flexShrink: 0,
  },
  linkAyuda: {
    background: 'none',
    border: 'none',
    color: '#9abcaf',
    fontSize: '14px',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  }
};

export default PerfilScreen;