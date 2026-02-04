import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface Props {
  alIrARegistro: () => void;
}

/**
 * Pantalla de inicio de sesión rediseñada (Skin: Escuadrón/Misión).
 * Mantiene lógica intacta pero transforma radicalmente la UI.
 */
const LoginScreen: React.FC<Props> = ({ alIrARegistro }) => {
  // --- LÓGICA ORIGINAL INTACTA (NO TOCAR) ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const { iniciarSesion } = useApp();

  const manejarLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password.length >= 6) {
      iniciarSesion({
        id: 'usr_123',
        nombre: email.split('@')[0],
        correo: email,
        rol: 'Alumno'
      });
    } else {
      alert('Por favor, ingresa credenciales válidas (Contraseña mín. 6 caracteres)');
    }
  };
  // -------------------------------------------

  return (
    <div style={styles.pageContainer}>
      {/* Fondo Ambiental (Efectos de luz y rejilla) */}
      <div style={styles.ambientBackground}>
        <div style={styles.gridPattern} />
        <div style={styles.glowTopRight} />
        <div style={styles.glowBottomLeft} />
      </div>

      {/* Header de Navegación Simple */}
      <nav style={styles.navBar}>
        <button style={styles.navBackButton} type="button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div style={styles.statusBadge}>
          <span style={styles.statusDot} />
          <span style={styles.statusText}>ONLINE</span>
        </div>
      </nav>

      <div style={styles.scrollContainer}>
        {/* Sección Hero / Avatar */}
        <div style={styles.heroSection}>
          <div style={styles.avatarContainer}>
             {/* Placeholder de Avatar Robótico (Gradiente) */}
            <div style={styles.avatarInner}>
               <div style={styles.avatarPlaceholder} />
               <div style={styles.scanlineOverlay} />
            </div>
            <div style={styles.newCadetBadge}>NEW CADET</div>
          </div>
          
          <div style={styles.titleWrapper}>
            <h1 style={styles.mainTitle}>
              ÚNETE AL <br />
              <span style={styles.highlightText}>ESCUADRÓN</span>
            </h1>
            <p style={styles.subtitle}>
              Domina las matemáticas. Sube de nivel. Tu misión comienza ahora.
            </p>
          </div>
        </div>

        {/* Formulario de Misión */}
        <form onSubmit={manejarLogin} style={styles.formContainer}>
          
          {/* Campo: ALIAS (antes Email) */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>ALIAS</label>
            <div style={styles.inputWrapper}>
              <input
                type="text" 
                placeholder="Ingresa tu Alias"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                className="input-glow" // Referencia para focus (manejado en style si fuera css puro, aqui inline simulado)
                required
              />
              <div style={styles.inputIconRight}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                   <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                   <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Campo: CÓDIGO DE ACCESO (antes Password) */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>CÓDIGO DE ACCESO</label>
            <div style={styles.inputWrapper}>
              <input
                type={mostrarPassword ? "text" : "password"}
                placeholder="Ingresa tu clave"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                style={styles.eyeButton}
              >
                 {mostrarPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round" strokeLinejoin="round"/><line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  )}
              </button>
            </div>
          </div>

          {/* Botones Sociales (Visual Only) */}
          <div style={styles.socialRow}>
             <button type="button" style={styles.socialButton}>
                <span style={{ fontSize: 14 }}>G</span> <span style={styles.socialText}>Google</span>
             </button>
             <button type="button" style={styles.socialButton}>
                <span style={{ fontSize: 14 }}></span> <span style={styles.socialText}>Apple</span>
             </button>
          </div>

          {/* CTA Principal */}
          <button type="submit" style={styles.primaryButton}>
            <span>INICIAR MISIÓN</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 8 }}>
               <path d="M13.13 22.19L11 21.06L3.93 17.5L2.5 13.93L4.9 12.53L10.5 15.24L12.06 13.68L9.36 10.97L11.5 5.5L15.06 6.94L18.63 4.81L21.43 14.75L13.13 22.19ZM13.89 12.63L13.18 13.34L8.71 11.18L6.44 12.5L5.73 13.21L6.44 14.97L12.47 18.03L18.84 12.31L16.71 5.97L13.88 7.38L11.75 6.67L10.3 8.12L13.89 12.63ZM19 1.5C18.59 1.5 18.25 1.84 18.25 2.25C18.25 2.66 18.59 3 19 3H20.5V4.5C20.5 4.91 20.84 5.25 21.25 5.25C21.66 5.25 22 4.91 22 4.5V3H23.5C23.91 3 24.25 2.66 24.25 2.25C24.25 1.84 23.91 1.5 23.5 1.5H22V0C22 -0.41 21.66 -0.75 21.25 -0.75C20.84 -0.75 20.5 -0.41 20.5 0V1.5H19Z" />
            </svg>
          </button>

        </form>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            ¿No eres miembro del escuadrón?
            <span onClick={alIrARegistro} style={styles.linkRegister}>Regístrate aquí</span>
          </p>
        </div>

      </div>
    </div>
  );
};

