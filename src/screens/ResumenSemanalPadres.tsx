import React, { useMemo } from 'react';
import { memoriaAlumno } from '../servicios/RepositorioMemoriaAlumno';

interface ResumenSemanalPadresProps {
    userId: string;
    alCerrar: () => void;
}

const ResumenSemanalPadres: React.FC<ResumenSemanalPadresProps> = ({ userId, alCerrar }) => {
    const { estadisticas, rangoFechas } = useMemo(() => {
        const eventos = memoriaAlumno.getEventos(userId);
        const ahora = new Date();
        const sieteDiasAtras = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Formato de fechas
        const optionsDate: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
        const fechaInicio = sieteDiasAtras.toLocaleDateString('es-ES', optionsDate);
        const fechaFin = ahora.toLocaleDateString('es-ES', optionsDate);

        // Filtrar últimos 7 días
        const eventosRecientes = eventos.filter(ev => {
            return (ev.timestamp || 0) >= sieteDiasAtras.getTime();
        });

        if (eventosRecientes.length === 0) {
            return { estadisticas: null, rangoFechas: `${fechaInicio} - ${fechaFin}` };
        }

        let totalIntentos = 0;
        let correctos = 0;
        const temasContador: Record<string, number> = {};
        const erroresContador: Record<string, number> = {};

        eventosRecientes.forEach(ev => {
            if (ev.tipo === 'ejercicio_completado') {
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

        // Contexto de misiones (últimos 3)
        const eventosMision = eventos.filter(ev =>
            ev.tipo === 'mision_generada' && (ev.timestamp || 0) >= sieteDiasAtras.getTime()
        ).sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);

        const contextosRecientes = eventosMision.map(ev => ({
            ts: ev.timestamp,
            origin: ev.payload.origin,
            observacion: ev.payload.context?.observacion,
            tarea: ev.payload.context?.tareaNombre || ev.payload.context?.tareaTexto
        }));

        return {
            estadisticas: {
                totalIntentos,
                correctos,
                accuracy,
                topTemas,
                topErrores,
                contextosRecientes
            },
            rangoFechas: `${fechaInicio} - ${fechaFin}`
        };
    }, [userId]);

    const handlePrint = () => {
        window.print();
    };

    if (!estadisticas) {
        return (
            <div style={estilos.contenedorVacio}>
                <h3>No hay datos suficientes para generar el reporte semanal.</h3>
                <button onClick={alCerrar} style={estilos.botonVolver}>Volver</button>
            </div>
        );
    }

    return (
        <div style={estilos.pageContainer}>
            {/* Barra de herramientas (No se imprime) */}
            <div style={estilos.toolbar} className="no-print">
                <button onClick={alCerrar} style={estilos.botonVolver}>&larr; Volver</button>
                <button onClick={handlePrint} style={estilos.botonImprimir}>🖨️ Imprimir / Guardar PDF</button>
            </div>

            {/* Contenido del Reporte (Se imprime) */}
            <div style={estilos.reporte} className="print-content">
                <div style={estilos.header}>
                    <h1 style={estilos.tituloReporte}>Resumen Semanal de Aprendizaje</h1>
                    <p style={estilos.subtituloReporte}>Tutor Matemático IA</p>
                    <div style={estilos.fechaRango}>{rangoFechas}</div>
                </div>

                <div style={estilos.seccion}>
                    <h2 style={estilos.tituloSeccion}>📊 Progreso General</h2>
                    <div style={estilos.gridStats}>
                        <div style={estilos.statBox}>
                            <span style={estilos.statValue}>{estadisticas.totalIntentos}</span>
                            <span style={estilos.statLabel}>Ejercicios Realizados</span>
                        </div>
                        <div style={estilos.statBox}>
                            <span style={estilos.statValue}>{estadisticas.accuracy}%</span>
                            <span style={estilos.statLabel}>Precisión</span>
                        </div>
                    </div>
                </div>

                <div style={estilos.seccion}>
                    <h2 style={estilos.tituloSeccion}>📚 Temas Trabajados</h2>
                    <ul style={estilos.listaSimple}>
                        {estadisticas.topTemas.map((tema, i) => (
                            <li key={i} style={estilos.itemLista}>✅ {tema}</li>
                        ))}
                        {estadisticas.topTemas.length === 0 && <li>Ninguno registrado.</li>}
                    </ul>
                </div>

                <div style={estilos.seccion}>
                    <h2 style={estilos.tituloSeccion}>⚠️ Áreas de Oportunidad</h2>
                    <p style={estilos.nota}>Temas que requieren más práctica:</p>
                    <ul style={estilos.listaSimple}>
                        {estadisticas.topErrores.map((tema, i) => (
                            <li key={i} style={estilos.itemLista}>🔸 {tema}</li>
                        ))}
                        {estadisticas.topErrores.length === 0 && <li>¡Excelente! Pocos errores detectados.</li>}
                    </ul>
                </div>

                <div style={estilos.seccion}>
                    <h2 style={estilos.tituloSeccion}>📋 Contexto de Misiones</h2>
                    {estadisticas.contextosRecientes && estadisticas.contextosRecientes.length > 0 ? (
                        <ul style={estilos.listaSimple}>
                            {estadisticas.contextosRecientes.map((ctx: any, i: number) => (
                                <li key={i} style={estilos.itemLista}>
                                    <strong>{new Date(ctx.ts).toLocaleDateString()}:</strong>{' '}
                                    <span style={{ color: '#6610f2' }}>
                                        {ctx.origin === 'auto' ? 'Automática' :
                                            ctx.origin === 'observacion' ? 'Por Observación' :
                                                ctx.origin === 'tarea' ? 'Por Tarea' : 'Mixta'}
                                    </span>
                                    {(ctx.observacion || ctx.tarea) && (
                                        <div style={{ fontSize: '14px', fontStyle: 'italic', color: '#666', marginTop: '4px' }}>
                                            "{ctx.observacion || ctx.tarea}"
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ color: '#666', fontStyle: 'italic' }}>No se registró contexto específico esta semana.</p>
                    )}
                </div>

                <div style={estilos.footer}>
                    <div style={estilos.mensajePedagogico}>
                        "🧠 El error es útil y parte del aprendizaje."
                    </div>
                    <p style={estilos.fechaGeneracion}>
                        Generado el: {new Date().toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* Estilos para impresión */}
            <style>{`
            @media print {
                @page { margin: 10mm; }
                body { 
                    background: white; 
                    -webkit-print-color-adjust: exact; 
                }
                .no-print { display: none !important; }
                .print-content { 
                    box-shadow: none !important; 
                    margin: 0 !important;
                    padding: 0 !important;
                    width: 100% !important;
                    min-height: auto !important;
                }
                /* Ocultar elementos de UI si se colaron */
                button, input { display: none !important; }
            }
        `}</style>
        </div>
    );
};

const estilos = {
    contenedorVacio: {
        padding: '40px',
        textAlign: 'center' as const,
        fontFamily: 'sans-serif',
    },
    pageContainer: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 2000,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        padding: '20px',
        boxSizing: 'border-box' as const,
    },
    toolbar: {
        width: '100%',
        maxWidth: '210mm',
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px',
    },
    botonVolver: {
        padding: '10px 20px',
        backgroundColor: '#f8f9fa',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold' as const,
    },
    botonImprimir: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold' as const,
    },
    reporte: {
        width: '210mm',
        minHeight: '297mm', // A4
        backgroundColor: 'white',
        padding: '30px', // Reducir un poco padding
        boxShadow: '0 0 20px rgba(0,0,0,0.5)',
        fontFamily: 'Arial, sans-serif',
        color: '#333',
        margin: '0 auto', // Centrar visualmente en pantalla
    },
    header: {
        textAlign: 'center' as const,
        borderBottom: '2px solid #eee',
        paddingBottom: '20px',
        marginBottom: '30px',
    },
    tituloReporte: {
        fontSize: '28px',
        color: '#212529',
        marginBottom: '10px',
    },
    subtituloReporte: {
        fontSize: '16px',
        color: '#6c757d',
        marginBottom: '5px',
    },
    fechaRango: {
        fontSize: '18px',
        fontWeight: 'bold' as const,
        color: '#007bff',
        marginTop: '10px',
    },
    seccion: {
        marginBottom: '30px',
    },
    tituloSeccion: {
        fontSize: '20px',
        color: '#495057',
        borderLeft: '5px solid #007bff',
        paddingLeft: '15px',
        marginBottom: '20px',
    },
    gridStats: {
        display: 'flex',
        justifyContent: 'space-around',
        marginTop: '20px',
    },
    statBox: {
        textAlign: 'center' as const,
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        width: '40%',
    },
    statValue: {
        display: 'block',
        fontSize: '36px',
        fontWeight: 'bold' as const,
        color: '#212529',
    },
    statLabel: {
        fontSize: '14px',
        color: '#6c757d',
        textTransform: 'uppercase' as const,
        letterSpacing: '1px',
    },
    listaSimple: {
        listStyle: 'none',
        padding: 0,
        fontSize: '16px',
        lineHeight: '1.6',
    },
    itemLista: {
        marginBottom: '8px',
        paddingBottom: '8px',
        borderBottom: '1px solid #f1f1f1',
    },
    nota: {
        fontSize: '14px',
        color: '#666',
        fontStyle: 'italic',
        marginBottom: '10px',
    },
    footer: {
        marginTop: '50px',
        textAlign: 'center' as const,
        borderTop: '1px solid #eee',
        paddingTop: '30px',
    },
    mensajePedagogico: {
        fontSize: '16px',
        fontWeight: 'bold' as const,
        color: '#856404',
        backgroundColor: '#fff3cd',
        padding: '15px',
        borderRadius: '10px',
        display: 'inline-block',
        marginBottom: '20px',
    },
    fechaGeneracion: {
        fontSize: '12px',
        color: '#ccc',
    }
};

export default ResumenSemanalPadres;
