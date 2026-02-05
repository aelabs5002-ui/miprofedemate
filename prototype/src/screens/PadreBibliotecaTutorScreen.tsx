import React, { useState, useEffect } from 'react';
import BaseLayout from '../components/BaseLayout';
import { repositorioBiblioteca } from '../servicios/RepositorioBibliotecaTutor';
import { LibraryDocMeta, LibraryDocType } from '../tipos/bibliotecaTutor';

interface Props {
    userId: string;
    alVolver: () => void;
}

const PadreBibliotecaTutorScreen: React.FC<Props> = ({ userId, alVolver }) => {
    const [docs, setDocs] = useState<LibraryDocMeta[]>([]);
    const [loading, setLoading] = useState(true);

    // Upload State
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [metaForm, setMetaForm] = useState<{
        docType: LibraryDocType;
        grade: string;
        tags: string;
        priority: number;
        isActive: boolean;
    }>({
        docType: 'curriculo',
        grade: '',
        tags: '',
        priority: 3,
        isActive: true
    });

    useEffect(() => {
        loadDocs();
    }, []);

    const loadDocs = async () => {
        setLoading(true);
        const loaded = await repositorioBiblioteca.listDocs(userId);
        setDocs(loaded);
        setLoading(false);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setShowModal(true);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        try {
            await repositorioBiblioteca.addDoc(userId, selectedFile, {
                docType: metaForm.docType,
                grade: metaForm.grade,
                topicTags: metaForm.tags.split(',').map(s => s.trim()).filter(s => s),
                priority: metaForm.priority,
                isActive: metaForm.isActive,
                country: 'Perú' // Default
            });
            setShowModal(false);
            setSelectedFile(null);
            await loadDocs();
            alert('Documento subido correctamente.');
        } catch (e) {
            console.error(e);
            alert('Error al subir documento.');
        } finally {
            setUploading(false);
        }
    };

    const handleToggleActive = async (doc: LibraryDocMeta) => {
        await repositorioBiblioteca.updateDoc(userId, doc.id, { isActive: !doc.isActive });
        loadDocs();
    };

    const handleDelete = async (docId: string) => {
        if (window.confirm("¿Estás seguro de eliminar este documento?")) {
            await repositorioBiblioteca.removeDoc(userId, docId);
            loadDocs();
        }
    };

    const handleView = async (docId: string) => {
        const blob = await repositorioBiblioteca.getDocFile(docId);
        if (blob) {
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } else {
            alert("Error: no se pudo recuperar el archivo.");
        }
    };

    const handleApplyContext = async () => {
        await repositorioBiblioteca.buildLibraryContext(userId);
        alert("Listo: El tutor ahora usará estos materiales marcados como 'Activo' con prioridad.");
    };

    return (
        <BaseLayout titulo="Biblioteca del Tutor">
            <div style={estilos.contenedor}>
                <div style={estilos.header}>
                    <p>Sube currículos, libros o guías PDF para que el Tutor IA los use como referencia.</p>
                </div>

                {/* Upload Button */}
                <div style={estilos.uploadSection}>
                    <label style={estilos.uploadBtn}>
                        Subir PDF
                        <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={handleFileSelect} />
                    </label>
                </div>

                {/* List */}
                <div style={estilos.list}>
                    {loading ? <p>Cargando...</p> : docs.map(doc => (
                        <div key={doc.id} style={estilos.card}>
                            <div style={estilos.cardHeader}>
                                <span style={estilos.docIcon}>📄</span>
                                <div style={{ flex: 1 }}>
                                    <h4 style={estilos.docTitle}>{doc.title}</h4>
                                    <p style={estilos.docMeta}>
                                        {doc.docType.toUpperCase()} • {doc.grade} • Prio: {doc.priority}
                                    </p>
                                    <p style={estilos.docTags}>{doc.topicTags.join(', ')}</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '12px' }}>{doc.isActive ? 'Uso Activo' : 'Ignorado'}</span>
                                    <input
                                        type="checkbox"
                                        checked={doc.isActive}
                                        onChange={() => handleToggleActive(doc)}
                                    />
                                </div>
                            </div>
                            <div style={estilos.cardActions}>
                                <button onClick={() => handleView(doc.id)} style={estilos.linkBtn}>👁️ Ver</button>
                                <button onClick={() => handleDelete(doc.id)} style={{ ...estilos.linkBtn, color: '#dc3545' }}>🗑️</button>
                            </div>
                        </div>
                    ))}
                    {!loading && docs.length === 0 && <p style={{ textAlign: 'center', color: '#999' }}>No hay documentos.</p>}
                </div>

                <div style={estilos.footer}>
                    <button onClick={handleApplyContext} style={estilos.mainBtn}>
                        Aplicar y Actualizar Contexto
                    </button>
                    <button onClick={alVolver} style={estilos.secBtn}>Volver</button>
                </div>

                {/* Modal Simple */}
                {showModal && (
                    <div style={estilos.modalOverlay}>
                        <div style={estilos.modal}>
                            <h3>Nuevo Documento</h3>
                            <p style={{ fontSize: '13px', color: '#666' }}>{selectedFile?.name}</p>

                            <div style={estilos.field}>
                                <label>Tipo:</label>
                                <select
                                    value={metaForm.docType}
                                    onChange={(e) => setMetaForm({ ...metaForm, docType: e.target.value as any })}
                                    style={estilos.input}
                                >
                                    <option value="curriculo">Currículo</option>
                                    <option value="libro">Libro / Texto</option>
                                    <option value="guia">Guía de Ejercicios</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </div>

                            <div style={estilos.field}>
                                <label>Grado (ej. 1 Secundaria):</label>
                                <input
                                    value={metaForm.grade}
                                    onChange={(e) => setMetaForm({ ...metaForm, grade: e.target.value })}
                                    style={estilos.input}
                                />
                            </div>

                            <div style={estilos.field}>
                                <label>Temas (tags separados por coma):</label>
                                <input
                                    value={metaForm.tags}
                                    onChange={(e) => setMetaForm({ ...metaForm, tags: e.target.value })}
                                    placeholder="Ecuaciones, Álgebra, ..."
                                    style={estilos.input}
                                />
                            </div>

                            <div style={estilos.field}>
                                <label>Prioridad (1=Alta, 5=Baja):</label>
                                <input
                                    type="number" min="1" max="5"
                                    value={metaForm.priority}
                                    onChange={(e) => setMetaForm({ ...metaForm, priority: parseInt(e.target.value) })}
                                    style={estilos.input}
                                />
                            </div>

                            <div style={estilos.modalActions}>
                                <button onClick={handleUpload} style={estilos.uploadConfirmBtn} disabled={uploading}>
                                    {uploading ? 'Subiendo...' : 'Guardar'}
                                </button>
                                <button onClick={() => setShowModal(false)} style={estilos.secBtn}>Cancelar</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </BaseLayout>
    );
};

