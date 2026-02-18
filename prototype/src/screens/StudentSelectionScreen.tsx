import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useApp } from '../context/AppContext';

// INTERFACES
interface Student {
    id: string;
    description?: string; // Some DBs use description? No, schema said name.
    name: string; // "name" in DB
    display_name?: string; // "display_name" in recent code? 
    // Let's support both to be safe
    grade: string;
    avatar_id?: string;
}



const StudentSelectionScreen: React.FC = () => {
    const styles = getStyles();
    const { iniciarSesion } = useApp();
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<Student[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [newGrade, setNewGrade] = useState('3ro Primaria');
    const [creating, setCreating] = useState(false);

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

            // Map DB data to Interface if needed
            // DB has 'name', interface expects 'name' now.
            setStudents(data || []);

            // 3. Auto-select if only 1 student AND we are not creating
            if (data && data.length === 1 && !showCreateForm) {
                // Auto-enter immediately
                handleSelectStudent(data[0]);
                return;
            }

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
        const usuarioData = {
            id: s.id, // REAL DB UUID
            nombre: s.display_name || s.name || 'Estudiante',
            correo: 'student@proxy.com',
            rol: 'Alumno' as const,
        };

        // Context only accepts specific props. We pass 'grade' separately to local storage.
        // If we want to pass it to context, we need to cast or update context type. 
        // For now, let's respect the type and just use local storage for grade.
        iniciarSesion(usuarioData);

        // Save extra metadata strictly for API usage
        localStorage.setItem('tpdm_active_student_id', s.id);
        localStorage.setItem('tpdm_active_grade', s.grade);
    };

    const handleCreateStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        setCreating(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No auth user");

            const { data, error } = await supabase
                .from('students')
                .insert({
                    parent_id: user.id,
                    name: newName,
                    grade: newGrade,
                    avatar_id: 'hero_1'
                })
                .select()
                .single();

            if (error) throw error;

            const newStudent: Student = {
                id: data.id,
                name: data.name,
                grade: data.grade,
                avatar_id: data.avatar_id
            };

            handleSelectStudent(newStudent);

        } catch (err: any) {
            console.error("Error creating student:", err);
            setError(err.message);
            setCreating(false);
        }
    };

    // Removal of handleAddStudent and form states as per requirement "1 padre = 1 estudiante"

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loader}>Cargando escuadrón...</div>
            </div>
        );
    }

    if (error && !creating) {
        return (
            <div style={styles.container}>
                <div style={styles.errorBox}>
                    <h3>Error</h3>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} style={styles.btnRetry}>
                        Reintentar
                    </button>
                    {/* Escape hatch in case of error */}
                    <button onClick={() => window.location.reload()} style={{ ...styles.btnRetry, marginLeft: 10 }}>
                        Recargar App
                    </button>
                </div>
            </div>
        );
    }

    // emptyState or Form
    const showForm = showCreateForm || students.length === 0;

    return (
        <div style={styles.container}>
            <div style={styles.gridPattern} />

            <div style={styles.content}>
                <h1 style={styles.title}>
                    {showForm ? 'NUEVO AGENTE' : 'SELECCIONA AGENTE'}
                </h1>

                {!showForm ? (
                    <>
                        <p style={styles.subtitle}>¿Quién realizará la misión hoy?</p>
                        <div style={styles.grid}>
                            {students.map((s) => (
                                <div key={s.id} onClick={() => handleSelectStudent(s)} style={styles.card}>
                                    <div style={styles.avatarPlaceholder}>
                                        {(s.display_name || s.name || 'A').charAt(0).toUpperCase()}
                                    </div>
                                    <div style={styles.cardInfo}>
                                        <h3 style={styles.studentName}>{s.display_name || s.name}</h3>
                                        <span style={styles.gradeBadge}>{s.grade}</span>
                                    </div>
                                    <div style={styles.arrowIcon}>→</div>
                                </div>
                            ))}
                        </div>
                        {/* Hidden Create Button for "Add Another" if needed in future, but requested 1-1 for now? 
                            Actually user said "Si ya existe 1... entrar directo". 
                            But if we are here (e.g. 2 students or forced back), we show list. 
                            If 0, we show form. 
                        */}
                    </>
                ) : (
                    <div style={styles.emptyState}>
                        {students.length === 0 && (
                            <p>No se encontraron estudiantes asociados a esta cuenta.</p>
                        )}

                        {/* Create Form */}
                        <form onSubmit={handleCreateStudent} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ textAlign: 'left' }}>
                                <label style={styles.label}>NOMBRE DEL AGENTE</label>
                                <input
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder="Ej. Sofía"
                                    style={styles.input}
                                    disabled={creating}
                                />
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <label style={styles.label}>GRADO / NIVEL</label>
                                <select
                                    value={newGrade}
                                    onChange={e => setNewGrade(e.target.value)}
                                    style={styles.select}
                                    disabled={creating}
                                >
                                    <option value="1ro Primaria" style={styles.option}>1ro Primaria</option>
                                    <option value="2do Primaria" style={styles.option}>2do Primaria</option>
                                    <option value="3ro Primaria" style={styles.option}>3ro Primaria</option>
                                    <option value="4to Primaria" style={styles.option}>4to Primaria</option>
                                    <option value="5to Primaria" style={styles.option}>5to Primaria</option>
                                    <option value="6to Primaria" style={styles.option}>6to Primaria</option>
                                </select>
                            </div>

                            <button type="submit" style={styles.primaryButton} disabled={creating || !newName.trim()}>
                                {creating ? 'CREANDO...' : 'CREAR Y COMENZAR'}
                            </button>
                        </form>
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
        pointerEvents: 'none' as const
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
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backdropFilter: 'blur(5px)'
    },
    modalContent: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: '#0B1220',
        borderRadius: 16,
        padding: 16,
        border: '1px solid rgba(255,255,255,0.12)',
        color: '#E5E7EB',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative' as const
    },
    input: {
        width: '100%',
        padding: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: '#FFFFFF',
        fontSize: '16px',
        outline: 'none',
        marginTop: 4
    },
    label: {
        color: '#E5E7EB',
        fontSize: '14px',
        marginBottom: 4,
        display: 'block'
    },
    cancelButton: {
        backgroundColor: 'transparent',
        color: '#E5E7EB',
        border: '1px solid rgba(255,255,255,0.12)',
        padding: '10px 16px',
        cursor: 'pointer',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600'
    },
    closeButton: {
        position: 'absolute' as const,
        top: '12px',
        right: '12px',
        background: 'none',
        border: 'none',
        color: '#9CA3AF',
        fontSize: '20px',
        cursor: 'pointer',
        padding: 4
    },
    select: {
        width: '100%',
        padding: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: '#FFFFFF',
        fontSize: '16px',
        outline: 'none',
        marginTop: 4,
        cursor: 'pointer',
        appearance: 'none' as const, // Fix for TypeScript
        WebkitAppearance: 'none' as const
    },
    option: {
        backgroundColor: '#0B1220',
        color: '#E5E7EB'
    }
});

export default StudentSelectionScreen;