// --- ESTILOS NEON / FUTURISTAS ---
const styles = {
  pageContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: '#0A0E29', // Dark Navy Background
    fontFamily: "'Inter', sans-serif", // Fallback font
    color: '#ffffff',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  // Fondo ambiental simulado
  ambientBackground: {
    position: 'fixed' as const,
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 0,
    pointerEvents: 'none' as const,
  },
  gridPattern: {
    position: 'absolute' as const,
    inset: 0,
    backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
  },
  glowTopRight: {
    position: 'absolute' as const,
    top: '-10%', right: '-20%',
    width: '600px', height: '600px',
    backgroundColor: 'rgba(0, 255, 157, 0.08)', // Primary transparent
    filter: 'blur(80px)',
    borderRadius: '50%',
  },
  glowBottomLeft: {
    position: 'absolute' as const,
    bottom: '-10%', left: '-10%',
    width: '500px', height: '500px',
    backgroundColor: 'rgba(37, 99, 235, 0.1)', // Blue transparent
    filter: 'blur(80px)',
    borderRadius: '50%',
  },
  // Barra de Navegación
  navBar: {
    position: 'relative' as const,
    zIndex: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
  },
  navBackButton: {
    width: '40px', height: '40px',
    borderRadius: '8px',
    backgroundColor: '#131b3a', // Surface Dark
    border: '1px solid #2a3b68', // Border Dark
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#131b3a',
    border: '1px solid rgba(42, 59, 104, 0.5)',
    borderRadius: '20px',
    padding: '4px 12px',
    gap: '8px',
  },
  statusDot: {
    width: '8px', height: '8px',
    borderRadius: '50%',
    backgroundColor: '#00ff9d',
    boxShadow: '0 0 8px #00ff9d',
  },
  statusText: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'rgba(0, 255, 157, 0.8)',
    letterSpacing: '1px',
  },
  // Contenido Principal
  scrollContainer: {
    position: 'relative' as const,
    zIndex: 10,
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '0 24px 40px 24px',
    maxWidth: '480px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  heroSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    marginBottom: '32px',
    marginTop: '10px',
  },
  // Avatar
  avatarContainer: {
    position: 'relative' as const,
    marginBottom: '24px',
    cursor: 'pointer',
    transform: 'rotate(3deg)',
    transition: 'transform 0.3s',
  },
  avatarInner: {
    width: '100px', height: '100px',
    borderRadius: '24px',
    backgroundColor: '#131b3a',
    border: '2px solid #00ff9d', // Primary
    padding: '4px',
    boxShadow: '0 0 20px rgba(0, 255, 157, 0.2)',
    overflow: 'hidden',
    position: 'relative' as const,
  },
  avatarPlaceholder: {
    width: '100%', height: '100%',
    borderRadius: '18px',
    background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2300ff9d\' stroke-width=\'1\'%3E%3Cpath d=\'M12 2a10 10 0 0 1 10 10v0a10 10 0 0 1-10 10v0a10 10 0 0 1-10-10v0a10 10 0 0 1 10-10z\' opacity=\'0.2\'/%3E%3C/svg%3E")',
    backgroundSize: 'cover',
  },
  scanlineOverlay: {
    position: 'absolute' as const,
    inset: 0,
    background: 'linear-gradient(to bottom, transparent 50%, rgba(0, 255, 157, 0.1) 50%)',
    backgroundSize: '100% 4px',
    pointerEvents: 'none' as const,
  },
  newCadetBadge: {
    position: 'absolute' as const,
    bottom: '-10px', right: '-10px',
    backgroundColor: '#0A0E29',
    border: '1px solid #00ff9d',
    color: '#00ff9d',
    fontSize: '9px',
    fontWeight: '800',
    padding: '2px 6px',
    borderRadius: '4px',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
  },
  titleWrapper: {
    textAlign: 'center' as const,
  },
  mainTitle: {
    fontSize: '32px',
    fontWeight: '800',
    lineHeight: '1.1',
    color: '#ffffff',
    margin: '0 0 12px 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '-0.5px',
  },
  highlightText: {
    background: 'linear-gradient(90deg, #00ff9d 0%, #34d399 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 0 20px rgba(0,255,157,0.3)',
  },
  subtitle: {
    fontSize: '14px',
    color: '#9CA3AF', // Gray 400
    margin: 0,
    fontWeight: '300',
    maxWidth: '280px',
    lineHeight: '1.5',
  },
  // Formulario
  formContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  label: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#00ff9d',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    marginLeft: '4px',
  },
  inputWrapper: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#131b3a', // Surface Dark
    border: '1px solid #2a3b68',
    borderRadius: '12px',
    transition: 'all 0.3s',
  },
  input: {
    width: '100%',
    backgroundColor: 'transparent',
    border: 'none',
    padding: '16px 16px',
    paddingRight: '48px',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '500',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  inputIconRight: {
    position: 'absolute' as const,
    right: '12px',
    pointerEvents: 'none' as const,
  },
  eyeButton: {
    position: 'absolute' as const,
    right: '8px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Botones Sociales
  socialRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginTop: '8px', 
  },
  socialButton: {
    backgroundColor: '#131b3a',
    border: '1px solid #2a3b68',
    borderRadius: '12px',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    color: '#E5E7EB',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  socialText: {
    fontSize: '13px',
    fontWeight: '600',
  },
  // Botón Principal
  primaryButton: {
    width: '100%',
    backgroundColor: '#00ff9d', // Primary
    color: '#0A0E29', // Text Dark
    border: 'none',
    borderRadius: '12px',
    padding: '18px',
    fontSize: '16px',
    fontWeight: '800',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    cursor: 'pointer',
    marginTop: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 20px rgba(0, 255, 157, 0.4)',
    transition: 'transform 0.1s, box-shadow 0.2s',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: '32px',
    textAlign: 'center' as const,
  },
  footerText: {
    fontSize: '13px',
    color: '#9CA3AF',
  },
  linkRegister: {
    color: '#00ff9d',
    fontWeight: '700',
    cursor: 'pointer',
    marginLeft: '6px',
    textDecoration: 'none',
  },
};

export default LoginScreen;