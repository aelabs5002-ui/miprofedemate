import React, { useEffect, useState } from 'react';
import BaseLayout from '../components/BaseLayout';
import { MissionService } from '../servicios/MissionService';
import { MissionBuildStatus, MissionPlan } from '../types/missionTypes';

interface CreandoMisionScreenProps {
    missionId: string;
    alTerminar: (plan: MissionPlan) => void;
    alFallar: (status: MissionBuildStatus) => void;
}

const CreandoMisionScreen: React.FC<CreandoMisionScreenProps> = ({ missionId, alTerminar, alFallar }) => {
    const [status, setStatus] = useState<MissionBuildStatus | null>(null);

    useEffect(() => {
        let mounted = true;
        let intervalId: ReturnType<typeof setInterval>;

        const check = async () => {
            try {
                const s = await MissionService.checkStatus(missionId);
                if (!mounted) return;
                setStatus(s);

                if (s.state === 'ready') {
                    // Obtener plan
                    const plan = await MissionService.getPlan(missionId);
                    if (plan) {
                        alTerminar(plan);
                    } else {
                        // Should not happen
                        alFallar({ ...s, state: 'error', message: 'Plan no encontrado' });
                    }
                } else if (s.state === 'error') {
                    alFallar(s);
                }
            } catch (e) {
                console.error(e);
                // Retry on next tick
            }
        };

        // Initial check
        check();

        // Polling
        intervalId = setInterval(check, 1000);

        return () => {
            mounted = false;
            clearInterval(intervalId);
        };
    }, [missionId, alTerminar, alFallar]);

    const pct = status?.progressPct || 0;
    const msg = status?.message || 'Iniciando...';

    return (
        <BaseLayout titulo="Preparando Misión">
            <div style={estilos.contenedor}>
                <div style={estilos.animacion}>
                    {/* Simple pulsating circle or spinner */}
                    <div style={estilos.spinnerContainer}>
                        <div style={estilos.spinner}></div>
                        <div style={estilos.icon}>🧠</div>
                    </div>
                </div>

                <h2 style={estilos.titulo}>Creando tu misión...</h2>
                <p style={estilos.mensaje}>{msg}</p>

                {/* Progress Bar */}
                <div style={estilos.progressBarContainer}>
                    <div style={{ ...estilos.progressBarFill, width: `${pct}%` }} />
                </div>

                <p style={estilos.pctText}>{pct}%</p>
            </div>
        </BaseLayout>
    );
};

const estilos = {
    contenedor: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center' as const,
        minHeight: '60vh',
    },
    animacion: {
        marginBottom: '30px',
    },
    spinnerContainer: {
        position: 'relative' as const,
        width: '100px',
        height: '100px',
    },
    spinner: {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        border: '6px solid #F1F3F5',
        borderTop: '6px solid #6610f2',
        borderRadius: '50%',
        animation: 'spin 1.5s linear infinite',
    },
    icon: {
        position: 'absolute' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '40px',
    },
    titulo: {
        fontSize: '24px',
        fontWeight: '800' as const,
        color: '#212529',
        marginBottom: '8px',
    },
    mensaje: {
        fontSize: '16px',
        color: '#6C757D',
        marginBottom: '30px',
        minHeight: '24px',
    },
    progressBarContainer: {
        width: '100%',
        maxWidth: '300px',
        height: '10px',
        backgroundColor: '#E9ECEF',
        borderRadius: '5px',
        overflow: 'hidden',
        marginBottom: '10px',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#6610f2',
        transition: 'width 0.5s ease',
    },
    pctText: {
        fontSize: '12px',
        color: '#ADB5BD',
        fontWeight: '600' as const,
    }
};

// Add global style for spin animation if not exists
if (!document.getElementById('c5-spin-style')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'c5-spin-style';
    styleSheet.innerText = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    `;
    document.head.appendChild(styleSheet);
}

export default CreandoMisionScreen;
