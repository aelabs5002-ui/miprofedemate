import React, { useState, useEffect } from 'react';
import PadresScreen from './PadresScreen'; // Integration: Import Stats Screen

interface PadrePanelScreenProps {
    userId: string;
    alVolver: () => void;
    alIrABiblioteca: () => void;
}

type TabView = 'biblioteca' | 'estadisticas';

const PadrePanelScreen: React.FC<PadrePanelScreenProps> = ({ userId, alVolver }) => {
    // --- Integration State ---
    const [currentView, setCurrentView] = useState<TabView>('biblioteca');

    // --- LÓGICA EXISTENTE INTACTA (Library) ---
    const [pais, setPais] = useState('México');
    const [grado, setGrado] = useState('3° de Secundaria');
    const [textoProfesor, setTextoProfesor] = useState('');

    // Mock Files State
    const [files, setFiles] = useState([
        { id: 1, name: 'Algebra_Lineal_Avanza...', size: '2.4 MB', date: '12/10/23', status: 'done' },
        { id: 2, name: 'Calculo_Diferencial_v2....', size: '1.8 MB', date: '10/10/23', status: 'done' },
        { id: 3, name: 'Geometria_Euclidiana....', size: '', date: '', status: 'processing' }
    ]);

    useEffect(() => {
        const saved = localStorage.getItem(`padre_config_${userId}`);
        if (saved) {
            const p = JSON.parse(saved);
            setPais(p.pais || 'México');
            setGrado(p.grado || '3° de Secundaria');
            setTextoProfesor(p.textoProfesor || '');
        }
    }, [userId]);

    const handleFinalizar = () => {
        const config = { pais, grado, textoProfesor, finished: true };
        localStorage.setItem(`padre_config_${userId}`, JSON.stringify(config));
        alert("Configuración Finalizada y Guardada.");
        alVolver();
    };

    const handleDelete = (id: number) => {
        setFiles(files.filter(f => f.id !== id));
    };

    // --- INTEGRATION RENDER LOGIC ---
    if (currentView === 'estadisticas') {
        // Render existing Parents/Stats Screen with a custom "Back" that returns to Library view
        // OR if user wants to exit portal completely, they can click "Volver" inside PadresScreen.
        // Rule: "Integrar ... accesible desde PadrePanelScreen".
        // If we map alVolver to switch back to library, it acts like a tab.
        return (
            <div style={styles.darkPageBackground}>
                <div style={styles.mobileFrame}>
                    <PadresScreen userId={userId} alVolver={() => setCurrentView('biblioteca')} />
                </div>
            </div>
        );
    }

    // --- RENDER (Library - Mobile First Container) ---
    return (
        <div style={styles.darkPageBackground}>
            <div style={styles.mobileFrame}>

                {/* Header with Integrated Navigation */}
                <div style={styles.header}>
                    <button style={styles.backButton} onClick={alVolver}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00E676" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <h1 style={styles.headerTitle}>PORTAL PADRES</h1>
                    <div style={{ width: 40 }}></div> {/* Spacer/Balance */}
                </div>

                {/* Internal Tabs (Toggle) */}
                <div style={styles.tabContainer}>
                    <button
                        style={currentView === 'biblioteca' ? styles.tabActive : styles.tabInactive}
                        onClick={() => setCurrentView('biblioteca')}
                    >
                        BIBLIOTECA
                    </button>
                    <button
                        style={currentView === 'estadisticas' ? styles.tabActive : styles.tabInactive}
                        onClick={() => setCurrentView('estadisticas')}
                    >
                        ESTADÍSTICAS
                    </button>
                </div>

                {/* Main Scroll Content (Library) */}
                <div style={styles.scrollContent}>

                    {/* Sección 1: BIBLIOTECA ACTIVA */}
                    <div style={styles.sectionContainer}>
                        <div style={styles.sectionHeader}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00E676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                            </svg>
                            <h2 style={styles.sectionTitle}>BIBLIOTECA ACTIVA</h2>
                        </div>

                        <div style={styles.gridContainer}>
                            {files.map(file => (
                                <div key={file.id} style={styles.fileCard}>
                                    <div style={styles.fileCardTop}>
                                        <div style={styles.fileIconBox}>
                                            <span style={{ fontSize: '8px', color: '#9CA3AF', marginBottom: 2 }}>PDF</span>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                <polyline points="14 2 14 8 20 8"></polyline>
                                            </svg>
                                        </div>
                                        <div style={styles.fileActions}>
                                            <button style={styles.iconBtnSmall} onClick={() => handleDelete(file.id)}>
                                                <span style={{ color: '#00E676' }}>×</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div style={styles.fileCardBottom}>
                                        <div style={styles.fileNameRow}>
                                            <span style={styles.fileName}>{file.name.substring(0, 10)}...</span>
                                            {file.status === 'done' && <span style={{ color: '#00E676', fontSize: 10 }}>✓</span>}
                                            {file.status === 'processing' && <span style={{ color: '#3B82F6', fontSize: 10 }}>↻</span>}
                                        </div>
                                        <span style={styles.fileMeta}>CURRÍCULO NAC.</span>
                                    </div>
                                    <div style={styles.glowCorner}></div>
                                </div>
                            ))}

                            <div style={styles.uploadCard}>
                                <div style={styles.uploadIconCircle}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 5v14M5 12h14" />
                                    </svg>
                                </div>
                                <span style={styles.uploadText}>SUBIR<br />ARCHIVO</span>
                            </div>
                        </div>
                    </div>

                    {/* Sección 2: REGLAS DE MISIÓN */}
                    <div style={styles.glassPanel}>
                        <div style={styles.sectionHeader}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00E676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <path d="M8 11h8" />
                            </svg>
                            <h2 style={styles.sectionTitle}>REGLAS DE MISIÓN</h2>
                        </div>

                        <div style={styles.consoleWrapper}>
                            <textarea
                                style={styles.consoleInput}
                                placeholder="Ej: Priorizar explicaciones visuales..."
                                rows={4}
                                value={textoProfesor}
                                onChange={(e) => setTextoProfesor(e.target.value)}
                            />
                            <div style={styles.consoleFooter}>IA CONTEXT: ACTIVE</div>
                        </div>

                        <div style={styles.systemRows}>
                            <div style={styles.systemRow}>
                                <div style={styles.systemLabelIcon}>
                                    <span style={{ marginRight: 8, color: '#6B7280' }}>📍</span>
                                    <span style={styles.systemLabel}>País</span>
                                </div>
                                <select
                                    style={styles.systemSelect}
                                    value={pais}
                                    onChange={(e) => setPais(e.target.value)}
                                >
                                    <option>México</option>
                                    <option>Colombia</option>
                                    <option>Argentina</option>
                                    <option>España</option>
                                    <option>Perú</option>
                                    <option>Chile</option>
                                </select>
                            </div>

                            <div style={styles.systemRow}>
                                <div style={styles.systemLabelIcon}>
                                    <span style={{ marginRight: 8, color: '#6B7280' }}>🎓</span>
                                    <span style={styles.systemLabel}>Grado</span>
                                </div>
                                <select
                                    style={styles.systemSelect}
                                    value={grado}
                                    onChange={(e) => setGrado(e.target.value)}
                                >
                                    <option>1° de Secundaria</option>
                                    <option>2° de Secundaria</option>
                                    <option>3° de Secundaria</option>
                                    <option>1° de Preparatoria</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Sección 3: STATUS */}
                    <div style={styles.gridStatus}>
                        <div style={styles.statusCard}>
                            <div style={{ ...styles.statusIcon, backgroundColor: 'rgba(16, 185, 129, 0.2)' }}>
                                <span style={{ fontSize: 16 }}>🧠</span>
                            </div>
                            <div style={styles.statusTextCol}>
                                <span style={styles.statusLabel}>ESTADO</span>
                                <span style={styles.statusValue}>Contexto IA</span>
                                <span style={styles.statusSub}>OPTIMIZADO</span>
                            </div>
                        </div>
                        <div style={styles.statusCard}>
                            <div style={{ ...styles.statusIcon, backgroundColor: 'rgba(59, 130, 246, 0.2)' }}>
                                <span style={{ fontSize: 16 }}>🛡️</span>
                            </div>
                            <div style={styles.statusTextCol}>
                                <span style={styles.statusLabel}>SEGURIDAD</span>
                                <span style={styles.statusValue}>Privacidad</span>
                                <span style={{ ...styles.statusSub, color: '#3B82F6' }}>ASEGURADA</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ height: 100 }}></div>
                </div>

                {/* Footer Fijo */}
                <div style={styles.footer}>
                    <div style={styles.saveBadge}>
                        <div style={styles.saveCheck}>✓</div>
                        <span>Configuración lista</span>
                    </div>
                    <button style={styles.syncButton} onClick={handleFinalizar}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                            <path d="M16 16l5 5" />
                            <path d="M21 21v-5h-5" />
                        </svg>
                        SINCRONIZAR PROTOCOLOS
                    </button>
                </div>

            </div>
        </div>
    );
};

