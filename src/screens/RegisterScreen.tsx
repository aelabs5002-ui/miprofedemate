import React, { useState } from 'react';

interface RegisterScreenProps {
    alIrALogin: () => void;
}

/**
 * Pantalla de Registro rediseñada (Skin: Escuadrón/Misión).
 * Mantiene lógica intacta (validaciones y handlers) con nueva UI futurista.
 */
const RegisterScreen: React.FC<RegisterScreenProps> = ({ alIrALogin }) => {
    // --- LÓGICA ORIGINAL INTACTA ---
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [mostrarPassword, setMostrarPassword] = useState(false);

    const manejarRegistro = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }
        if (nombre && email && password.length >= 6) {
            alert('Registro simulado exitoso. Ahora inicia sesión.');
            alIrALogin();
        } else {
            alert('Por favor completa todos los campos (Pass min 6)');
        }
    };
    // --------------------------------

    return (
        <div style={styles.pageContainer}>
            {/* Fondo Ambiental */}
            <div style={styles.ambientBackground}>
                <div style={styles.gridPattern} />
                <div style={styles.glowTopRight} />
                <div style={styles.glowBottomLeft} />
            </div>

            {/* Header de Navegación */}
            <nav style={styles.navBar}>
                <button style={styles.navBackButton} onClick={alIrALogin} type="button">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={styles.backText}>VOLVER</span>
                </button>
            </nav>

            <div style={styles.scrollContainer}>
                {/* Header Section */}
                <div style={styles.heroSection}>
                    <div style={styles.avatarContainer}>
                        {/* Avatar Placeholder: Green Variant for Register */}
                        <div style={{ ...styles.avatarInner, borderColor: '#34D399' }}>
                            <div style={styles.avatarPlaceholder} />
                            <div style={styles.scanlineOverlay} />
                        </div>
                        <div style={{ ...styles.newCadetBadge, color: '#34D399', borderColor: '#34D399' }}>RECLUTAMIENTO</div>
                    </div>

                    <div style={styles.titleWrapper}>
                        <h1 style={styles.mainTitle}>
                            NUEVO <br />
                            <span style={styles.highlightText}>CADETE</span>
                        </h1>
                        <p style={styles.subtitle}>
                            Crea tu identidad y únete a las filas del conocimiento.
                        </p>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={manejarRegistro} style={styles.formContainer}>

                    {/* Campo: NOMBRE */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>NOMBRE DE PILOTO</label>
                        <div style={styles.inputWrapper}>
                            <input
                                type="text"
                                placeholder="Tu nombre o apodo"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                style={styles.input}
                                required
                            />
                            <div style={styles.inputIconRight}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                                    <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Campo: EMAIL */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>COMUNICACIÓN (EMAIL)</label>
                        <div style={styles.inputWrapper}>
                            <input
                                type="email"
                                placeholder="nombre@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={styles.input}
                                required
                            />
                            <div style={styles.inputIconRight}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinecap="round" strokeLinejoin="round" />
                                    <polyline points="22,6 12,13 2,6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Campo: PASSWORD */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>CLAVE DE ACCESO</label>
                        <div style={styles.inputWrapper}>
                            <input
                                type={mostrarPassword ? "text" : "password"}
                                placeholder="Mínimo 6 caracteres"
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
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" /><line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Campo: CONFIRM PASSWORD */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>CONFIRMAR CLAVE</label>
                        <div style={styles.inputWrapper}>
                            <input
                                type={mostrarPassword ? "text" : "password"}
                                placeholder="Repite la clave"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={styles.input}
                                required
                            />
                        </div>
                    </div>

                    {/* CTA Register */}
                    <button type="submit" style={styles.primaryButton}>
                        <span>FINALIZAR REGISTRO</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8 }}>
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="8.5" cy="7" r="4" />
                            <line x1="20" y1="8" x2="20" y2="14" />
                            <line x1="23" y1="11" x2="17" y2="11" />
                        </svg>
                    </button>

                </form>

                {/* Footer Login Link */}
                <div style={styles.footer}>
                    <p style={styles.footerText}>
                        ¿Ya tienes credenciales?
                        <span onClick={alIrALogin} style={styles.linkRegister}>Inicia Sesión</span>
                    </p>
                </div>

            </div>
        </div>
    );
};

