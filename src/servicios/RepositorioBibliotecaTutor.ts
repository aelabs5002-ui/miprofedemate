import { LibraryDocMeta, LibraryContext, LibraryDocType } from '../tipos/bibliotecaTutor.ts';

class RepositorioBibliotecaTutor {
    private DB_NAME = 'TutorLibraryDB';
    private STORE_NAME = 'files';
    private KEY_META_PREFIX = 'biblioteca_meta_';
    private KEY_CONTEXT_PREFIX = 'biblioteca_context_';

    private dbPromise: Promise<IDBDatabase> | null = null;

    constructor() {
        this.initDB();
    }

    private initDB() {
        this.dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, 1);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME); // Key will be docId
                }
            };

            request.onsuccess = (event) => {
                resolve((event.target as IDBOpenDBRequest).result);
            };

            request.onerror = (event) => {
                console.error('IndexedDB error:', event);
                reject('Error opening IndexedDB');
            };
        });
    }

    private async getDB(): Promise<IDBDatabase> {
        if (!this.dbPromise) {
            this.initDB();
        }
        return this.dbPromise!;
    }

    // --- Metadata Methods ---

    async listDocs(studentId: string): Promise<LibraryDocMeta[]> {
        const key = `${this.KEY_META_PREFIX}${studentId}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    private saveMeta(studentId: string, docs: LibraryDocMeta[]) {
        const key = `${this.KEY_META_PREFIX}${studentId}`;
        localStorage.setItem(key, JSON.stringify(docs));
    }

    // --- File Methods (IndexedDB) ---

    async addDoc(studentId: string, file: File, metaPartial: Partial<LibraryDocMeta>): Promise<LibraryDocMeta> {
        const docId = crypto.randomUUID();

        // 1. Create Meta
        const meta: LibraryDocMeta = {
            id: docId,
            studentId,
            title: metaPartial.title || file.name,
            filename: file.name,
            mimeType: file.type,
            sizeBytes: file.size,
            uploadedAt: new Date().toISOString(),
            docType: metaPartial.docType || "otro",
            country: metaPartial.country || "Perú",
            grade: metaPartial.grade || "",
            topicTags: metaPartial.topicTags || [],
            priority: metaPartial.priority || 3,
            isActive: metaPartial.isActive ?? true
        };

        // 2. Save File Blob to IndexedDB
        const db = await this.getDB();
        const tx = db.transaction(this.STORE_NAME, 'readwrite');
        const store = tx.objectStore(this.STORE_NAME);

        await new Promise<void>((resolve, reject) => {
            const req = store.put(file, docId);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });

        // 3. Save Metadata to LocalStorage
        const docs = await this.listDocs(studentId);
        docs.push(meta);
        this.saveMeta(studentId, docs);

        return meta;
    }

    async updateDoc(studentId: string, docId: string, patch: Partial<LibraryDocMeta>): Promise<void> {
        const docs = await this.listDocs(studentId);
        const index = docs.findIndex(d => d.id === docId);
        if (index !== -1) {
            docs[index] = { ...docs[index], ...patch };
            this.saveMeta(studentId, docs);
        }
    }

    async removeDoc(studentId: string, docId: string): Promise<void> {
        // 1. Remove from Metadata
        const docs = await this.listDocs(studentId);
        const newDocs = docs.filter(d => d.id !== docId);
        this.saveMeta(studentId, newDocs);

        // 2. Remove from IndexedDB
        const db = await this.getDB();
        const tx = db.transaction(this.STORE_NAME, 'readwrite');
        const store = tx.objectStore(this.STORE_NAME);
        store.delete(docId);
    }

    async getDocFile(docId: string): Promise<Blob | null> {
        const db = await this.getDB();
        const tx = db.transaction(this.STORE_NAME, 'readonly');
        const store = tx.objectStore(this.STORE_NAME);

        return new Promise<Blob | null>((resolve, reject) => {
            const req = store.get(docId);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => reject(req.error);
        });
    }

    // --- Context Building ---

    async buildLibraryContext(studentId: string): Promise<LibraryContext> {
        return this.buildLibraryContextForTopic(studentId);
    }

    async buildLibraryContextForTopic(studentId: string, topic?: string, grade?: string): Promise<LibraryContext> {
        const docs = await this.listDocs(studentId);

        // Filter Active
        let active = docs.filter(d => d.isActive);

        // If topic is provided, prioritize docs with matching tags (this is a simplified logic)
        // Actually, user standard requirement is: sort by priority asc. 
        // If topic present, maybe we filter? Re-reading specs: "priorityRule: PARENT_LIBRARY_FIRST"
        // "si topic se entrega, priorizar docs que contienen ese topic en topicTags" -> Sort logic

        if (topic) {
            active.sort((a, b) => {
                const aHas = a.topicTags.some(t => topic.toLowerCase().includes(t.toLowerCase()));
                const bHas = b.topicTags.some(t => topic.toLowerCase().includes(t.toLowerCase()));
                if (aHas && !bHas) return -1;
                if (!aHas && bHas) return 1;
                return a.priority - b.priority;
            });
        } else {
            active.sort((a, b) => a.priority - b.priority);
        }

        const context: LibraryContext = {
            studentId,
            generatedAt: new Date().toISOString(),
            activeDocs: active.map(d => ({
                id: d.id,
                title: d.title,
                docType: d.docType,
                country: d.country,
                grade: d.grade,
                topicTags: d.topicTags,
                priority: d.priority
            })),
            priorityRule: "PARENT_LIBRARY_FIRST",
            note: active.length > 0
                ? "Usar primero estos materiales definidos por el padre/tutor."
                : "No hay materiales activos en la biblioteca del tutor."
        };

        // Save context to localStorage for easy access by other services synchronously if needed
        localStorage.setItem(`${this.KEY_CONTEXT_PREFIX}${studentId}`, JSON.stringify(context));

        return context;
    }
}

export const repositorioBiblioteca = new RepositorioBibliotecaTutor();
