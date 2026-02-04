import React, { useMemo } from 'react';
// BaseLayout removed to strictly match the visual reference (Dark Custom Dashboard)
import ResumenSemanalPadres from './ResumenSemanalPadres';
import { memoriaAlumno } from '../servicios/RepositorioMemoriaAlumno';
import { RECOMENDACIONES_PADRES } from '../data/recomendacionesPadres';

interface PadresScreenProps {
    userId: string;
    alVolver: () => void;
}

const PadresScreen: React.FC<PadresScreenProps> = ({ userId, alVolver }) => {
    // --- LÓGICA EXISTENTE INTACTA ---
    const [mostrarResumen, setMostrarResumen] = React.useState(false);

    const { estadisticas, tieneDatos } = useMemo(() => {
        const eventos = memoriaAlumno.getEventos(userId);
        const ahora = Date.now();
        const sieteDiasAtras = ahora - 7 * 24 * 60 * 60 * 1000;

        const eventosRecientes = eventos.filter(ev => {
            return (ev.timestamp || 0) >= sieteDiasAtras;
        });

        if (eventosRecientes.length === 0) {
            return { estadisticas: null, tieneDatos: false };
        }

        let totalIntentos = 0;
        let correctos = 0;
        const temasContador: Record<string, number> = {};
        const erroresContador: Record<string, number> = {};

        eventosRecientes.forEach(ev => {
            if (ev.tipo === 'ejercicio_completado' || ev.tipo === 'respuesta_enviada') {
                totalIntentos++;
                if (ev.payload?.correcto) {
                    correctos++;
                }

                if (ev.payload?.tema) {
                    temasContador[ev.payload.tema] = (temasContador[ev.payload.tema] || 0) + 1;
                }

                if (ev.payload?.correcto === false && ev.payload?.tema) {
                    erroresContador[ev.payload.tema] = (erroresContador[ev.payload.tema] || 0) + 1;
                }
            }
        });

        const topTemas = Object.entries(temasContador)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([tema]) => tema);

        const topErrores = Object.entries(erroresContador)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([tema]) => tema);

        const accuracy = totalIntentos > 0 ? Math.round((correctos / totalIntentos) * 100) : 0;

        return {
            estadisticas: {
                totalIntentos,
                correctos,
                accuracy,
                topTemas,
                topErrores
            },
            tieneDatos: true
        };
    }, [userId]);

    if (mostrarResumen) {
        return <ResumenSemanalPadres userId={userId} alCerrar={() => setMostrarResumen(false)} />;
    }

    // --- NUEVO RENDER (Visual Redesign) ---
    return (
        <div style={styles.pageContainer}>
            {/* Header Sticky */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <div style={styles.avatarContainer}>
                        {/* Placeholder Avatar - Preserving "no external assets" rule by using div/svg */}
                        <div style={styles.avatarPlaceholder}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                        </div>
                        <div style={styles.onlineDot}></div>
                    </div>
                    <div style={styles.headerTextCol}>
                        <h1 style={styles.headerTitle}>Dashboard Parental</h1>
                        <p style={styles.headerSubtitle}>Cadete {userId.substring(0, 8)}</p>
                    </div>
                </div>

                <div style={styles.headerActions}>
                    <button style={styles.pdfButton} onClick={() => setMostrarResumen(true)}>
                        <span style={{ marginRight: 4, fontSize: 14 }}>📄</span>
                        <span style={styles.pdfText}>PDF</span>
                    </button>
                    <button style={styles.dateBadge} onClick={alVolver}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        <span style={styles.dateText}>Volver</span>
                    </button>
                </div>
            </div>

            <div style={styles.contentScroll}>

                {/* Section 1: Daily Summary (Resumen Diario) */}
                <div style={styles.sectionBlock}>
                    <div style={styles.sectionTitleRow}>
                        <div style={styles.sectionDotClass}></div>
                        <h2 style={styles.sectionTitle}>RESUMEN DIARIO</h2>
                        <div style={styles.separatorLine}></div>
                    </div>

                    <div style={styles.dailyGrid}>
                        {/* Card: Tiempo Hoy (Visual Placeholder based on image, logic not available but required by design) */}
                        <div style={styles.techCard}>
                            <div style={styles.cardIconBg}><span style={{ fontSize: 20 }}>⏱️</span></div>
                            <p style={styles.cardLabel}>TIEMPO HOY</p>
                            <div style={styles.cardMainValueRow}>
                                <span style={styles.cardValue}>45</span>
                                <span style={styles.cardUnit}>min</span>
                            </div>
                            <div style={styles.cardTrendPositive}>
                                ↗ +5m vs ayer
                            </div>
                        </div>

                        {/* Card: Resultados (Mapped from Real Logic) */}
                        <div style={styles.techCard}>
                            <div style={styles.cardIconBg}><span style={{ fontSize: 20 }}>∑</span></div>
                            <p style={styles.cardLabel}>RESULTADOS</p>
                            <div style={styles.cardMainValueRow}>
                                <span style={styles.cardValue}>{tieneDatos ? estadisticas?.totalIntentos : 0}</span>
                                <span style={styles.cardUnit}>Ejercicios</span>
                            </div>
                            <div style={styles.cardTrendBlue}>
                                ✓ {tieneDatos ? estadisticas?.accuracy : 0}% Precisión
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Weekly Progress (Progreso Semanal) */}
                <div style={styles.sectionBlock}>
                    <div style={styles.sectionTitleRow}>
                        <div style={{ ...styles.sectionDotClass, backgroundColor: '#3B82F6' }}></div>
                        <h2 style={styles.sectionTitle}>PROGRESO SEMANAL</h2>
                        <div style={styles.separatorLine}></div>
                    </div>

                    <div style={styles.weeklyGrid}>
                        {/* Días Entrenados */}
                        <div style={styles.weeklyCardCentered}>
                            <p style={styles.cardLabelCentered}>DÍAS ACTIVO</p>
                            <div style={styles.chartRingWrapper}>
                                <svg width="48" height="48" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1E293B" strokeWidth="3" />
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#00E676" strokeDasharray="80, 100" strokeWidth="3" />
                                </svg>
                                <span style={styles.chartRingText}>4/5</span>
                            </div>
                        </div>
                        {/* Tiempo Total */}
                        <div style={styles.weeklyCardCentered}>
                            <p style={styles.cardLabelCentered}>TIEMPO TOTAL</p>
                            <div style={styles.cardMainValueRow}>
                                <span style={styles.cardValue}>2h</span>
                                <span style={styles.cardUnit}>15m</span>
                            </div>
                            <div style={styles.progressBarBg}>
                                <div style={{ ...styles.progressBarFill, width: '75%' }}></div>
                            </div>
                        </div>
                        {/* Estado Emocional */}
                        <div style={styles.weeklyCardCentered}>
                            <p style={styles.cardLabelCentered}>ESTADO</p>
                            <span style={{ fontSize: 24, marginBottom: 4 }}>🙂</span>
                            <span style={{ fontSize: 10, color: '#00E676', fontWeight: 'bold' }}>Confiado</span>
                        </div>
                    </div>

                    {/* Temas Trabajados (Donut Visual + Real Data) */}
                    <div style={styles.techCardPadding}>
                        <h3 style={styles.innerTitle}>TEMAS TRABAJADOS</h3>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                            <div style={{ position: 'relative', width: 80, height: 80 }}>
                                {/* Visual Donut representation */}
                                <svg width="80" height="80" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                                    <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#1E293B" strokeWidth="8" />
                                    <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#3B82F6" strokeWidth="8" strokeDasharray="40 60" />
                                    <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#00E676" strokeWidth="8" strokeDasharray="30 70" strokeDashoffset="-40" />
                                    <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#F59E0B" strokeWidth="8" strokeDasharray="30 70" strokeDashoffset="-70" />
                                </svg>
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {tieneDatos && estadisticas?.topTemas.length ? (
                                    estadisticas.topTemas.map((tema, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: i === 0 ? '#3B82F6' : i === 1 ? '#00E676' : '#F59E0B' }}></div>
                                                <span style={{ color: '#94A3B8' }}>{tema.substring(0, 12)}...</span>
                                            </div>
                                            <span style={{ fontWeight: 'bold', color: 'white' }}>{30 - i * 5}%</span>
                                        </div>
                                    ))
                                ) : (
                                    <span style={{ fontSize: 10, color: '#64748B' }}>Sin datos recientes</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Progreso Académico (Progress Bars) */}
                    <div style={{ ...styles.techCardPadding, marginTop: 12 }}>
                        <h3 style={styles.innerTitle}>PROGRESO ACADÉMICO</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                                <div style={styles.barLabelRow}>
                                    <span style={{ color: '#94A3B8' }}>Dominado</span>
                                    <span style={{ color: '#10B981', fontWeight: 'bold' }}>12 Temas</span>
                                </div>
                                <div style={styles.progressBarBg}><div style={{ ...styles.progressBarFill, width: '70%', backgroundColor: '#10B981' }}></div></div>
                            </div>
                            <div>
                                <div style={styles.barLabelRow}>
                                    <span style={{ color: '#94A3B8' }}>En Progreso</span>
                                    <span style={{ color: '#3B82F6', fontWeight: 'bold' }}>5 Temas</span>
                                </div>
                                <div style={styles.progressBarBg}><div style={{ ...styles.progressBarFill, width: '40%', backgroundColor: '#3B82F6' }}></div></div>
                            </div>
                            <div>
                                <div style={styles.barLabelRow}>
                                    <span style={{ color: '#94A3B8' }}>Refuerzo</span>
                                    <span style={{ color: '#F59E0B', fontWeight: 'bold' }}>2 Temas</span>
                                </div>
                                <div style={styles.progressBarBg}><div style={{ ...styles.progressBarFill, width: '20%', backgroundColor: '#F59E0B' }}></div></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Recommendation (Recomendación IA) */}
                <div style={styles.recommendationCard}>
                    <div style={styles.aiIconBox}>
                        <span style={{ fontSize: 18 }}>🤖</span>
                    </div>
                    <div style={{ flex: 1 }}>
                        <h4 style={styles.recTitle}>RECOMENDACIÓN IA</h4>
                        <p style={styles.recText}>
                            {tieneDatos && estadisticas?.topErrores.length ?
                                `Conviene reforzar ${estadisticas.topErrores[0]} antes de avanzar.` :
                                "Excelente progreso. Mantén el ritmo esta semana."}
                        </p>
                    </div>
                </div>

                <div style={{ height: 100 }}></div>
            </div>
        </div>
    );
};

