import React, { useState, useEffect } from 'react';
import { MissionPlan } from '../types/missionTypes';

interface MisionScreenProps {
    alIrASubirTarea: () => void;
    alIrASesion: (plan: MissionPlan) => void;
    alIniciarCreacion: (missionId: string) => void;
}

/**
 * Tablero de Misión Rediseñado (Pedagógico / Funcional).
 * Comportamiento:
 * - Cards: Actúan como gatilladores de navegación directa (Upload vs IA Session).
 * - Sincronizar: Consulta estado y actualiza la misión principal mostrada.
 * - Racha: Persistente basada en constancia diaria.
 */
const MisionScreen: React.FC<MisionScreenProps & { userId?: string }> = ({ alIrASubirTarea, alIrASesion, alIniciarCreacion, userId = 'student-123' }) => {
    // --- ESTADO Y LÓGICA ---
    const [missionOrigin, setMissionOrigin] = useState<'upload' | 'ai'>('ai');
    const [streak, setStreak] = useState<number>(0);
    const [isSyncing, setIsSyncing] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // 1. Cargar estado inicial y Racha
    useEffect(() => {
        // Cargar Origen de Misión pendiente
        const pendingUpload = localStorage.getItem('tpdm_mission_pending_upload');
        if (pendingUpload === 'true') {
            setMissionOrigin('upload');
        }

        // Cargar y Calcular Racha
        const storedStreak = parseInt(localStorage.getItem('tpdm_streak') || '0', 10);
        const lastActive = localStorage.getItem('tpdm_last_active');
        const today = new Date().toISOString().split('T')[0];

        if (lastActive) {
            const lastDate = new Date(lastActive);
            const todayDate = new Date(today);
            const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 1) {
                // Perdió la racha (más de 1 día sin actividad)
                setStreak(0);
                localStorage.setItem('tpdm_streak', '0');
            } else {
                setStreak(storedStreak);
            }
        } else {
            setStreak(storedStreak);
        }

        // Fix overflow issues global
        document.documentElement.style.overflowX = 'hidden';
        document.body.style.overflowX = 'hidden';
        document.body.style.width = '100%';
        return () => {
            document.documentElement.style.overflowX = '';
            document.body.style.overflowX = '';
            document.body.style.width = '';
        };
    }, []);

    // 2. Manejar Sincronización
    const handleSync = async () => {
        setIsSyncing(true);
        setErrorMsg(null);
        try {
            // Use edgeApi to sync
            const dateKey = new Date().toISOString().split('T')[0];
            const { edgeApi } = await import('../servicios/edgeApi');
            const plan = await edgeApi.missionSync(userId, dateKey, 'practica');

            // If mission found/created, update UI
            setMissionOrigin('ai');
            // Optional: Auto-navigate or just show "Ready"
            // For MVP: feedback
            console.log('Mission Synced:', plan);
        } catch (err: any) {
            console.error('Sync Error:', err);
            setErrorMsg('Error al sincronizar. Intenta de nuevo.');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleStartAI = async () => {
        setIsSyncing(true);
        setErrorMsg(null);
        try {
            // 1. Sync Mission
            const dateKey = new Date().toISOString().split('T')[0];
            const { edgeApi } = await import('../servicios/edgeApi');
            const plan = await edgeApi.missionSync(userId, dateKey, 'practica');

            // 2. Direct Navigation with Unified Plan
            // Plan is already in the correct structure
            alIrASesion(plan);
        } catch (err: any) {
            console.error('AI Start Error:', err);
            setErrorMsg('No se pudo iniciar la misión IA.');
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div style={styles.pageContainer}>
            {/* Mobile Frame Constraint */}
            <div style={styles.mobileFrame}>

                {/* Header: Perfil Alumno */}
                <header style={styles.header}>
                    <div style={styles.headerLeft}>
                        <div style={styles.avatarWrapper}>
                            <div style={styles.avatarGlow} />
                            <div style={styles.avatarCircle}>
                                {/* Avatar placeholder - Foundation for future feature */}
                                <div style={{ width: '100%', height: '100%', background: '#1F2937' }} />
                            </div>
                            <div style={styles.lvlBadge}>NIVEL 24</div>
                        </div>
                        <div style={styles.headerText}>
                            <h2 style={styles.studentName}>Alex</h2>
                            <div style={styles.statusBadge}>
                                <div style={styles.statusDot} />
                                <span style={styles.statusText}>CONEXIÓN ESTABLE</span>
                            </div>
                        </div>
                    </div>
                    <button style={styles.notifBtn}>
                        <span style={{ fontSize: '20px' }}>🔔</span>
                        <div style={styles.notifDot} />
                    </button>
                </header>

                <div style={styles.scrollContent}>

                    {/* Sección: Misión Principal (Hero Card) */}
                    <div style={styles.heroCard}>
                        <div style={styles.heroGradientBg} />
                        <div style={styles.heroContent}>

                            {/* Titulo Dinámico según origen */}
                            <h1 style={styles.mainTitle}>
                                {missionOrigin === 'upload' ? 'Tarea del Profe' : 'Entrenamiento IA'}
                            </h1>

                            <p style={styles.mainDesc}>
                                {missionOrigin === 'upload'
                                    ? 'Resolver la tarea subida por tu profe.'
                                    : 'Entrenamiento inteligente creado para ayudarte a mejorar.'}
                            </p>

                            <div style={styles.metricsGrid}>
                                <div style={styles.metricBox}>
                                    <span style={styles.metricLabel}>RECOMPENSA</span>
                                    <span style={styles.metricValue}>+500 XP</span>
                                </div>
                                <div style={styles.metricBox}>
                                    <span style={styles.metricLabel}>DIFICULTAD</span>
                                    <div style={styles.difficultyRow}>
                                        <div style={styles.diffDotActive} />
                                        <div style={styles.diffDotActive} />
                                        <div style={styles.diffDotInactive} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grid de Estrategia (Gatilladores de Acción) */}
                    <div style={styles.strategyGrid}>
                        {/* Opción 1: Encargada por mi profe -> Navega a Subir Tarea */}
                        <div
                            style={styles.strategyCardInteractive}
                            onClick={alIrASubirTarea}
                        >
                            <div style={styles.iconBoxNeonViolet}>
                                <span style={{ fontSize: 24 }}>📖</span>
                            </div>
                            <h3 style={styles.cardTitle}>Encargada por mi profe</h3>
                            <p style={styles.cardDesc}>Sube una foto o documento de tu tarea para convertirla en la misión.</p>
                        </div>

                        {/* Opción 2: Desafío de mi entrenador IA -> Inicia Sesión IA */}
                        <div
                            style={styles.strategyCardInteractiveBlue}
                            onClick={handleStartAI}
                        >
                            <div style={styles.iconBoxElectricBlue}>
                                <span style={{ fontSize: 24 }}>🧠</span>
                            </div>
                            <h3 style={styles.cardTitle}>Desafío de mi entrenador IA</h3>
                            <p style={{ ...styles.cardDesc, color: isSyncing ? '#00d4ff' : 'rgba(255,255,255,0.6)' }}>
                                {isSyncing ? 'Iniciando sesión...' : 'La IA crea un desafio según tus debilidades y progreso.'}
                            </p>
                        </div>
                    </div>

                    {errorMsg && (
                        <div style={{ color: '#ff6b6b', fontSize: '12px', textAlign: 'center', marginTop: '10px' }}>
                            {errorMsg}
                        </div>
                    )}

                    {/* Racha Footer */}
                    <div style={styles.streakRow}>
                        <div style={styles.streakLeft}>
                            <div style={styles.fireIconBox}>
                                <span style={{ fontSize: 20 }}>🔥</span>
                            </div>
                            <div>
                                <div style={styles.streakLabel}>Racha de Entrenamiento</div>
                                <div style={styles.streakDots}>
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} style={i < streak % 6 ? styles.cDotActive : styles.cDotInactive} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div style={styles.streakRight}>
                            <span style={styles.streakValue}>{streak.toString().padStart(2, '0')}</span>
                            <span style={styles.streakUnit}>DÍAS</span>
                        </div>
                    </div>

                    <button
                        style={{ ...styles.syncButton, opacity: isSyncing ? 0.7 : 1 }}
                        onClick={handleSync}
                        disabled={isSyncing}
                    >
                        {isSyncing ? (
                            <>
                                <span style={styles.spinner} />
                                SINCRONIZANDO...
                            </>
                        ) : (
                            <>
                                <span style={{ marginRight: 8, fontSize: 18 }}>↻</span>
                                SINCRONIZAR MISIÓN
                            </>
                        )}
                    </button>

                </div>
            </div>
        </div>
    );
};

