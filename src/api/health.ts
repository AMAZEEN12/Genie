import { useQuery } from '@tanstack/react-query';
import { apiRequest } from './client';

/** GET /health. Replace with the generated contract type once contract/openapi.yaml exists. */
export interface Health {
  status: 'UP' | 'DEGRADED';
  database?: 'UP' | 'DOWN';
  checkedAt?: string;
}

export const healthKey = ['health'] as const;

export function useHealth() {
  return useQuery({
    queryKey: healthKey,
    queryFn: ({ signal }) => apiRequest<Health>('/health', { signal }),
  });
}
