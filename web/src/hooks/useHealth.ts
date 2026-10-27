import { useQuery } from '@tanstack/react-query';
import { getHealth } from '../service/api/health.api';
import type { HealthResponse } from '../service/models/health.models';

export const healthKeys = {
  health: ['health'] as const,
};

/**
 * Backward-compatible query key matching scaffold.
 */
export const healthKey = healthKeys.health;

export function useHealthQuery() {
  return useQuery<HealthResponse>({
    queryKey: healthKeys.health,
    queryFn: ({ signal }) => getHealth(signal),
  });
}

/**
 * Backward-compatible alias matching previous useHealth() hook.
 */
export const useHealth = useHealthQuery;
