export type LibraryDocType = "curriculo" | "libro" | "guia" | "otro";

export interface LibraryDocMeta {
    id: string;
    studentId: string;
    title: string;
    filename: string;
    mimeType: string;
    sizeBytes: number;
    uploadedAt: string; // ISO
    docType: LibraryDocType;
    country?: string;   // "Perú" default
    grade?: string;     // "1 secundaria", etc
    topicTags: string[]; // ["Ecuaciones", "Fracciones"]
    priority: number;   // 1..5 (1 = más importante)
    isActive: boolean;  // si se usa como referencia
}

export interface LibraryContext {
    studentId: string;
    generatedAt: string;
    activeDocs: Array<Pick<LibraryDocMeta, "id" | "title" | "docType" | "country" | "grade" | "topicTags" | "priority">>;
    priorityRule: "PARENT_LIBRARY_FIRST";
    note: string; // breve: “Usar primero estos materiales…”
}
