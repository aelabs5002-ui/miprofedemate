import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

interface Props {
  alIrARegistro: () => void;
}

/**
 * Pantalla de inicio de sesión rediseñada (Skin: Escuadrón/Misión).
 * Entrypoint principal con persistencia y healthcheck.
 */
const LoginScreen: React.FC<Props> = ({ alIrARegistro }) => {
  const { iniciarSesion } = useApp();

  // Estados de campos
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [mostrarClave, setMostrarClave] = useState(false);
  const [errorLogin, setErrorLogin] = useState<string | null>(null);

  // Estado de conectividad (No bloqueante)
  const [isOnline, setIsOnline] = useState(false);

  // 1. Cargar datos guardados y verificar estado al montar
  useEffect(() => {
    // Healthcheck logic
    const checkHealth = async () => {
      try {
        const r1 = await fetch('/api/health'); // Intento 1
        if (r1.ok) { setIsOnline(true); return; }
        const r2 = await fetch('/health'); // Intento 2
        if (r2.ok) { setIsOnline(true); return; }
        setIsOnline(false);
      } catch (e) {
        setIsOnline(false); // Fallo de red = Offline
      }
    };
    checkHealth();

    // Cargar credenciales
    const savedUser = localStorage.getItem('tpdm_usuario');
    const savedPass = localStorage.getItem('tpdm_clave');
    if (savedUser) setUsuario(savedUser);
    if (savedPass) setClave(savedPass);
  }, []);

  // 2. Guardado automático al escribir
  const handleUserChange = (val: string) => {
    setUsuario(val);
    localStorage.setItem('tpdm_usuario', val);
    if (errorLogin) setErrorLogin(null);
  };

  const handlePassChange = (val: string) => {
    setClave(val);
    localStorage.setItem('tpdm_clave', val);
    if (errorLogin) setErrorLogin(null);
  };

  // 3. Main Action
  const manejarLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones inline
    if (!usuario || usuario.length < 3) {
      setErrorLogin('El usuario es obligatorio (mín. 3 caracteres).');
      return;
    }
    if (!clave) {
      setErrorLogin('Por favor ingresa tu clave.');
      return;
    }

    // Iniciar Sesión -> Esto actualiza el contexto y AppNavigator cambia a MisionScreen
    iniciarSesion({
      id: 'usr_123',
      nombre: usuario,
      correo: usuario + '@tutor.com',
      rol: 'Alumno'
    });
  };

  return (
    <div style={styles.pageContainer}>
      {/* Fondo Ambiental */}
      <div style={styles.ambientBackground}>
        <div style={styles.gridPattern} />
        <div style={styles.glowTopRight} />
        <div style={styles.glowBottomLeft} />
      </div>

      {/* Header (Status Only, No Back Button) */}
      <nav style={styles.navBar}>
        <div /> {/* Spacer vacio a la izquierda */}
        <div style={{ ...styles.statusBadge, borderColor: isOnline ? 'rgba(0, 255, 157, 0.5)' : 'rgba(107, 114, 128, 0.5)' }}>
          <span style={{ ...styles.statusDot, backgroundColor: isOnline ? '#00ff9d' : '#6B7280', boxShadow: isOnline ? '0 0 8px #00ff9d' : 'none' }} />
          <span style={{ ...styles.statusText, color: isOnline ? 'rgba(0, 255, 157, 0.8)' : '#9CA3AF' }}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </nav>

      <div style={styles.scrollContainer}>
        {/* Sección Hero / Mentor */}
        <div style={styles.heroSection}>
          <div style={styles.avatarContainer}>
            {/* IMAGEN MENTOR */}
            <div style={styles.mentorImageWrapper}>
              <img
                src="/images/mentor_login.png"
                alt="Mentor"
                style={styles.mentorImage}
              />
            </div>
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

          {/* Campo: USUARIO */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>USUARIO</label>
            <div style={styles.inputWrapper}>
              <input
                type="text"
                placeholder="Ingresa tu usuario"
                value={usuario}
                onChange={(e) => handleUserChange(e.target.value)}
                style={styles.input}
                className="input-glow"
              />
              <div style={styles.inputIconRight}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Campo: CLAVE */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>CLAVE</label>
            <div style={styles.inputWrapper}>
              <input
                type={mostrarClave ? "text" : "password"}
                placeholder="Ingresa tu clave"
                value={clave}
                onChange={(e) => handlePassChange(e.target.value)}
                style={styles.input}
              />
              <button
                type="button"
                onClick={() => setMostrarClave(!mostrarClave)}
                style={styles.eyeButton}
              >
                {mostrarClave ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" /><line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" strokeLinejoin="round" /></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                )}
              </button>
            </div>
          </div>

          {/* Mensaje de Error Inline */}
          {errorLogin && (
            <div style={styles.errorMsg}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              <span>{errorLogin}</span>
            </div>
          )}

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
            <br />
            <span onClick={alIrARegistro} style={styles.linkRegister}>REGÍSTRATE AQUÍ</span>
          </p>
          <p style={styles.buildIdText}>
            build: {import.meta.env.VITE_BUILD_ID || 'dev'}
          </p>
        </div>

      </div>
    </div>
  );
};

