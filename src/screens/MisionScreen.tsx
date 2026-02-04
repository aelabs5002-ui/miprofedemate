import React, { useState } from 'react';
import { MissionPlan } from '../types/missionPlan';

interface MisionScreenProps {
    alIrASubirTarea: () => void;
    alIrASesion: (plan: MissionPlan) => void;
    alIniciarCreacion: (missionId: string) => void;
}

/**
 * Tablero de Misión Rediseñado (Skin: Centro de Comando).
 * Transforma la pantalla principal en un dashboard táctico Sci-Fi.
 * Mantiene intacta la lógica de selección y navegación.
 */
const MisionScreen: React.FC<MisionScreenProps> = ({ alIrASubirTarea, alIrASesion, alIniciarCreacion }) => {
    // --- LÓGICA ORIGINAL INTACTA ---
    const [selectedOption, setSelectedOption] = useState<'custom' | 'ai'>('ai');

    const handleStart = () => {
        if (selectedOption === 'ai') {
            alIniciarCreacion('new-ai-mission');
        } else {
            alIrASubirTarea();
        }
    };

    // Fix overflow issues globally while on this screen (Original Fix Preserved)
    React.useEffect(() => {
        document.documentElement.style.overflowX = 'hidden';
        document.body.style.overflowX = 'hidden';
        document.body.style.width = '100%';
        return () => {
            document.documentElement.style.overflowX = '';
            document.body.style.overflowX = '';
            document.body.style.width = '';
        };
    }, []);
    // ----------------------------

    return (
        <div style={styles.pageContainer}>
            {/* Mobile Frame Constraint */}
            <div style={styles.mobileFrame}>

                {/* Header: Centro de Comando */}
                <header style={styles.header}>
                    <div style={styles.headerLeft}>
                        <div style={styles.avatarWrapper}>
                            <div style={styles.avatarGlow} />
                            <div style={styles.avatarCircle}>
                                {/* Avatar visual placeholder */}
                                <div style={{ width: '100%', height: '100%', background: '#1F2937' }} />
                            </div>
                            <div style={styles.lvlBadge}>LVL 24</div>
                        </div>
                        <div style={styles.headerText}>
                            <h2 style={styles.cadetName}>Cadete Alex</h2>
                            <div style={styles.statusBadge}>
                                <div style={styles.statusDot} />
                                <span style={styles.statusText}>ENLACE ESTABLE</span>
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
                            <div style={styles.priorityTag}>
                                <span style={{ marginRight: 6 }}>⚡</span> PRIORIDAD OMEGA
                            </div>

                            <h1 style={styles.mainTitle}>Misión Principal</h1>
                            <p style={styles.mainDesc}>
                                Domina las <span style={{ color: '#00d4ff' }}>Ecuaciones Lineales</span> para desbloquear el sector Alpha.
                            </p>

                            <div style={styles.metricsGrid}>
                                <div style={styles.metricBox}>
                                    <span style={styles.metricLabel}>RECOMPENSA</span>
                                    <span style={styles.metricValue}>+500 XP</span>
                                </div>
                                <div style={styles.metricBox}>
                                    <span style={styles.metricLabel}>COMPLEJIDAD</span>
                                    <div style={styles.difficultyRow}>
                                        <div style={styles.diffDotActive} />
                                        <div style={styles.diffDotActive} />
                                        <div style={styles.diffDotInactive} />
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>

                    {/* Grid de Estrategia (Secundarias) */}
                    <div style={styles.strategyGrid}>
                        {/* Opción 1: Encargo del Mentor */}
                        <div
                            style={selectedOption === 'custom' ? styles.strategyCardActive : styles.strategyCard}
                            onClick={() => {
                                setSelectedOption('custom');
                                alIrASubirTarea(); // Logic preserved: clicking selects and/or navigates if that was behavior
                            }}
                        >
                            <div style={styles.iconBoxNeonViolet}>
                                <span style={{ fontSize: 24 }}>📖</span>
                            </div>
                            <h3 style={styles.cardTitle}>Encargo del Mentor</h3>
                            <p style={styles.cardDesc}>Estrategia táctica de aprendizaje.</p>
                        </div>

                        {/* Opción 2: Desafío de la IA */}
                        <div
                            style={selectedOption === 'ai' ? styles.strategyCardActiveBlue : styles.strategyCard}
                            onClick={() => setSelectedOption('ai')}
                        >
                            <div style={styles.iconBoxElectricBlue}>
                                <span style={{ fontSize: 24 }}>🧠</span>
                            </div>
                            <h3 style={styles.cardTitle}>Desafío de la IA</h3>
                            <p style={styles.cardDesc}>Algoritmo de combate neuronal.</p>
                        </div>
                    </div>

                    {/* Racha de Combate Footer */}
                    <div style={styles.combateRow}>
                        <div style={styles.combateLeft}>
                            <div style={styles.fireIconBox}>
                                <span style={{ fontSize: 20 }}>🔥</span>
                            </div>
                            <div>
                                <div style={styles.combateLabel}>Racha de Combate</div>
                                <div style={styles.combateDots}>
                                    <div style={styles.cDotActive} />
                                    <div style={styles.cDotActive} />
                                    <div style={styles.cDotActive} />
                                    <div style={styles.cDotInactive} />
                                    <div style={styles.cDotInactive} />
                                </div>
                            </div>
                        </div>
                        <div style={styles.combateRight}>
                            <span style={styles.combateValue}>03</span>
                            <span style={styles.combateUnit}>DÍAS</span>
                        </div>
                    </div>

                    <button style={styles.syncButton} onClick={handleStart}>
                        <span style={{ marginRight: 8, fontSize: 18 }}>📟</span>
                        SINCRONIZAR MISIÓN
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- ESTILOS "CENTRO DE COMANDO" ---
const styles = {
    pageContainer: {
        height: '100%',
        width: '100%',
        backgroundColor: '#050a14', // Background Dark
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        fontFamily: '"Space Grotesk", "Noto Sans", sans-serif',
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
        color: '#bc13fe', // Neon Violet
        zIndex: 2,
    },
    headerText: {
        display: 'flex',
        flexDirection: 'column' as const,
    },
    cadetName: {
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
        marginTop: '2px',
        width: 'fit-content',
    },
    statusDot: {
        width: '6px', height: '6px',
        backgroundColor: '#00d4ff', // Electric Blue
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
        paddingBottom: '130px', // Increased padding to clear Nav Bar
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '24px',
        width: '100%', // Ensure full width
        maxWidth: '480px', // Match max width
        margin: '0 auto', // Center
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
        gap: '20px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
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
    priorityTag: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        border: '1px solid rgba(0, 212, 255, 0.3)',
        color: '#00d4ff',
        fontSize: '10px',
        fontWeight: '900',
        textTransform: 'uppercase' as const,
        letterSpacing: '1px',
        padding: '4px 10px',
        borderRadius: '99px',
        alignSelf: 'flex-start',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
    },
    mainTitle: {
        fontSize: '24px',
        fontWeight: '700',
        color: 'white',
        margin: '0 0 8px 0',
        lineHeight: 1.1,
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
        color: '#bc13fe', // Neon Violet
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
        backgroundColor: '#00ff9d', // Primary Green
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
    },

    // Strategy Grid
    strategyGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
    },
    strategyCard: {
        backgroundColor: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'transform 0.1s',
        display: 'flex',
        flexDirection: 'column' as const,
    },
    strategyCardActive: { // For Custom/Mentor
        backgroundColor: 'rgba(188, 19, 254, 0.05)',
        border: '1px solid rgba(188, 19, 254, 0.5)',
        borderRadius: '16px',
        padding: '16px',
        cursor: 'pointer',
        boxShadow: '0 0 15px rgba(188, 19, 254, 0.15)',
        display: 'flex',
        flexDirection: 'column' as const,
    },
    strategyCardActiveBlue: { // For AI
        backgroundColor: 'rgba(0, 212, 255, 0.05)',
        border: '1px solid rgba(0, 212, 255, 0.5)',
        borderRadius: '16px',
        padding: '16px',
        cursor: 'pointer',
        boxShadow: '0 0 15px rgba(0, 212, 255, 0.15)',
        display: 'flex',
        flexDirection: 'column' as const,
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
        fontSize: '14px',
        fontWeight: '700',
        color: 'white',
        margin: '0 0 4px 0',
        lineHeight: 1.2,
    },
    cardDesc: {
        fontSize: '10px', // Smaller font for desc
        color: 'rgba(255,255,255,0.5)',
        margin: 0,
        fontWeight: '500',
    },

    // Combat Streak
    combateRow: {
        backgroundColor: 'rgba(10, 17, 32, 0.8)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    combateLeft: {
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
    combateLabel: {
        fontSize: '13px',
        fontWeight: '700',
        color: 'white',
        marginBottom: '4px',
    },
    combateDots: {
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
    combateRight: {
        textAlign: 'right' as const,
    },
    combateValue: {
        display: 'block',
        fontSize: '18px',
        fontWeight: '900',
        color: 'rgba(255,255,255,0.9)',
        fontFamily: 'monospace',
    },
    combateUnit: {
        fontSize: '8px',
        fontWeight: '900',
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase' as const,
        letterSpacing: '1px',
    },
};

export default MisionScreen;
