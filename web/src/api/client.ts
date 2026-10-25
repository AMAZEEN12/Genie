/**
 * The one HTTP client for the Genie service. Every request carries an X-Request-Id, and every
 * error response (application/problem+json, RFC 9457) becomes an ApiError the screens can act on.
 */

export interface Problem {
  type?: string;
  title?: string;
  status: number;
  detail?: string;
  code?: string;
  requestId?: string;
  errors?: { field: string; message: string }[];
}

export class ApiError extends Error {
  readonly problem: Problem;

  constructor(problem: Problem) {
    super(problem.detail ?? problem.title ?? `Request failed with status ${problem.status}`);
    this.name = 'ApiError';
    this.problem = problem;
  }
}

export const TOKEN_STORAGE_KEY = 'genie_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors (e.g. private browsing restrictions)
  }
}

export const apiBaseUrl: string = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://127.0.0.1:4711';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string;
  /** Required by POST /requests (R3); generate once per attempt and reuse it on retry. */
  idempotencyKey?: string;
  signal?: AbortSignal;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json', 'X-Request-Id': crypto.randomUUID() };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';

  const token = options.token ?? getStoredToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.idempotencyKey) headers['Idempotency-Key'] = options.idempotencyKey;

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause;
    throw new ApiError({ status: 0, title: 'Network error', detail: 'The service could not be reached.' });
  }

  if (!response.ok) {
    let problem: Problem = { status: response.status, title: response.statusText };
    try {
      problem = { ...problem, ...((await response.json()) as Partial<Problem>), status: response.status };
    } catch {
      // Not JSON: keep the status line.
    }
    throw new ApiError(problem);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