// --- ESTILOS NEON / FUTURISTAS ---
const styles = {
  buildIdText: {
    fontSize: '10px',
    color: '#6B7280',
    marginTop: '12px',
    fontFamily: 'monospace',
    opacity: 0.7,
  },
  pageContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: '#0A0E29', // Dark Navy Background
    fontFamily: "'Inter', sans-serif",
    color: '#ffffff',
    position: 'relative' as const,
    overflow: 'hidden',
  },
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
    backgroundColor: 'rgba(0, 255, 157, 0.08)',
    filter: 'blur(80px)',
    borderRadius: '50%',
  },
  glowBottomLeft: {
    position: 'absolute' as const,
    bottom: '-10%', left: '-10%',
    width: '500px', height: '500px',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    filter: 'blur(80px)',
    borderRadius: '50%',
  },
  navBar: {
    position: 'relative' as const,
    zIndex: 10,
    display: 'flex',
    justifyContent: 'space-between', // Spacer to left, Status to right
    alignItems: 'center',
    padding: '24px',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#131b3a',
    border: '1px solid',
    borderRadius: '20px',
    padding: '4px 12px',
    gap: '8px',
    transition: 'all 0.3s',
  },
  statusDot: {
    width: '8px', height: '8px',
    borderRadius: '50%',
    transition: 'all 0.3s',
  },
  statusText: {
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '1px',
    transition: 'all 0.3s',
  },
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
  avatarContainer: {
    position: 'relative' as const,
    marginBottom: '24px',
    transition: 'transform 0.3s',
  },
  mentorImageWrapper: {
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '3px solid #00ff9d',
    boxShadow: '0 0 25px rgba(0, 255, 157, 0.3)',
    backgroundColor: '#131b3a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
  },
  mentorImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    position: 'relative' as const,
    zIndex: 1,
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
    color: '#9CA3AF',
    margin: 0,
    fontWeight: '300',
    maxWidth: '280px',
    lineHeight: '1.5',
  },
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
    backgroundColor: '#131b3a',
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
  errorMsg: {
    fontSize: '13px',
    color: '#FF4C4C',
    backgroundColor: 'rgba(255, 76, 76, 0.1)',
    padding: '10px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#00ff9d',
    color: '#0A0E29',
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
    fontSize: '14px',
    color: '#9CA3AF',
    lineHeight: '1.6',
  },
  linkRegister: {
    color: '#00ff9d',
    fontWeight: '800',
    cursor: 'pointer',
    textDecoration: 'none',
    fontSize: '16px',
    display: 'inline-block',
    marginTop: '4px',
    padding: '8px',
  },
};

export default LoginScreen;