const estilos = {
    contenedor: { padding: '20px', maxWidth: '600px', margin: '0 auto', paddingBottom: '80px' },
    header: { marginBottom: '20px', color: '#666', fontSize: '14px', textAlign: 'center' as const },
    uploadSection: { textAlign: 'center' as const, marginBottom: '20px' },
    uploadBtn: { backgroundColor: '#007bff', color: 'white', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' as const },
    list: { display: 'flex', flexDirection: 'column' as const, gap: '10px' },
    card: { backgroundColor: 'white', borderRadius: '10px', padding: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
    cardHeader: { display: 'flex', gap: '10px', alignItems: 'flex-start' },
    docIcon: { fontSize: '24px' },
    docTitle: { margin: '0 0 4px 0', fontSize: '16px', color: '#333' },
    docMeta: { margin: 0, fontSize: '12px', color: '#888', textTransform: 'uppercase' as const },
    docTags: { margin: '4px 0 0 0', fontSize: '12px', color: '#007bff' },
    cardActions: { marginTop: '10px', display: 'flex', gap: '15px', justifyContent: 'flex-end' },
    linkBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#666', textDecoration: 'underline' },
    footer: { position: 'fixed' as const, bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: '15px', borderTop: '1px solid #eee', display: 'flex', gap: '10px', justifyContent: 'center' },
    mainBtn: { flex: 1, backgroundColor: '#28a745', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold' as const, maxWidth: '200px' },
    secBtn: { flex: 1, backgroundColor: '#f8f9fa', color: '#333', border: '1px solid #ddd', padding: '12px', borderRadius: '8px', maxWidth: '100px' },
    // Modal
    modalOverlay: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', width: '90%', maxWidth: '400px' },
    field: { marginBottom: '15px' },
    input: { width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' },
    modalActions: { display: 'flex', gap: '10px', marginTop: '20px' },
    uploadConfirmBtn: { flex: 1, backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold' as const }
};

export default PadreBibliotecaTutorScreen;
