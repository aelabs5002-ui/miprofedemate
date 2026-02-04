import React from 'react';
import BaseLayout from '../components/BaseLayout';
import { MissionBuildStatus } from '../types/missionTypes';

interface ErrorProps {
    status?: MissionBuildStatus;
    alReintentar?: () => void;
    alSalir: () => void; // Fallback to safe place (Start Practice without task, or Home)
}

const ErrorCreandoMisionScreen: React.FC<ErrorProps> = ({ status, alReintentar, alSalir }) => {
    return (
        <BaseLayout titulo="Ops!">
            <div style={estilos.contenedor}>
                <div style={estilos.icono}>⚠️</div>

                <h2 style={estilos.titulo}>Algo salió mal</h2>

                <p style={estilos.mensaje}>
                    {status?.message || 'No pudimos crear tu misión.'}
                </p>

                {status?.errorCode && (
                    <span style={estilos.errorCode}>Código: {status.errorCode}</span>
                )}

                <div style={estilos.botones}>
                    {status?.retryable && alReintentar && (
                        <button style={estilos.btnAdd} onClick={alReintentar}>
                            Intentar de nuevo
                        </button>
                    )}

                    <button style={estilos.btnSec} onClick={alSalir}>
                        Practicar sin tarea
                    </button>
                </div>
            </div>
        </BaseLayout>
    );
};

const estilos = {
    contenedor: {
        padding: '40px 20px',
        textAlign: 'center' as const,
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '20px',
    },
    icono: {
        fontSize: '60px',
        marginBottom: '10px',
    },
    titulo: {
        fontSize: '22px',
        fontWeight: '800' as const,
        color: '#343A40',
        margin: 0,
    },
    mensaje: {
        fontSize: '15px',
        color: '#6C757D',
        maxWidth: '300px',
        lineHeight: '1.5',
    },
    errorCode: {
        fontSize: '11px',
        color: '#ADB5BD',
        padding: '4px 8px',
        backgroundColor: '#F8F9FA',
        borderRadius: '4px',
    },
    botones: {
        width: '100%',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '12px',
        marginTop: '20px',
    },
    btnAdd: {
        width: '100%',
        padding: '16px',
        borderRadius: '16px',
        border: 'none',
        backgroundColor: '#FFC107',
        color: '#212529',
        fontWeight: '700' as const,
        cursor: 'pointer',
        fontSize: '16px',
    },
    btnSec: {
        width: '100%',
        padding: '16px',
        borderRadius: '16px',
        border: '1px solid #DEE2E6',
        backgroundColor: 'transparent',
        color: '#495057',
        fontWeight: '600' as const,
        cursor: 'pointer',
        fontSize: '15px',
    }
};

export default ErrorCreandoMisionScreen;
