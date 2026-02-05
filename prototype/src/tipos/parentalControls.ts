export interface ParentalControls {
    enabled: boolean;                 // true por defecto
    dailyMinutesLimit: number;        // ej. 20
    allowedDays: number[];            // 0-6 (Dom-Sab). Default: [1,2,3,4,5,6,0] (todos)
    voiceAllowed: boolean;            // default true
    maxHintsPerStepOverride?: number; // optional (si existe, reemplaza helpPolicy)
}

export interface DailyUsage {
    minutesUsed: number;
    lastUpdated: number; // timestamp
}
