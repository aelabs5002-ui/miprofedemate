
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useApp } from '../context/AppContext';

// INTERFACES
interface Student {
    id: string;
    name: string;
    grade: string;
    avatar_url?: string;
}

interface AuthMeResponse {
    user: { id: string; email: string };
    students: Student[];
}

const StudentSelectionScreen: React.FC = () => {
    const { iniciarSesion } = useApp();
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<Student[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData.session?.access_token;

            if (!token) {
                // No session, redirect? 
                // For now, component logic handles rendering. 
                // Parent navigator should handle redirects usually.
                setError('No hay sesión activa.');
                setLoading(false);
                return;
            }

            // Call BFF
            const res = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error('Error verificando sesión');

            const data: AuthMeResponse = await res.json();
            setStudents(data.students || []);

        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectStudent = (s: Student) => {
        // Inject into Context
        iniciarSesion({
            id: s.id, // REAL DB UUID
            nombre: s.name || 'Estudiante',
            correo: 'student@proxy.com',
            rol: 'Alumno',
            grade: s.grade // Custom prop needed in context? 
            // Validar si 'grade' existe en UserProfile del context
            // Si no, lo guardamos en localStorage aparte.
        });

        // Save extra metadata strictly for API usage
        localStorage.setItem('tpdm_active_student_id', s.id);
        localStorage.setItem('tpdm_active_grade', s.grade);
    };

    const styles = getStyles();

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loader}>Cargando escuadrón...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.errorBox}>
                    <h3>Error de Autenticación</h3>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} style={styles.btnRetry}>
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.gridPattern} />

            <div style={styles.content}>
                <h1 style={styles.title}>SELECCIONA <span style={styles.highlight}>AGENTE</span></h1>
                <p style={styles.subtitle}>¿Quién realizará la misión hoy?</p>

                {students.length === 0 ? (
                    <div style={styles.emptyState}>
                        <p>No hay estudiantes asociados a esta cuenta.</p>
                        {/* Future: Add 'Crear Estudiante' button */}
                        <div style={styles.warningBox}>
                            ⚠️ Modo Beta: Contacta a soporte para vincular estudiantes.
                        </div>
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {students.map((s) => (
                            <div key={s.id} onClick={() => handleSelectStudent(s)} style={styles.card}>
                                <div style={styles.avatarPlaceholder}>
                                    {s.name.charAt(0).toUpperCase()}
                                </div>
                                <div style={styles.cardInfo}>
                                    <h3 style={styles.studentName}>{s.name}</h3>
                                    <span style={styles.gradeBadge}>{s.grade}</span>
                                </div>
                                <div style={styles.arrowIcon}>→</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Styles (Dark/Neon Future)
const getStyles = () => ({
    container: {
        minHeight: '100vh',
        backgroundColor: '#0A0E29',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
        position: 'relative' as const,
        overflow: 'hidden'
    },
    gridPattern: {
        position: 'absolute' as const,
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none'
    },
    loader: {
        color: '#00ff9d',
        fontSize: '18px',
        fontWeight: 'bold',
        letterSpacing: '1px'
    },
    content: {
        zIndex: 10,
        width: '100%',
        maxWidth: '500px',
        padding: '24px',
        textAlign: 'center' as const
    },
    title: {
        fontSize: '28px',
        fontWeight: '800',
        marginBottom: '8px'
    },
    highlight: {
        color: '#00ff9d',
        textShadow: '0 0 15px rgba(0, 255, 157, 0.4)'
    },
    subtitle: {
        color: '#9CA3AF',
        marginBottom: '40px'
    },
    grid: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '16px'
    },
    card: {
        backgroundColor: '#131b3a', // Dark blue card
        border: '1px solid #2a3b68',
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'transform 0.2s, border-color 0.2s',
        ':hover': {
            borderColor: '#00ff9d',
            transform: 'scale(1.02)'
        }
    },
    avatarPlaceholder: {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        backgroundColor: '#2563EB',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        fontWeight: 'bold',
        boxShadow: '0 0 10px rgba(37, 99, 235, 0.4)'
    },
    cardInfo: {
        flex: 1,
        textAlign: 'left' as const,
        marginLeft: '16px'
    },
    studentName: {
        margin: 0,
        fontSize: '18px',
        fontWeight: '600',
        color: '#fff'
    },
    gradeBadge: {
        fontSize: '12px',
        color: '#9CA3AF',
        marginTop: '4px',
        display: 'block'
    },
    arrowIcon: {
        color: '#00ff9d',
        fontSize: '20px',
        fontWeight: 'bold'
    },
    errorBox: {
        textAlign: 'center' as const,
        padding: '20px',
        backgroundColor: 'rgba(255,0,0,0.1)',
        border: '1px solid rgba(255,0,0,0.3)',
        borderRadius: '12px'
    },
    btnRetry: {
        marginTop: '10px',
        padding: '8px 16px',
        backgroundColor: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer'
    },
    emptyState: {
        padding: '40px',
        color: '#6B7280',
        border: '2px dashed #2a3b68',
        borderRadius: '16px'
    },
    warningBox: {
        marginTop: '20px',
        padding: '10px',
        backgroundColor: 'rgba(255, 165, 0, 0.1)',
        color: 'orange',
        fontSize: '12px',
        borderRadius: '8px'
    }
});

export default StudentSelectionScreen;
