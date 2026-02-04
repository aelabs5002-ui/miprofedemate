import React from 'react';

interface SubirTareaScreenProps {
    alVolver: () => void;
    alIniciarCreacion: (missionId: string) => void;
}

/**
 * Pantalla de Subida de Material Rediseñada (Skin: Escuadrón / Data Upload).
 * Mantiene lógica de navegación y simulación de acciones.
 */
const SubirTareaScreen: React.FC<SubirTareaScreenProps> = ({ alVolver, alIniciarCreacion }) => {

    // Simular acción de continuar
    const handleContinue = () => {
        // En funcionalidad real, aquí validaríamos que haya archivo subido
        alIniciarCreacion('new-mission-from-task');
    };

    return (
        <div style={styles.pageContainer}>
            {/* Nav Protection */}
            <style>{`
                html, body { overflow-x: hidden !important; width: 100% !important; max-width: 100% !important; position: relative !important; }
            `}</style>

            {/* Fondo Ambiental */}
            <div style={styles.ambientBackground}>
                <div style={styles.gridPattern} />
                <div style={styles.glowTopRight} />
            </div>

            {/* Header Tipo HUD */}
            <header style={styles.header}>
                <button style={styles.backButton} onClick={alVolver}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={styles.backText}>ABORTAR</span>
                </button>
                <h1 style={styles.headerTitle}>CARGAR DATOS</h1>
                <button style={styles.helpButton}>
                    <span style={styles.helpIcon}>?</span>
                </button>
            </header>

            <div style={styles.scrollContent}>

                {/* Progress Bar (Secuencia de Carga) */}
                <div style={styles.progressSection}>
                    <div style={styles.progressLabel}>SECUENCIA DE INICIO: PASO 5/9</div>
                    <div style={styles.progressContainer}>
                        {[1, 2, 3, 4, 5, 6, 7].map((step, index) => (
                            <div
                                key={index}
                                style={{
                                    ...styles.progressStep,
                                    backgroundColor: index === 4 ? '#34D399' : 'rgba(255,255,255,0.1)',
                                    boxShadow: index === 4 ? '0 0 8px #34D399' : 'none',
                                    border: index === 4 ? '1px solid #34D399' : 'none',
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Main Text */}
                <div style={styles.instructionBlock}>
                    <h2 style={styles.mainTitle}>TRANSMITIR MATERIAL</h2>
                    <p style={styles.subTitle}>
                        Escanea o sube la información del objetivo para análisis táctico de la IA.
                    </p>
                </div>

                {/* Consejos (Intel Card) */}
                <div style={styles.tipsCard}>
                    <div style={styles.cardHeaderStrip} />
                    <h3 style={styles.tipsTitle}>
                        <span style={{ marginRight: 6 }}>ℹ️</span> PROTOCOLOS DE ESCANEO
                    </h3>
                    <div style={styles.tipsGrid}>
                        <div style={styles.tipItem}>
                            <div style={styles.tipIconBox}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="5" />
                                    <line x1="12" y1="1" x2="12" y2="3" />
                                    <line x1="12" y1="21" x2="12" y2="23" />
                                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                </svg>
                            </div>
                            <span style={styles.tipText}>ILUMINACIÓN</span>
                        </div>
                        <div style={styles.tipItem}>
                            <div style={styles.tipIconBox}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 5h5v5H5z" />
                                    <path d="M14 5h5v5h-5z" />
                                    <path d="M5 14h5v5H5z" />
                                    <path d="M14 14h5v5h-5z" />
                                </svg>
                            </div>
                            <span style={styles.tipText}>ENFOQUE</span>
                        </div>
                        <div style={styles.tipItem}>
                            <div style={styles.tipIconBox}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                    <path d="M8 21h8" />
                                    <path d="M12 17v4" />
                                </svg>
                            </div>
                            <span style={styles.tipText}>ÁNGULO</span>
                        </div>
                    </div>
                </div>

                {/* Botones de Acción */}
                <div style={styles.actionCardsContainer}>
                    {/* Camera Button */}
                    <button style={styles.actionCard} onClick={() => alert('Abrir Cámara')}>
                        <div style={styles.scanLine} />
                        <div style={{ ...styles.actionIconBox, color: '#34D399', borderColor: '#059669' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                <circle cx="12" cy="13" r="4" />
                            </svg>
                        </div>
                        <span style={styles.actionCardTitle}>ACTIVAR CÁMARA</span>
                        <span style={styles.actionCardSubtitle}>Captura directa</span>
                    </button>

                    {/* PDF Button */}
                    <button style={styles.actionCard} onClick={() => alert('Seleccionar PDF')}>
                        <div style={{ ...styles.actionIconBox, color: '#60A5FA', borderColor: '#2563EB' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <polyline points="10 9 9 9 8 9" />
                            </svg>
                        </div>
                        <span style={styles.actionCardTitle}>SUBIR ARCHIVO</span>
                        <span style={styles.actionCardSubtitle}>PDF / Imagen</span>
                    </button>
                </div>

                {/* Galería Link */}
                <button style={styles.galleryLink} onClick={() => alert('Abrir Galería')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                    </svg>
                    ACCEDER A LA GALERÍA
                </button>

                <div style={{ flex: 1 }} />

                {/* Continue Button */}
                <button style={styles.continueButton} onClick={handleContinue}>
                    <span>PROCESAR DATOS</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 8 }}>
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>

            </div>
        </div>
    );
};

// --- ESTILOS NEON / SQUAD ---
const styles = {
    pageContainer: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column' as const,
        backgroundColor: '#0F231B', // Dark Jungle Green
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
        backgroundImage: 'radial-gradient(circle at 50% 10%, rgba(52, 211, 153, 0.05) 0%, transparent 60%)',
    },
    gridPattern: {
        position: 'absolute' as const,
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(0,255,157,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,157,0.03) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
    },
    glowTopRight: {
        position: 'absolute' as const,
        top: '20%', right: '-30%',
        width: '400px', height: '400px',
        backgroundColor: 'rgba(52, 211, 153, 0.05)',
        filter: 'blur(80px)',
        borderRadius: '50%',
        pointerEvents: 'none' as const,
    },
    header: {
        position: 'relative' as const,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        backgroundColor: 'rgba(22, 46, 37, 0.9)',
        borderBottom: '1px solid rgba(0, 255, 157, 0.1)',
        backdropFilter: 'blur(10px)',
    },
    backButton: {
        border: 'none',
        background: 'none',
        color: '#34D399',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        cursor: 'pointer',
        padding: '4px',
    },
    backText: {
        fontSize: '12px',
        fontWeight: '700',
        letterSpacing: '1px',
    },
    headerTitle: {
        fontSize: '16px',
        fontWeight: '800',
        color: '#fff',
        margin: 0,
        letterSpacing: '1px',
    },
    helpButton: {
        width: '32px', height: '32px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
    },
    helpIcon: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '14px',
    },
    scrollContent: {
        position: 'relative' as const,
        zIndex: 10,
        flex: 1,
        overflowY: 'auto' as const,
        padding: '20px',
        paddingBottom: '120px', // Extra bottom padding for nav bar visibility
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        maxWidth: '480px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box' as const,
    },
    progressSection: {
        width: '100%',
        marginBottom: '32px',
    },
    progressLabel: {
        fontSize: '10px',
        fontFamily: 'monospace',
        color: '#34D399',
        marginBottom: '6px',
        textAlign: 'center' as const,
        opacity: 0.8,
    },
    progressContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    progressStep: {
        height: '4px',
        width: '24px',
        borderRadius: '2px',
        transition: 'all 0.3s ease',
    },
    instructionBlock: {
        textAlign: 'center' as const,
        marginBottom: '24px',
    },
    mainTitle: {
        fontSize: '22px',
        fontWeight: '800',
        color: '#fff',
        marginBottom: '8px',
        marginTop: 0,
        letterSpacing: '0.5px',
    },
    subTitle: {
        fontSize: '13px',
        color: 'rgba(255,255,255,0.6)',
        lineHeight: 1.5,
        maxWidth: '300px',
        margin: '0 auto',
    },
    tipsCard: {
        width: '100%',
        backgroundColor: 'rgba(22, 46, 37, 0.6)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        position: 'relative' as const,
        overflow: 'hidden',
    },
    cardHeaderStrip: {
        position: 'absolute' as const,
        top: 0, left: 0, right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #34D399 0%, transparent 100%)',
    },
    tipsTitle: {
        fontSize: '11px',
        fontWeight: '800',
        color: '#34D399',
        textTransform: 'uppercase' as const,
        letterSpacing: '1px',
        marginBottom: '20px',
        marginTop: 0,
        display: 'flex',
        alignItems: 'center',
    },
    tipsGrid: {
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
    },
    tipItem: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '8px',
    },
    tipIconBox: {
        width: '40px', height: '40px',
        borderRadius: '10px',
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        color: '#34D399',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(52, 211, 153, 0.2)',
    },
    tipText: {
        fontSize: '10px',
        fontWeight: '700',
        color: 'rgba(255,255,255,0.8)',
        letterSpacing: '0.5px',
    },
    actionCardsContainer: {
        display: 'flex',
        gap: '16px',
        width: '100%',
        marginBottom: '24px',
    },
    actionCard: {
        flex: 1,
        backgroundColor: '#162E25',
        borderRadius: '16px',
        padding: '24px 16px',
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'transform 0.1s, border-color 0.2s',
        position: 'relative' as const,
        overflow: 'hidden',
    },
    scanLine: {
        position: 'absolute' as const,
        top: 0, left: 0, right: 0, height: '100%',
        background: 'linear-gradient(to bottom, transparent, rgba(52, 211, 153, 0.05), transparent)',
        transform: 'translateY(-100%)',
        animation: 'ignore', // Would need keyframes, simplified here
        pointerEvents: 'none' as const,
    },
    actionIconBox: {
        width: '56px', height: '56px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
        border: '1px solid',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    actionCardTitle: {
        fontSize: '13px',
        fontWeight: '800',
        color: '#fff',
        marginBottom: '4px',
        letterSpacing: '0.5px',
    },
    actionCardSubtitle: {
        fontSize: '11px',
        color: 'rgba(255,255,255,0.5)',
    },
    galleryLink: {
        background: 'none',
        border: 'none',
        color: '#34D399',
        fontSize: '12px',
        fontWeight: '700',
        letterSpacing: '1px',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        marginBottom: '32px',
        padding: '8px',
        opacity: 0.8,
        transition: 'opacity 0.2s',
    },
    continueButton: {
        width: '100%',
        backgroundColor: '#34D399', // Enabled style
        color: '#064E3B',
        border: 'none',
        borderRadius: '12px',
        padding: '18px',
        fontSize: '15px',
        fontWeight: '800',
        textTransform: 'uppercase' as const,
        letterSpacing: '1px',
        cursor: 'pointer',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 20px rgba(52, 211, 153, 0.3)',
    },
};

export default SubirTareaScreen;
