import { apiRequest } from '../httpclient';
import { ENDPOINTS } from '../endpoints';
import type { HealthResponse } from '../models/health.models';

/**
 * GET /health - service and database readiness probe.
 */
export async function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  return apiRequest<HealthResponse>(ENDPOINTS.HEALTH, {
    method: 'GET',
    signal,
  });
}
