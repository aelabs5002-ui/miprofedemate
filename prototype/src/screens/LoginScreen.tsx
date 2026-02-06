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
  // NOTA: 'iniciarSesion' del context ahora se usará DESPUÉS de seleccionar alumno.
  // Aquí solo gestionamos la Auth del PADRE.

  // Estados
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorLogin, setErrorLogin] = useState<string | null>(null);

  // Estado de conectividad
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Basic connectivity check
    fetch('/api/health').then(r => r.ok && setIsOnline(true)).catch(() => setIsOnline(false));

    // Check if already logged in as Parent (Supabase Session)
    // If yes, we should redirect to Student Selection (managed by parent component or navigator)
    // For now, we rely on the user explicit action or App wrapper handling session.
  }, []);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorLogin(null);
    setMessage(null);

    if (!email.includes('@')) {
      setErrorLogin('Ingresa un correo válido.');
      setLoading(false);
      return;
    }

    try {
      // Import dinámico para asegurar que lib existe
      const { supabase } = await import('../lib/supabaseClient');

      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          // Redirigir a la misma URL base. El App debe detectar el hash de supabase.
          emailRedirectTo: window.location.origin
        }
      });

      if (error) throw error;

      setMessage('¡Enlace enviado! Revisa tu correo para entrar.');

    } catch (err: any) {
      console.error(err);
      setErrorLogin(err.message || 'Error al enviar enlace.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.ambientBackground}>
        <div style={styles.gridPattern} />
        <div style={styles.glowTopRight} />
        <div style={styles.glowBottomLeft} />
      </div>

      <nav style={styles.navBar}>
        <div />
        <div style={{ ...styles.statusBadge, borderColor: isOnline ? 'rgba(0, 255, 157, 0.5)' : 'rgba(107, 114, 128, 0.5)' }}>
          <span style={{ ...styles.statusDot, backgroundColor: isOnline ? '#00ff9d' : '#6B7280', boxShadow: isOnline ? '0 0 8px #00ff9d' : 'none' }} />
          <span style={{ ...styles.statusText, color: isOnline ? 'rgba(0, 255, 157, 0.8)' : '#9CA3AF' }}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </nav>

      <div style={styles.scrollContainer}>
        <div style={styles.heroSection}>
          <div style={styles.avatarContainer}>
            <div style={styles.mentorImageWrapper}>
              <img src="/images/mentor_login.png" alt="Mentor" style={styles.mentorImage} />
            </div>
          </div>

          <div style={styles.titleWrapper}>
            <h1 style={styles.mainTitle}>
              ACCESO <br />
              <span style={styles.highlightText}>PADRES</span>
            </h1>
            <p style={styles.subtitle}>
              Gestiona el aprendizaje de tus hijos. Ingresa con tu correo.
            </p>
          </div>
        </div>

        {!message ? (
          <form onSubmit={handleMagicLink} style={styles.formContainer}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>CORREO ELECTRÓNICO</label>
              <div style={styles.inputWrapper}>
                <input
                  type="email"
                  placeholder="padre@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  disabled={loading}
                />
              </div>
            </div>

            {errorLogin && (
              <div style={styles.errorMsg}>
                <span>{errorLogin}</span>
              </div>
            )}

            <button type="submit" style={styles.primaryButton} disabled={loading}>
              <span>{loading ? 'ENVIANDO...' : 'ENVIAR ENLACE MÁGICO'}</span>
            </button>
          </form>
        ) : (
          <div style={{ ...styles.formContainer, alignItems: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: '40px' }}>✉️</div>
            <h3 style={{ color: '#00ff9d' }}>{message}</h3>
            <p style={{ color: '#ccc', fontSize: '14px' }}>Puedes cerrar esta pestaña y usar el enlace recibido.</p>
            <button onClick={() => setMessage(null)} style={{ ...styles.primaryButton, backgroundColor: '#2a3b68', color: '#fff' }}>
              VOLVER
            </button>
          </div>
        )}

        <div style={styles.footer}>
          <p style={styles.footerText}>
            No se requiere contraseña. Usamos Magic Links para máxima seguridad.
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