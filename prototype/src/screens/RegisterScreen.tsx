import React, { useState } from 'react';

interface RegisterScreenProps {
    alIrALogin: () => void;
    alIrAOtp: (email: string) => void;
}

/**
 * Pantalla de Registro (Skin: Escuadrón/Misión).
 * Orientada al Padre/Representante.
 * Sin gamificación excesiva ni botón atrás.
 */
const RegisterScreen: React.FC<RegisterScreenProps> = ({ alIrALogin, alIrAOtp }) => {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [mostrarPassword, setMostrarPassword] = useState(false);

    // Estados de feedback
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Helpers de validación
    const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    const emailsMatch = email.trim() === confirmEmail.trim();
    const passwordsMatch = password === confirmPassword;
    const isPasswordValid = password.length >= 6;

    const isFormValid =
        nombre.trim().length > 0 &&
        isValidEmail(email) &&
        confirmEmail.trim().length > 0 &&
        emailsMatch &&
        isPasswordValid &&
        passwordsMatch;

    const manejarRegistro = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        // Validaciones básicas
        if (!nombre.trim() || !email.trim() || !confirmEmail.trim() || !password || !confirmPassword) {
            setErrorMsg('Por favor completa todos los campos.');
            return;
        }

        if (password.length < 6) {
            setErrorMsg('La clave debe tener al menos 6 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            setErrorMsg('Las contraseñas no coinciden.');
            return;
        }

        if (email.trim() !== confirmEmail.trim()) {
            setErrorMsg('Los correos no coinciden.');
            return;
        }

        try {
            const { supabase } = await import('../lib/supabaseClient');

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: nombre,
                    }
                }
            });

            if (error) throw error;

            // Éxito: Guardar email y navegar a OTP
            // IMPORTANTE: Primero guardar en storage, luego navegar
            localStorage.setItem('pending_signup_email', email);
            alIrAOtp(email);

        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message || 'Error al crear la cuenta.');
        }
    };

    return (
        <div style={styles.pageContainer}>
            {/* Fondo Ambiental */}
            <div style={styles.ambientBackground}>
                <div style={styles.gridPattern} />
                <div style={styles.glowTopRight} />
                <div style={styles.glowBottomLeft} />
            </div>

            {/* Header de Navegación (Solo espacio o status si se quisiera, sin botón atrás) */}
            <nav style={styles.navBar}>
                {/* Empty navbar to maintain spacing consistency if needed, or remove padding */}
            </nav>

            <div style={styles.scrollContainer}>
                {/* Header Section */}
                <div style={styles.heroSection}>
                    <div style={styles.avatarContainer}>
                        {/* IMAGEN MENTOR (Misma que Login, sin badge de cadete) */}
                        <div style={styles.mentorImageWrapper}>
                            <img
                                src="/images/mentor_login.png"
                                alt="Mentor"
                                style={styles.mentorImage}
                                onError={(e) => e.currentTarget.style.display = 'none'}
                            />
                        </div>
                    </div>

                    <div style={styles.titleWrapper}>
                        <h1 style={styles.mainTitle}>
                            REGISTRO DEL PADRE <br />
                            <span style={styles.highlightText}>O REPRESENTANTE</span>
                        </h1>
                        <p style={styles.subtitle}>
                            Crea la cuenta del adulto responsable para gestionar el aprendizaje.
                        </p>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={manejarRegistro} style={styles.formContainer}>

                    {/* Campo: NOMBRE Y APELLIDO */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>NOMBRE Y APELLIDO</label>
                        <div style={styles.inputWrapper}>
                            <input
                                type="text"
                                placeholder="Ej. Juan Pérez"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                style={styles.input}
                            />
                        </div>
                    </div>

                    {/* Campo: EMAIL */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>EMAIL DEL PADRE O REPRESENTANTE</label>
                        <div style={styles.inputWrapper}>
                            <input
                                type="email"
                                placeholder="nombre@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={styles.input}
                            />
                        </div>
                    </div>

                    {/* Campo: CONFIRMAR EMAIL */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>CONFIRMAR EMAIL</label>
                        <div style={styles.inputWrapper}>
                            <input
                                type="email"
                                placeholder="Repite tu correo"
                                value={confirmEmail}
                                onChange={(e) => setConfirmEmail(e.target.value)}
                                style={styles.input}
                            />
                        </div>
                        {confirmEmail && !emailsMatch && (
                            <span style={{ color: '#ffb3b3', fontSize: '11px', marginTop: '2px', marginLeft: '4px' }}>
                                Los correos no coinciden
                            </span>
                        )}
                    </div>

                    {/* Campo: PASSWORD */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>CLAVE (Mín. 6 caracteres)</label>
                        <div style={styles.inputWrapper}>
                            <input
                                type={mostrarPassword ? "text" : "password"}
                                placeholder="Ingresa tu clave"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={styles.input}
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
                            />
                        </div>
                    </div>

                    {/* Mensajes de Estado Inline */}
                    {errorMsg && (
                        <div style={styles.errorMsg}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* CTA Register */}
                    <button
                        type="submit"
                        disabled={!isFormValid}
                        style={isFormValid ? styles.primaryButton : { ...styles.primaryButton, ...styles.disabledButton }}
                    >
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
                        <br />
                        <span onClick={alIrALogin} style={styles.linkRegister}>INICIA SESIÓN</span>
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
    },
    mentorImageWrapper: {
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        overflow: 'hidden',
        border: '2px solid #34D399',
        boxShadow: '0 0 20px rgba(52, 211, 153, 0.2)',
        backgroundColor: '#131b3a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mentorImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover' as const,
    },
    titleWrapper: {
        textAlign: 'center' as const,
    },
    mainTitle: {
        fontSize: '24px',
        fontWeight: '800',
        lineHeight: '1.2',
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
        maxWidth: '280px',
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
    successMsg: {
        fontSize: '13px',
        color: '#34D399',
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        padding: '10px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
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
        marginTop: '8px',
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
        fontSize: '14px',
        color: '#9CA3AF',
        lineHeight: '1.6',
    },
    linkRegister: {
        color: '#34D399',
        fontWeight: '800',
        cursor: 'pointer',
        textDecoration: 'none',
        fontSize: '16px',
        display: 'inline-block',
        marginTop: '4px',
    },
    disabledButton: {
        opacity: 0.5,
        cursor: 'not-allowed',
        boxShadow: 'none',
        transform: 'none',
    },
};

export default RegisterScreen;
