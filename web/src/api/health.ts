/**
 * Backward compatibility re-export wrapper.
 * Canonical health API and hooks now live in src/service/api/health.api and src/hooks/useHealth.
 */
export * from '../service/api/health.api';
export * from '../hooks/useHealth';
export type { HealthResponse as Health } from '../service/models/health.models';