// --- ESTILOS ---
const styles = {
    pageContainer: {
        height: '100%',
        width: '100%',
        backgroundColor: '#050a14',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        fontFamily: '"Inter", sans-serif',
        color: '#FFFFFF',
        overflow: 'hidden' as const,
    },
    mobileFrame: {
        width: '100%',
        maxWidth: '390px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
        position: 'relative' as const,
        backgroundImage: 'linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
    },
    header: {
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 20px',
        backgroundColor: 'rgba(5, 10, 20, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        position: 'sticky' as const,
        top: 0,
        zIndex: 20,
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    avatarWrapper: {
        position: 'relative' as const,
        width: '56px', height: '56px',
    },
    avatarGlow: {
        position: 'absolute' as const,
        inset: -4,
        backgroundColor: 'rgba(188, 19, 254, 0.4)',
        borderRadius: '50%',
        filter: 'blur(8px)',
    },
    avatarCircle: {
        position: 'relative' as const,
        width: '100%', height: '100%',
        borderRadius: '50%',
        border: '2px solid rgba(0, 212, 255, 0.5)',
        overflow: 'hidden',
        backgroundColor: '#0a1120',
    },
    lvlBadge: {
        position: 'absolute' as const,
        bottom: -4, right: -4,
        backgroundColor: '#0a1120',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '6px',
        padding: '2px 4px',
        fontSize: '8px',
        fontWeight: '900',
        color: '#bc13fe',
        zIndex: 2,
    },
    headerText: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '4px',
    },
    studentName: {
        fontSize: '18px',
        fontWeight: 'bold',
        margin: 0,
        lineHeight: 1.2,
    },
    statusBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: 'rgba(0, 212, 255, 0.05)',
        border: '1px solid rgba(0, 212, 255, 0.2)',
        borderRadius: '99px',
        padding: '2px 8px',
        width: 'fit-content',
    },
    statusDot: {
        width: '6px', height: '6px',
        backgroundColor: '#00d4ff',
        borderRadius: '50%',
        boxShadow: '0 0 6px #00d4ff',
    },
    statusText: {
        fontSize: '9px',
        fontWeight: '700',
        color: '#00d4ff',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
    },
    notifBtn: {
        width: '44px', height: '44px',
        borderRadius: '12px',
        backgroundColor: '#0a1120',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative' as const,
        cursor: 'pointer',
    },
    notifDot: {
        position: 'absolute' as const,
        top: 10, right: 10,
        width: '8px', height: '8px',
        backgroundColor: '#bc13fe',
        borderRadius: '50%',
        border: '2px solid #050a14',
    },
    // Contenido Scroll
    scrollContent: {
        flex: 1,
        overflowY: 'auto' as const,
        padding: '20px',
        paddingBottom: '130px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '24px',
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        boxSizing: 'border-box' as const,
    },
    // Hero Card
    heroCard: {
        position: 'relative' as const,
        backgroundColor: '#0a1120',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '24px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '16px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        transition: 'all 0.3s ease',
    },
    heroGradientBg: {
        position: 'absolute' as const,
        inset: 0,
        background: 'linear-gradient(135deg, rgba(188, 19, 254, 0.15) 0%, rgba(0, 212, 255, 0.1) 100%)',
        opacity: 0.5,
        zIndex: 0,
        pointerEvents: 'none' as const,
    },
    heroContent: {
        position: 'relative' as const,
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column' as const,
    },
    mainTitle: {
        fontSize: '22px',
        fontWeight: '700',
        color: 'white',
        margin: '0 0 8px 0',
        lineHeight: 1.2,
    },
    mainDesc: {
        fontSize: '14px',
        color: 'rgba(255,255,255,0.7)',
        margin: '0 0 20px 0',
        lineHeight: 1.5,
    },
    metricsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '4px',
    },
    metricBox: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '4px',
    },
    metricLabel: {
        fontSize: '9px',
        fontWeight: '700',
        textTransform: 'uppercase' as const,
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: '1px',
    },
    metricValue: {
        fontSize: '16px',
        fontWeight: '900',
        color: '#bc13fe',
        fontFamily: 'monospace',
    },
    difficultyRow: {
        display: 'flex',
        gap: '4px',
        marginTop: '2px',
    },
    diffDotActive: {
        width: '10px', height: '6px',
        backgroundColor: '#bc13fe',
        borderRadius: '4px',
        boxShadow: '0 0 5px #bc13fe',
    },
    diffDotInactive: {
        width: '10px', height: '6px',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: '4px',
    },
    syncButton: {
        position: 'relative' as const,
        zIndex: 1,
        width: '100%',
        padding: '16px',
        backgroundColor: '#00ff9d',
        color: '#050a14',
        border: 'none',
        borderRadius: '12px',
        fontSize: '13px',
        fontWeight: '900',
        letterSpacing: '1px',
        textTransform: 'uppercase' as const,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 25px rgba(0, 255, 157, 0.4)',
        gap: '8px',
    },
    spinner: {
        width: '16px',
        height: '16px',
        border: '2px solid #050a14',
        borderTop: '2px solid transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        display: 'inline-block',
    },
    // Strategy Grid
    strategyGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
    },
    strategyCardInteractive: { // Interactive generic style
        backgroundColor: 'rgba(188, 19, 254, 0.05)',
        border: '1px solid rgba(188, 19, 254, 0.3)',
        borderRadius: '16px',
        padding: '16px',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column' as const,
        transition: 'transform 0.1s, box-shadow 0.2s',
    },
    strategyCardInteractiveBlue: {
        backgroundColor: 'rgba(0, 212, 255, 0.05)',
        border: '1px solid rgba(0, 212, 255, 0.3)',
        borderRadius: '16px',
        padding: '16px',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column' as const,
        transition: 'transform 0.1s, box-shadow 0.2s',
    },
    iconBoxNeonViolet: {
        width: '40px', height: '40px',
        backgroundColor: 'rgba(188, 19, 254, 0.1)',
        border: '1px solid rgba(188, 19, 254, 0.3)',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#bc13fe',
        marginBottom: '12px',
    },
    iconBoxElectricBlue: {
        width: '40px', height: '40px',
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
        border: '1px solid rgba(0, 212, 255, 0.3)',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#00d4ff',
        marginBottom: '12px',
    },
    cardTitle: {
        fontSize: '13px',
        fontWeight: '700',
        color: 'white',
        margin: '0 0 6px 0',
        lineHeight: 1.2,
    },
    cardDesc: {
        fontSize: '11px',
        color: 'rgba(255,255,255,0.6)',
        margin: 0,
        fontWeight: '400',
        lineHeight: 1.3,
    },
    // Streak
    streakRow: {
        backgroundColor: 'rgba(10, 17, 32, 0.8)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    streakLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    fireIconBox: {
        width: '40px', height: '40px',
        backgroundColor: 'rgba(188, 19, 254, 0.1)',
        border: '1px solid rgba(188, 19, 254, 0.2)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#bc13fe',
    },
    streakLabel: {
        fontSize: '13px',
        fontWeight: '700',
        color: 'white',
        marginBottom: '4px',
    },
    streakDots: {
        display: 'flex',
        gap: '4px',
    },
    cDotActive: {
        width: '14px', height: '5px',
        backgroundColor: '#00d4ff',
        borderRadius: '4px',
        boxShadow: '0 0 5px #00d4ff',
    },
    cDotInactive: {
        width: '14px', height: '5px',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: '4px',
    },
    streakRight: {
        textAlign: 'right' as const,
    },
    streakValue: {
        display: 'block',
        fontSize: '18px',
        fontWeight: '900',
        color: 'rgba(255,255,255,0.9)',
        fontFamily: 'monospace',
    },
    streakUnit: {
        fontSize: '8px',
        fontWeight: '900',
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase' as const,
        letterSpacing: '1px',
    },
};

export default MisionScreen;
