import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '../service/httpclient';

/** DM7: TanStack Query holds all server data. UI state stays in React state or URL params. */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // Retrying a 4xx can't help; retry network errors and 5xx once.
        retry: (failureCount, error) =>
          failureCount < 1 && (!(error instanceof ApiError) || error.problem.status === 0 || error.problem.status >= 500),
      },
      mutations: { retry: false },
    },
  });
}
