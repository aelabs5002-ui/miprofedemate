import React, { useState, useEffect } from 'react';
import { memoriaAlumno } from '../servicios/RepositorioMemoriaAlumno';
import { useApp } from '../context/AppContext';

interface Props {
    alVolver: () => void;
}

const PanelAlumnoScreen: React.FC<Props> = ({ alVolver }) => {
    const { sesion } = useApp();
    const userId = sesion.usuario?.id || 'demo-user';

    // --- LÓGICA EXISTENTE INTACTA (State) ---
    const [nombre, setNombre] = useState('Juan Pérez');
    const [grado, setGrado] = useState('9° Grado');
    const [email, setEmail] = useState('juan.perez@escuela.com');
    const [institucion, setInstitucion] = useState('Instituto Tecnológico del Norte');

    const [notifEstudio, setNotifEstudio] = useState(true); // Alertas de Tutoría IA
    const [notifRetos, setNotifRetos] = useState(false); // Nuevos Retos

    // --- LÓGICA EXISTENTE INTACTA (Effects) ---
    useEffect(() => {
        const perfil = memoriaAlumno.obtenerPerfil();
        if (perfil) {
            setNombre(perfil.nombre || 'Juan Pérez');
            if (perfil.grado) setGrado(String(perfil.grado) + '° Grado');
            if ((perfil as any).email) setEmail((perfil as any).email);
        }

        const savedNotifs = localStorage.getItem(`alumno_notif_${userId}`);
        if (savedNotifs) {
            const p = JSON.parse(savedNotifs);
            setNotifEstudio(p.alertas_tutoria ?? true);
            setNotifRetos(p.nuevos_retos ?? false);
        }
    }, [userId]);

    // --- LÓGICA EXISTENTE INTACTA (Handlers) ---
    const handleSaveToggle = (key: string, val: boolean) => {
        const current = { alertas_tutoria: notifEstudio, nuevos_retos: notifRetos };
        const updated = { ...current, [key]: val };
        localStorage.setItem(`alumno_notif_${userId}`, JSON.stringify(updated));
    }

    // --- NUEVO REDISEÑO VISUAL (Agente Zero Skin) ---
    return (
        <div style={styles.darkPageContainer}>
            {/* Mobile Frame Centered */}
            <div style={styles.mobileFrame}>

                {/* Header Agente Zero */}
                <div style={styles.header}>
                    <button style={styles.iconButton} onClick={alVolver}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h1 style={styles.headerTitle}>AGENTE ZERO</h1>
                        <span style={styles.headerSubtitle}>ONLINE</span>
                    </div>
                    <button style={styles.iconButton} onClick={() => alert('Configuración global')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.72l-.15.1a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.72l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                    </button>
                </div>

                <div style={styles.scrollContent}>

                    {/* Hero: Avatar Level (Visual Placeholder) */}
                    <div style={styles.heroSection}>
                        <div style={styles.avatarWrapper}>
                            {/* SVG Ring */}
                            <svg width="180" height="180" viewBox="0 0 100 100" style={styles.progressRing}>
                                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(0,255,157,0.1)" strokeWidth="6" />
                                <circle cx="50" cy="50" r="46" fill="none" stroke="#00ff9d" strokeWidth="6" strokeDasharray="289" strokeDashoffset="100" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 4px #00ff9d)' }} />
                            </svg>
                            {/* Avatar Image Placeholder */}
                            <div style={styles.avatarInner}>
                                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#00ff9d" strokeWidth="1">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            {/* Level Badge */}
                            <div style={styles.levelBadge}>
                                <span style={styles.levelText}>NIVEL<br /><span style={{ fontSize: 18 }}>42</span></span>
                            </div>
                        </div>

                        {/* XP Stats */}
                        <div style={styles.xpContainer}>
                            <span style={styles.xpText}>XP: <span style={{ color: 'white' }}>3400</span> / 5000</span>
                            <div style={styles.xpBarBg}>
                                <div style={styles.xpBarFill}></div>
                            </div>
                        </div>
                    </div>

                    {/* Stats HUD (Placeholders) */}
                    <div style={styles.statsGrid}>
                        <div style={styles.statCard}>
                            <div style={styles.iconGlow}>
                                <span style={{ fontSize: 24 }}>🔥</span>
                            </div>
                            <span style={styles.statValue}>15 Días</span>
                            <span style={styles.statLabel}>RACHA</span>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.iconGlow}>
                                <span style={{ fontSize: 24 }}>⚡</span>
                            </div>
                            <span style={styles.statValue}>8.4k</span>
                            <span style={styles.statLabel}>ENERGÍA</span>
                        </div>
                    </div>

                    {/* Trophies (Placeholders) */}
                    <div style={styles.trophySection}>
                        <div style={styles.sectionHeader}>
                            <div style={styles.greenBar}></div>
                            <h3 style={styles.sectionTitle}>TROFEOS RECIENTES</h3>
                            <button style={styles.verTodoBtn}>VER TODO</button>
                        </div>
                        <div style={styles.trophyRow}>
                            <div style={styles.trophyItem}>
                                <div style={styles.trophyBox}>🏆</div>
                                <span style={styles.trophyName}>Maestro de<br />Álgebra</span>
                            </div>
                            <div style={styles.trophyItem}>
                                <div style={styles.trophyBox}>🧮</div>
                                <span style={styles.trophyName}>Calculadora<br />Humana</span>
                            </div>
                            <div style={{ ...styles.trophyItem, opacity: 0.5 }}>
                                <div style={styles.trophyBox}>🔒</div>
                                <span style={styles.trophyName}>Rey de<br />Funciones</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Actions (Placeholders) */}
                    <div style={styles.bottomActions}>
                        <div style={styles.actionCard}>
                            <span style={{ fontSize: 24, marginBottom: 4 }}>🛍️</span>
                            <span style={styles.actionLabel}>TIENDA</span>
                        </div>
                        <div style={styles.actionCard}>
                            <span style={{ fontSize: 24, marginBottom: 4 }}>🎖️</span>
                            <span style={styles.actionLabel}>LOGROS</span>
                        </div>
                    </div>

                    {/* --- DATOS REALES FUNCIONALES (PRESERVADOS PERO REESTILIZADOS) --- */}
                    <div style={styles.legacySection}>
                        <h3 style={styles.legacyTitle}>CONFIGURACIÓN DEL SISTEMA</h3>

                        <div style={styles.infoBlock}>
                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>AGENTE:</span>
                                <span style={styles.infoValue}>{nombre}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>RANGO:</span>
                                <span style={styles.infoValue}>{grado}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>ENLACE:</span>
                                <span style={styles.infoValue}>{email}</span>
                            </div>
                            <div style={styles.infoRow}>
                                <span style={styles.infoLabel}>BASE:</span>
                                <span style={styles.infoValue}>{institucion}</span>
                            </div>
                        </div>

                        <div style={styles.togglesBlock}>
                            {/* Switch: Alertas */}
                            <div style={styles.switchRow}>
                                <span style={styles.switchLabel}>Alertas de Tutoría</span>
                                <div
                                    onClick={() => {
                                        const newVal = !notifEstudio;
                                        setNotifEstudio(newVal);
                                        handleSaveToggle('alertas_tutoria', newVal);
                                    }}
                                    style={{
                                        ...styles.switchTrack,
                                        backgroundColor: notifEstudio ? '#00ff9d' : '#1F2937',
                                        justifyContent: notifEstudio ? 'flex-end' : 'flex-start'
                                    }}
                                >
                                    <div style={styles.switchThumb} />
                                </div>
                            </div>
                            {/* Switch: Retos */}
                            <div style={styles.switchRow}>
                                <span style={styles.switchLabel}>Nuevos Retos</span>
                                <div
                                    onClick={() => {
                                        const newVal = !notifRetos;
                                        setNotifRetos(newVal);
                                        handleSaveToggle('nuevos_retos', newVal);
                                    }}
                                    style={{
                                        ...styles.switchTrack,
                                        backgroundColor: notifRetos ? '#00ff9d' : '#1F2937',
                                        justifyContent: notifRetos ? 'flex-end' : 'flex-start'
                                    }}
                                >
                                    <div style={styles.switchThumb} />
                                </div>
                            </div>
                        </div>

                        <button onClick={alVolver} style={styles.logoutButton}>
                            CERRAR SESIÓN
                        </button>
                    </div>

                    <div style={{ height: 40 }}></div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    darkPageContainer: {
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#000000', // Gutter
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        overflowX: 'hidden' as const,
        fontFamily: '"Space Grotesk", "Inter", sans-serif',
    },
    mobileFrame: {
        width: '100%',
        maxWidth: '390px',
        minHeight: '100vh',
        backgroundColor: '#0f231b', // Background Dark Green
        display: 'flex',
        flexDirection: 'column' as const,
        position: 'relative' as const,
        boxShadow: '0 0 50px rgba(0, 255, 157, 0.05)',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        backgroundColor: 'rgba(15, 35, 27, 0.9)',
        position: 'sticky' as const,
        top: 0,
        zIndex: 10,
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
    },
    iconButton: {
        background: 'none',
        border: 'none',
        padding: 8,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: 'white',
        letterSpacing: '1px',
        margin: 0,
        textTransform: 'uppercase' as const,
        textShadow: '0 0 8px rgba(0,255,157,0.4)',
    },
    headerSubtitle: {
        fontSize: '10px',
        color: '#00ff9d',
        letterSpacing: '2px',
        fontWeight: '600',
    },
    scrollContent: {
        flex: 1,
        overflowY: 'auto' as const,
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '24px',
    },

    // Hero
    heroSection: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        marginTop: 10,
    },
    avatarWrapper: {
        width: 180,
        height: 180,
        position: 'relative' as const,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressRing: {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        transform: 'rotate(-90deg)',
    },
    avatarInner: {
        width: 140,
        height: 140,
        borderRadius: '50%',
        backgroundColor: '#162e25',
        border: '4px solid #0f231b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    levelBadge: {
        position: 'absolute' as const,
        bottom: 20,
        backgroundColor: '#0f231b',
        border: '1px solid #00ff9d',
        borderRadius: '8px',
        padding: '4px 12px',
        textAlign: 'center' as const,
        boxShadow: '0 0 10px rgba(0,255,157,0.3)',
    },
    levelText: {
        fontSize: '10px',
        color: '#00ff9d',
        fontWeight: 'bold',
        lineHeight: '1',
    },
    xpContainer: {
        width: '100%',
        maxWidth: '200px',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
    },
    xpText: {
        fontSize: '12px',
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '500',
    },
    xpBarBg: {
        width: '100%',
        height: 4,
        backgroundColor: '#162e25',
        borderRadius: 2,
    },
    xpBarFill: {
        width: '68%',
        height: '100%',
        backgroundColor: '#00ff9d',
        borderRadius: 2,
        boxShadow: '0 0 8px #00ff9d',
    },

    // Stats Grid
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
    },
    statCard: {
        backgroundColor: 'rgba(22, 46, 37, 0.5)',
        border: '1px solid rgba(0,255,157,0.2)',
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: 4,
    },
    iconGlow: {
        marginBottom: 4,
        filter: 'drop-shadow(0 0 5px rgba(0,255,157,0.5))',
    },
    statValue: {
        fontSize: '20px',
        fontWeight: '700',
        color: 'white',
    },
    statLabel: {
        fontSize: '10px',
        color: 'rgba(0,255,157,0.7)',
        letterSpacing: '1px',
        fontWeight: '600',
    },

    // Trophies
    trophySection: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 12,
    },
    greenBar: {
        width: 4,
        height: 16,
        backgroundColor: '#00ff9d',
        borderRadius: 2,
        boxShadow: '0 0 5px #00ff9d',
    },
    verTodoBtn: {
        background: 'none',
        border: 'none',
        color: '#00ff9d',
        fontSize: '10px',
        fontWeight: '700',
        cursor: 'pointer',
        letterSpacing: '0.5px',
    },
    trophyRow: {
        display: 'flex',
        gap: 12,
        overflowX: 'auto' as const,
        paddingBottom: 8,
    },
    trophyItem: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: 8,
        minWidth: 80,
    },
    trophyBox: {
        width: 60,
        height: 60,
        backgroundColor: 'rgba(22, 46, 37, 0.8)',
        border: '1px solid rgba(0,255,157,0.4)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        boxShadow: '0 0 10px rgba(0,255,157,0.1)',
    },
    trophyName: {
        fontSize: '9px',
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center' as const,
        lineHeight: '1.2',
    },

    // Bottom Actions
    bottomActions: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginTop: 12,
    },
    actionCard: {
        backgroundColor: '#162e25',
        border: '1px solid rgba(0,255,157,0.3)',
        borderRadius: '12px',
        height: 80,
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
    },
    actionLabel: {
        fontSize: '11px',
        fontWeight: '700',
        color: 'white',
        letterSpacing: '1px',
    },

    // Legacy Section (Preserved Functionality)
    legacySection: {
        marginTop: 32,
        borderTop: '1px solid rgba(255,255,255,0.1)',
        paddingTop: 24,
    },
    legacyTitle: {
        fontSize: '12px',
        color: 'rgba(255,255,255,0.4)',
        marginBottom: 16,
        letterSpacing: '1px',
    },
    infoBlock: {
        backgroundColor: '#0a1a14',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid rgba(255,255,255,0.05)',
        marginBottom: 16,
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: '11px',
        color: '#00ff9d',
        fontWeight: '600',
    },
    infoValue: {
        fontSize: '11px',
        color: 'white',
        textAlign: 'right' as const,
    },
    togglesBlock: {
        marginBottom: 24,
    },
    switchRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
    },
    switchLabel: {
        color: 'white',
        fontSize: '13px',
    },
    switchTrack: {
        width: 40,
        height: 22,
        borderRadius: 11,
        display: 'flex',
        alignItems: 'center',
        padding: 2,
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    switchThumb: {
        width: 18,
        height: 18,
        borderRadius: '50%',
        backgroundColor: 'white',
    },
    logoutButton: {
        width: '100%',
        padding: '16px',
        backgroundColor: 'rgba(239, 68, 68, 0.1)', // Red tint
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '12px',
        color: '#EF4444',
        fontSize: '13px',
        fontWeight: '700',
        cursor: 'pointer',
        letterSpacing: '1px',
    }
};

export default PanelAlumnoScreen;
