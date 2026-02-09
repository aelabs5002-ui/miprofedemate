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
  // DEBUG FLAGS
  const DEBUG_AUTH = import.meta.env.DEV || import.meta.env.VITE_DEBUG_AUTH === '1';
  const DEBUG_AI = import.meta.env.DEV || import.meta.env.VITE_DEBUG_AI === '1';

  // Estados
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorLogin, setErrorLogin] = useState<string | null>(null);

  // Estado de conectividad
  const [isOnline, setIsOnline] = useState(false);

  // AI Health Check State
  const [aiHealth, setAiHealth] = useState<{ ok: boolean; status?: number; latencyMs?: number; msg?: string } | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    // Basic connectivity check (optional, if /api/health existed, but now removed per instruction)
    // setIsOnline(true); 
    // We can just set online to true or check navigator.onLine
    setIsOnline(navigator.onLine);
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
    return () => {
      window.removeEventListener('online', () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
    }
  }, []);

  const maskEmail = (e: string) => {
    if (!e || !e.includes('@')) return '***';
    const [name, domain] = e.split('@');
    return `${name.substring(0, 2)}***@${domain}`;
  };

  const testAI = async () => {
    if (!DEBUG_AI) return;
    setLoadingAi(true);
    setAiHealth(null);
    const start = Date.now();
    try {
      console.log('[AI-CHECK] Iniciando test de conectividad...');
      // Intento 1: Supabase Functions Ping (Zero Cost - Validation Error Expected)
      const { supabase } = await import('../lib/supabaseClient');

      // Llamada intencionalmente vacía/inválida para provocar un 400 controlada
      // Esto valida que llegamos al endpoint sin gastar tokens de IA
      const { data, error } = await supabase.functions.invoke('mission-build', {
        body: {} // Empty body should trigger validation error in Mission Builder
      });

      const latency = Date.now() - start;

      // Si recibimos error de Supabase (network)
      if (error) {
        console.log('[AI-CHECK] Error invoking:', error);
        setAiHealth({ ok: false, status: 500, latencyMs: latency, msg: error.message });
        return;
      }

      // Si llegamos aquí, la función respondió. 
      // Es probable que data contenga un error de validación "Missing studentId", etc.
      // Eso CUENTA como éxito de conectividad.
      console.log('[AI-CHECK] Response:', { data });
      setAiHealth({ ok: true, status: 200, latencyMs: latency, msg: 'Connectivity OK (Validation response)' });

    } catch (err: any) {
      const latency = Date.now() - start;
      console.error('[AI-CHECK] Exception:', err);
      setAiHealth({ ok: false, status: 0, latencyMs: latency, msg: err.message });
    } finally {
      setLoadingAi(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorLogin(null);

    if (DEBUG_AUTH) {
      console.log("Attempting login for:", { email: maskEmail(email) });
    }

    if (!email.includes('@') || !password) {
      setErrorLogin('Ingresa correo y contraseña.');
      setLoading(false);
      return;
    }

    try {
      const { supabase } = await import('../lib/supabaseClient');

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (DEBUG_AUTH) {
        console.log("Login result:", {
          error: error?.message,
          hasSession: !!data?.session,
          userId: data?.session?.user?.id
        });
      }

      if (error) throw error;

      // La redirección/estado se maneja globalmente por onAuthStateChange en AppNavigator/Context

    } catch (err: any) {
      console.error(err);
      setErrorLogin(err.message === 'Invalid login credentials'
        ? 'Credenciales incorrectas.'
        : (err.message || 'Error al iniciar sesión.'));
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
              Gestiona el aprendizaje de tus hijos. Ingresa con tu correo y contraseña.
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} style={styles.formContainer}>
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

          <div style={styles.inputGroup}>
            <label style={styles.label}>CONTRASEÑA</label>
            <div style={styles.inputWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? '👁️' : '🔒'}
              </button>
            </div>
          </div>

          {errorLogin && (
            <div style={styles.errorMsg}>
              <span>{errorLogin}</span>
            </div>
          )}

          <button type="submit" style={styles.primaryButton} disabled={loading}>
            <span>{loading ? 'INGRESANDO...' : 'INGRESAR'}</span>
          </button>

          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <span style={{ color: '#6B7280', fontSize: '13px' }}>¿No tienes cuenta? </span>
            <a onClick={alIrARegistro} style={styles.linkRegister}>
              Regístrate aquí
            </a>
          </div>
        </form>

        <div style={styles.footer}>
          {/* Footer content removed or simplified */}
        </div>

        {/* DEBUG PANEL */}
        {(DEBUG_AI || DEBUG_AUTH) && (
          <div style={{
            marginTop: 20,
            padding: 10,
            border: '1px dashed #FFD700',
            borderRadius: 8,
            fontSize: 12,
            color: '#FFD700',
            backgroundColor: 'rgba(255, 215, 0, 0.05)'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: 5 }}>🔧 DEBUG PANEL</div>
            {DEBUG_AI && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button type="button" onClick={testAI} disabled={loadingAi} style={{
                  padding: '4px 8px', border: '1px solid #FFD700', background: 'transparent', color: '#FFD700', cursor: 'pointer'
                }}>
                  {loadingAi ? 'Probando...' : 'Test AI Connectivity'}
                </button>
                {aiHealth && (
                  <span>
                    {aiHealth.ok ? '✅ OK' : '❌ ERR'}
                    {' '}({aiHealth.latencyMs}ms)
                    {aiHealth.msg && ` - ${aiHealth.msg.substring(0, 50)}...`}
                  </span>
                )}
              </div>
            )}
            {DEBUG_AUTH && <div style={{ marginTop: 5 }}>Auth Logs: ACTIVATED (Check Console)</div>}
          </div>
        )}

      </div>
    </div>
  );
};

// --- ESTILOS NEON / FUTURISTAS ---
const styles = {
  buildIdLabel: {
    fontSize: '10px',
    color: '#6B7280',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
  },
  buildIdValue: {
    fontSize: '10px',
    color: '#9CA3AF',
    fontFamily: 'monospace',
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