// --- ESTILOS NEON / FUTURISTAS (Reutilizados de LoginScreen) ---
const styles = {
    pageContainer: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column' as const,
        backgroundColor: '#0A0E29', // Dark Navy
        fontFamily: "'Inter', sans-serif",
        color: '#ffffff',
        position: 'relative' as const,
        overflow: 'hidden',
    },
    // Background
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
        backgroundColor: 'rgba(52, 211, 153, 0.08)', // Emerald hint
        filter: 'blur(80px)',
        borderRadius: '50%',
    },
    glowBottomLeft: {
        position: 'absolute' as const,
        bottom: '-10%', left: '-10%',
        width: '500px', height: '500px',
        backgroundColor: 'rgba(0, 255, 157, 0.05)',
        filter: 'blur(80px)',
        borderRadius: '50%',
    },
    // Nav
    navBar: {
        position: 'relative' as const,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        padding: '24px',
    },
    navBackButton: {
        padding: '8px 16px',
        borderRadius: '8px',
        backgroundColor: '#131b3a',
        border: '1px solid #2a3b68',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    backText: {
        fontSize: '12px',
        fontWeight: '700',
        letterSpacing: '1px',
    },
    // Content
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
        marginBottom: '24px',
        marginTop: '0px',
    },
    avatarContainer: {
        position: 'relative' as const,
        marginBottom: '24px',
        transform: 'rotate(-2deg)', // Slight tilt opposite to login
    },
    avatarInner: {
        width: '80px', height: '80px',
        borderRadius: '20px',
        backgroundColor: '#131b3a',
        border: '2px solid #34D399',
        padding: '4px',
        boxShadow: '0 0 20px rgba(52, 211, 153, 0.2)',
        overflow: 'hidden',
        position: 'relative' as const,
    },
    avatarPlaceholder: {
        width: '100%', height: '100%',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
    },
    scanlineOverlay: {
        position: 'absolute' as const,
        inset: 0,
        background: 'linear-gradient(to bottom, transparent 50%, rgba(52, 211, 153, 0.1) 50%)',
        backgroundSize: '100% 4px',
        pointerEvents: 'none' as const,
    },
    newCadetBadge: {
        position: 'absolute' as const,
        bottom: '-10px', right: '-10px',
        backgroundColor: '#0A0E29',
        border: '1px solid #34D399',
        color: '#34D399',
        fontSize: '9px',
        fontWeight: '800',
        padding: '2px 6px',
        borderRadius: '4px',
        letterSpacing: '1px',
    },
    titleWrapper: {
        textAlign: 'center' as const,
    },
    mainTitle: {
        fontSize: '28px',
        fontWeight: '800',
        lineHeight: '1.1',
        color: '#ffffff',
        margin: '0 0 8px 0',
        textTransform: 'uppercase' as const,
        letterSpacing: '-0.5px',
    },
    highlightText: {
        background: 'linear-gradient(90deg, #34D399 0%, #00ff9d 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    subtitle: {
        fontSize: '13px',
        color: '#9CA3AF',
        margin: 0,
        fontWeight: '400',
        maxWidth: '260px',
        lineHeight: '1.4',
    },
    // Form
    formContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '16px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '6px',
    },
    label: {
        fontSize: '10px',
        fontWeight: '700',
        color: '#34D399',
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
        padding: '14px 16px',
        paddingRight: '48px',
        color: '#ffffff',
        fontSize: '14px',
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
    // Button
    primaryButton: {
        width: '100%',
        backgroundColor: '#34D399', // Emerald accent for register
        color: '#064E3B',
        border: 'none',
        borderRadius: '12px',
        padding: '16px',
        fontSize: '15px',
        fontWeight: '800',
        textTransform: 'uppercase' as const,
        letterSpacing: '1px',
        cursor: 'pointer',
        marginTop: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 20px rgba(52, 211, 153, 0.3)',
        transition: 'transform 0.1s',
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
        color: '#34D399',
        fontWeight: '700',
        cursor: 'pointer',
        marginLeft: '6px',
        textDecoration: 'none',
    },
};

export default RegisterScreen;