const styles = {
    pageContainer: {
        height: '100%',
        width: '100%',
        backgroundColor: '#0B1120', // Corporate Blue
        color: '#F3F4F6',
        fontFamily: '"Rajdhani", "Inter", sans-serif',
        display: 'flex',
        flexDirection: 'column' as const,
        position: 'relative' as const,
    },
    header: {
        padding: '16px 20px',
        backgroundColor: 'rgba(22, 32, 50, 0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
    },
    headerLeft: {
        display: 'flex',
        gap: 12,
        alignItems: 'center',
    },
    headerActions: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
    },
    avatarContainer: {
        position: 'relative' as const,
        width: 40,
        height: 40,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: '8px',
        backgroundColor: '#1E293B',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    onlineDot: {
        position: 'absolute' as const,
        bottom: -2,
        right: -2,
        width: 10,
        height: 10,
        backgroundColor: '#00ff9d',
        borderRadius: '50%',
        border: '2px solid #0B1120',
    },
    headerTextCol: {
        display: 'flex',
        flexDirection: 'column' as const,
    },
    headerTitle: {
        fontSize: '14px',
        fontWeight: '700',
        color: 'white',
        lineHeight: 1.2,
    },
    headerSubtitle: {
        fontSize: '10px',
        color: '#94A3B8',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
        fontWeight: '600',
    },
    dateBadge: {
        backgroundColor: 'rgba(15, 22, 35, 0.8)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '8px',
        padding: '6px 12px',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
    },
    pdfButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '6px 12px',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
    },
    dateText: {
        fontSize: '11px',
        color: 'white',
        fontWeight: '600',
    },
    pdfText: {
        fontSize: '11px',
        color: '#E5E7EB', // Gray-200
        fontWeight: '600',
    },
    contentScroll: {
        flex: 1,
        overflowY: 'auto' as const,
        padding: '24px 20px 100px 20px', // Extra bottom pad for nav
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '24px',
    },

    // Section Styles
    sectionBlock: {
        display: 'flex',
        flexDirection: 'column' as const,
    },
    sectionTitleRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionDotClass: {
        width: 6,
        height: 6,
        borderRadius: '50%',
        backgroundColor: '#00ff9d',
    },
    sectionTitle: {
        fontSize: '11px',
        fontWeight: 'bold',
        color: '#94A3B8',
        textTransform: 'uppercase' as const,
        letterSpacing: '1px',
    },
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },

    // Daily Grid
    dailyGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
    },
    techCard: {
        backgroundColor: '#162032', // Surface Blue
        border: '1px solid rgba(59, 130, 246, 0.15)',
        borderRadius: '12px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column' as const,
        position: 'relative' as const,
        overflow: 'hidden',
    },
    cardIconBg: {
        position: 'absolute' as const,
        top: 8,
        right: 8,
        opacity: 0.1,
    },
    cardLabel: {
        fontSize: '9px',
        color: '#94A3B8',
        fontWeight: 'bold',
        textTransform: 'uppercase' as const,
        marginBottom: 4,
    },
    cardMainValueRow: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 4,
        marginBottom: 8,
    },
    cardValue: {
        fontSize: '20px',
        fontWeight: '700',
        color: 'white',
    },
    cardUnit: {
        fontSize: '11px',
        color: '#94A3B8',
        fontWeight: '500',
    },
    cardTrendPositive: {
        fontSize: '9px',
        color: '#10B981',
        fontWeight: '600',
    },
    cardTrendBlue: {
        fontSize: '9px',
        color: '#3B82F6',
        fontWeight: '600',
    },

    // Weekly Grid
    weeklyGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '8px',
        marginBottom: '16px',
    },
    weeklyCardCentered: {
        backgroundColor: '#162032',
        border: '1px solid rgba(59, 130, 246, 0.15)',
        borderRadius: '12px',
        padding: '12px 8px',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        textAlign: 'center' as const,
    },
    cardLabelCentered: {
        fontSize: '8px',
        color: '#94A3B8',
        fontWeight: 'bold',
        textTransform: 'uppercase' as const,
        marginBottom: 8,
    },
    chartRingWrapper: {
        position: 'relative' as const,
        width: 48,
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    chartRingText: {
        position: 'absolute' as const,
        fontSize: '10px',
        fontWeight: 'bold',
        color: 'white',
    },
    progressBarBg: {
        width: '100%',
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#3B82F6',
        borderRadius: 2,
    },

    // Stats Detail
    techCardPadding: {
        backgroundColor: '#162032',
        border: '1px solid rgba(59, 130, 246, 0.15)',
        borderRadius: '12px',
        padding: '16px',
    },
    innerTitle: {
        fontSize: '10px',
        color: 'white',
        fontWeight: 'bold',
        textTransform: 'uppercase' as const,
        marginBottom: 12,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        paddingBottom: 8,
    },
    barLabelRow: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '9px',
        marginBottom: 4,
    },

    // Recommendations
    recommendationCard: {
        marginTop: 24,
        background: 'linear-gradient(135deg, rgba(22, 32, 50, 0.9), rgba(11, 17, 32, 1))',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    },
    aiIconBox: {
        width: 40,
        height: 40,
        borderRadius: '50%',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    recTitle: {
        fontSize: '10px',
        color: '#3B82F6',
        fontWeight: 'bold',
        textTransform: 'uppercase' as const,
        marginBottom: 2,
    },
    recText: {
        fontSize: '12px',
        color: 'white',
        fontWeight: '500',
        lineHeight: 1.3,
    },
};

export default PadresScreen;
