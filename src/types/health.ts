export type HealthStatus = 'ok' | 'warn' | 'fail';

export interface HealthCheckItem {
  id: string;
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
