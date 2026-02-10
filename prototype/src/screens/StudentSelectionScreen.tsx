import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useApp } from '../context/AppContext';

// INTERFACES
interface Student {
    id: string;
    name: string;
    grade: string;
    avatar_id?: string;
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
            // 1. Check Session
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                await supabase.auth.signOut();
                return;
            }

            // 2. Fetch Students for this parent
            const { data, error: dbError } = await supabase
                .from('students')
                .select('*')
                .eq('parent_id', user.id);

            if (dbError) throw dbError;

            setStudents(data || []);

        } catch (err: any) {
            console.error('Error fetching students:', err);
            // Don't sign out on DB error, just show empty or error state
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

    const [showAddModal, setShowAddModal] = useState(false);
    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentGrade, setNewStudentGrade] = useState('');
    const [creating, setCreating] = useState(false);

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newStudentName.trim()) {
            alert('Por favor ingresa un nombre válido.');
            return;
        }

        setCreating(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No hay sesión de usuario.');

            // Insert into Supabase
            const { data, error: insertError } = await supabase
                .from('students')
                .insert([
                    {
                        parent_id: user.id,
                        name: newStudentName.trim(),
                        grade: newStudentGrade,
                        avatar_id: 'default'
                    }
                ])
                .select();

            if (insertError) throw insertError;

            // Success: reload list
            await fetchStudents();
            setShowAddModal(false);
            setNewStudentName('');
            setNewStudentGrade('');

        } catch (err: any) {
            console.error('Error creating student:', err);
            // Alert instead of global error to keep modal open if possible, 
            // or just let the global error catch it (which renders the error screen).
            // For better UX during creation, alert is safer to keep context.
            alert(err.message || 'Error al crear estudiante');
        } finally {
            setCreating(false);
        }
    };

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
                    <h3>Error</h3>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} style={styles.btnRetry}>
                        Reintentar
                    </button>
                    {/* Escape hatch in case of error */}
                    <button onClick={() => { setError(null); setShowAddModal(true); }} style={{ ...styles.btnRetry, marginLeft: 10 }}>
                        Crear Estudiante
                    </button>
                </div>
                {/* Modal de Error también podría ir aquí, pero simplificamos */}
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
                        <p>No hay estudiantes asociados.</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            style={styles.primaryButton}
                        >
                            + CREAR ESTUDIANTE
                        </button>
                        <div style={styles.warningBox}>
                            ⚠️ Modo Beta: Contacta a soporte para problemas.
                        </div>
                    </div>
                ) : (
                    <>
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
                        <div style={{ marginTop: 20 }}>
                            <button
                                onClick={() => setShowAddModal(true)}
                                style={styles.secondaryButton}
                            >
                                + Agregar otro estudiante
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* MODAL CREAR ESTUDIANTE */}
            {showAddModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h2 style={{ marginBottom: 16 }}>Nuevo Recluta</h2>
                        <form onSubmit={handleAddStudent} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <input
                                type="text"
                                placeholder="Nombre (ej. Juan)"
                                value={newStudentName}
                                onChange={e => setNewStudentName(e.target.value)}
                                style={styles.input}
                                required
                            />
                            <select
                                value={newStudentGrade}
                                onChange={e => setNewStudentGrade(e.target.value)}
                                style={styles.input}
                                required
                            >
                                <option value="">Selecciona Grado</option>
                                <option value="1ro Primaria">1ro Primaria</option>
                                <option value="2do Primaria">2do Primaria</option>
                                <option value="3ro Primaria">3ro Primaria</option>
                                <option value="4to Primaria">4to Primaria</option>
                                <option value="5to Primaria">5to Primaria</option>
                                <option value="6to Primaria">6to Primaria</option>
                                <option value="1ro Secundaria">1ro Secundaria</option>
                            </select>

                            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    style={styles.cancelButton}
                                    disabled={creating}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    style={styles.primaryButton}
                                    disabled={creating}
                                >
                                    {creating ? 'Creando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
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
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '16px'
    },
    warningBox: {
        marginTop: '20px',
        padding: '10px',
        backgroundColor: 'rgba(255, 165, 0, 0.1)',
        color: 'orange',
        fontSize: '12px',
        borderRadius: '8px'
    },
    primaryButton: {
        backgroundColor: '#34D399',
        color: '#064E3B',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 24px',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 0 15px rgba(52, 211, 153, 0.3)'
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        color: '#34D399',
        border: '1px solid #34D399',
        borderRadius: '8px',
        padding: '10px 20px',
        fontSize: '13px',
        cursor: 'pointer'
    },
    modalOverlay: {
        position: 'fixed' as const,
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    modalContent: {
        backgroundColor: '#131b3a',
        padding: '24px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '350px',
        border: '1px solid #2a3b68',
        boxShadow: '0 0 30px rgba(0,0,0,0.5)'
    },
    input: {
        backgroundColor: '#0f152e',
        border: '1px solid #2a3b68',
        borderRadius: '8px',
        padding: '12px',
        color: '#fff',
        fontSize: '14px',
        outline: 'none'
    },
    cancelButton: {
        backgroundColor: 'transparent',
        color: '#9CA3AF',
        border: 'none',
        padding: '12px',
        cursor: 'pointer',
        flex: 1
    }
});

export default StudentSelectionScreen;