const styles = {
    darkPageBackground: {
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#000000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        overflowX: 'hidden' as const,
        fontFamily: '"Rajdhani", "Inter", sans-serif',
    },
    mobileFrame: {
        width: '100%',
        maxWidth: '390px',
        minHeight: '100vh',
        backgroundColor: '#0B1120',
        display: 'flex',
        flexDirection: 'column' as const,
        position: 'relative' as const,
        boxShadow: '0 0 50px rgba(0, 230, 118, 0.1)',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        backgroundColor: '#0B1120',
        zIndex: 10,
        position: 'sticky' as const,
        top: 0,
    },
    backButton: {
        background: 'none',
        border: 'none',
        padding: 8,
        cursor: 'pointer',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#FFFFFF',
        textTransform: 'uppercase' as const,
        letterSpacing: '1px',
    },
    tabContainer: {
        display: 'flex',
        padding: '0 20px 16px 20px',
        gap: '12px',
        backgroundColor: '#0B1120',
        zIndex: 9,
    },
    tabActive: {
        flex: 1,
        padding: '8px 0',
        backgroundColor: 'rgba(0, 230, 118, 0.1)',
        border: '1px solid #00E676',
        borderRadius: '8px',
        color: '#00E676',
        fontSize: '12px',
        fontWeight: '800',
        cursor: 'pointer',
    },
    tabInactive: {
        flex: 1,
        padding: '8px 0',
        backgroundColor: '#111827',
        border: '1px solid #374151',
        borderRadius: '8px',
        color: '#9CA3AF',
        fontSize: '12px',
        fontWeight: '700',
        cursor: 'pointer',
    },
    scrollContent: {
        flex: 1,
        overflowY: 'auto' as const,
        padding: '0 20px 24px 20px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '24px',
    },
    sectionContainer: {
        display: 'flex',
        flexDirection: 'column' as const,
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '16px',
    },
    sectionTitle: {
        fontSize: '15px',
        fontWeight: '700',
        color: '#FFFFFF',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
    },
    gridContainer: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
    },
    fileCard: {
        backgroundColor: '#111827',
        borderRadius: '16px',
        border: '1px solid rgba(0, 230, 118, 0.4)',
        padding: '12px',
        position: 'relative' as const,
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'space-between',
        minHeight: '110px',
        boxShadow: '0 0 15px rgba(0, 230, 118, 0.15)',
        overflow: 'hidden',
    },
    fileCardTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    fileIconBox: {
        width: '36px',
        height: '42px',
        backgroundColor: '#1F2937',
        borderRadius: '6px',
        border: '1px solid #374151',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fileActions: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '4px',
    },
    iconBtnSmall: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fileCardBottom: {
        marginTop: '10px',
        zIndex: 2,
    },
    fileNameRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        marginBottom: '2px',
    },
    fileName: {
        fontSize: '11px',
        fontWeight: '700',
        color: '#FFFFFF',
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '80px',
    },
    fileMeta: {
        fontSize: '9px',
        color: '#9CA3AF',
        textTransform: 'uppercase' as const,
        fontWeight: '500',
    },
    glowCorner: {
        position: 'absolute' as const,
        bottom: '-20px',
        right: '-20px',
        width: '60px',
        height: '60px',
        backgroundColor: 'rgba(0, 230, 118, 0.2)',
        borderRadius: '50%',
        filter: 'blur(20px)',
        pointerEvents: 'none' as const,
    },
    uploadCard: {
        backgroundColor: '#111827',
        borderRadius: '16px',
        border: '2px dashed #9CA3AF',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        cursor: 'pointer',
        minHeight: '110px',
        transition: 'all 0.2s',
    },
    uploadIconCircle: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '8px',
    },
    uploadText: {
        fontSize: '11px',
        fontWeight: '600',
        color: '#D1D5DB',
        textAlign: 'center' as const,
        lineHeight: '1.2',
    },
    glassPanel: {
        backgroundColor: 'rgba(17, 24, 39, 0.6)',
        border: '1px solid rgba(0, 230, 118, 0.15)',
        borderRadius: '16px',
        padding: '16px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 0 10px rgba(0, 230, 118, 0.05)',
    },
    consoleWrapper: {
        position: 'relative' as const,
        marginBottom: '20px',
    },
    consoleInput: {
        width: '100%',
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        border: '1px solid #374151',
        borderRadius: '12px',
        padding: '12px',
        color: '#E5E7EB',
        fontSize: '13px',
        fontFamily: 'monospace',
        outline: 'none',
        resize: 'none' as const,
    },
    consoleFooter: {
        position: 'absolute' as const,
        bottom: '8px',
        right: '8px',
        fontSize: '9px',
        color: '#00E676',
        fontFamily: 'monospace',
        opacity: 0.7,
        pointerEvents: 'none' as const,
    },
    systemRows: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '12px',
    },
    systemRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #1F2937',
        paddingBottom: '8px',
    },
    systemLabelIcon: {
        display: 'flex',
        alignItems: 'center',
    },
    systemLabel: {
        fontSize: '13px',
        fontWeight: '500',
        color: '#D1D5DB',
    },
    systemSelect: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#00E676',
        fontSize: '13px',
        fontWeight: '600',
        textAlign: 'right' as const,
        cursor: 'pointer',
        appearance: 'none' as const,
        outline: 'none',
    },
    gridStatus: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
    },
    statusCard: {
        backgroundColor: '#111827',
        borderRadius: '16px',
        border: '1px solid #1F2937',
        padding: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    statusIcon: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusTextCol: {
        display: 'flex',
        flexDirection: 'column' as const,
    },
    statusLabel: {
        fontSize: '9px',
        color: '#9CA3AF',
        fontWeight: '700',
        textTransform: 'uppercase' as const,
    },
    statusValue: {
        fontSize: '11px',
        color: '#FFFFFF',
        fontWeight: '600',
    },
    statusSub: {
        fontSize: '9px',
        color: '#00E676',
    },
    footer: {
        position: 'absolute' as const,
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        margin: '0 auto',
        padding: '24px',
        background: 'linear-gradient(to top, #0B1120 80%, transparent)',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        zIndex: 50,
    },
    saveBadge: {
        backgroundColor: '#1F2937',
        border: '1px solid #374151',
        borderRadius: '12px',
        padding: '6px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
        color: '#FFFFFF',
        fontSize: '11px',
        fontWeight: '500',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
    },
    saveCheck: {
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        backgroundColor: '#00E676',
        color: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '10px',
        fontWeight: 'bold',
    },
    syncButton: {
        width: '100%',
        height: '50px',
        backgroundColor: '#00E676',
        color: '#000000',
        borderRadius: '16px',
        border: 'none',
        fontSize: '15px',
        fontWeight: '800',
        letterSpacing: '1px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textTransform: 'uppercase' as const,
        boxShadow: '0 0 20px rgba(0, 230, 118, 0.4)',
        transition: 'transform 0.1s',
    }
};

export default PadrePanelScreen;
