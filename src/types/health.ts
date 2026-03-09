export type HealthStatus = 'ok' | 'warn' | 'fail';

export type HealthCategory = 'INFRASTRUCTURE' | 'SERVICES' | 'TUTOR FLOW';

export interface HealthCheckItem {
  id: string;
  category: HealthCategory;
  label: string;
  status: HealthStatus;
  message: string;
  latencyMs?: number;
  checkedAt: string;
}

export interface HealthReport {
  timestamp: string;
  checks: HealthCheckItem[];
}
