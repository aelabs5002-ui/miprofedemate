import React, { useEffect } from 'react';

interface TermsConditionScreenProps {
    alVolver: () => void;
}

/**
 * Pantalla de Términos y Condiciones (Borrador).
 * Diseño Dark/Neon consistente con RegisterScreen.
 */
const TermsConditionScreen: React.FC<TermsConditionScreenProps> = ({ alVolver }) => {

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div style={styles.pageContainer}>
            {/* Fondo Ambiental */}
            <div style={styles.ambientBackground}>
                <div style={styles.gridPattern} />
                <div style={styles.glowTopRight} />
                <div style={styles.glowBottomLeft} />
            </div>

            <nav style={styles.navBar}>
                {/* Empty navbar for spacing consistency */}
            </nav>

            <div style={styles.scrollContainer}>
                {/* Header Section */}
                <div style={styles.heroSection}>
                    <div style={styles.titleWrapper}>
                        <h1 style={styles.mainTitle}>
                            TÉRMINOS Y <br />
                            <span style={styles.highlightText}>CONDICIONES</span>
                        </h1>
                        <p style={styles.subtitle}>
                            (Borrador) Lee atentamente antes de continuar.
                        </p>
                    </div>
                </div>

                {/* Terms Card */}
                <div style={styles.termsCard}>
                    <ul style={styles.termsList}>
                        <li style={styles.termItem}>
                            <strong>Apoyo Educativo:</strong> Esta aplicación es una herramienta de apoyo y práctica matemática. No reemplaza la educación formal ni al colegio.
                        </li>
                        <li style={styles.termItem}>
                            <strong>Responsabilidad del Adulto:</strong> El padre o representante legal es el único responsable de supervisar el uso de la aplicación por parte del menor.
                        </li>
                        <li style={styles.termItem}>
                            <strong>Seguridad de la Cuenta:</strong> Es responsabilidad del usuario mantener la confidencialidad de sus credenciales. No compartir códigos ni accesos con terceros.
                        </li>
                        <li style={styles.termItem}>
                            <strong>Actualizaciones:</strong> Nos reservamos el derecho de actualizar estos términos y condiciones en cualquier momento para mejorar el servicio.
                        </li>
                        <li style={styles.termItem}>
                            <strong>Soporte:</strong> Para cualquier consulta o problema técnico, puedes contactarnos en <span style={{ color: '#34D399' }}>soporte@tuprofedemate.com</span>.
                        </li>
                    </ul>
                </div>

                {/* Footer Buttons */}
                <div style={styles.footer}>
                    <button onClick={alVolver} style={styles.secondaryButton}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        VOLVER AL REGISTRO
                    </button>
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
    // Background (Copy from RegisterScreen)
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
        backgroundColor: 'rgba(52, 211, 153, 0.08)',
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
        marginBottom: '32px',
        textAlign: 'center' as const,
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
    // Terms Card
    termsCard: {
        backgroundColor: '#131b3a',
        border: '1px solid #2a3b68',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    },
    termsList: {
        listStyleType: 'disc',
        paddingLeft: '20px',
        margin: 0,
        color: '#D1D5DB',
        fontSize: '14px',
        lineHeight: '1.6',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '16px',
    },
    termItem: {
        marginBottom: '0',
    },
    // Footer
    footer: {
        marginTop: 'auto',
        display: 'flex',
        justifyContent: 'center',
    },
    secondaryButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        color: '#ffffff',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.2s',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
    },
};

export default TermsConditionScreen;
