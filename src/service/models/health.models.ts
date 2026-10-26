export interface HealthResponse {
  status: 'UP' | 'DEGRADED';
  database?: 'UP' | 'DOWN';
  checkedAt?: string;
}
