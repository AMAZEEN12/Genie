import { apiRequest } from '../httpclient';
import { ENDPOINTS } from '../endpoints';
import type {
  CurrentUserResponse,
  DemoUserCredentials,
  LoginRequest,
  LoginResponse,
  Role,
} from '../models/auth.models';

export const DEMO_USERS: readonly DemoUserCredentials[] = [
  { roleName: 'Employee', email: 'employee@genie.test', password: 'Genie-Demo-2026' },
  { roleName: 'Manager', email: 'manager@genie.test', password: 'Genie-Demo-2026' },
  { roleName: 'Technician', email: 'technician@genie.test', password: 'Genie-Demo-2026' },
  { roleName: 'Finance', email: 'finance@genie.test', password: 'Genie-Demo-2026' },
] as const;

/** Role-based landing paths per DM14. */
export function getRoleHomePath(role: Role): string {
  switch (role) {
    case 'EMPLOYEE':
      return '/requests/new';
    case 'MANAGER':
      return '/requests';
    case 'TECHNICIAN':
      return '/my-jobs';
    case 'FINANCE':
      return '/approvals';
  }
}

/**
 * POST /auth/sessions - authenticates with email/password and returns a bearer token session.
 */
export async function login(credentials: LoginRequest, signal?: AbortSignal): Promise<LoginResponse> {
  return apiRequest<LoginResponse>(ENDPOINTS.AUTH.SESSIONS, {
    method: 'POST',
    body: credentials,
    signal,
  });
}

/**
 * Backward-compatible alias for login.
 */
export const loginApi = login;

/**
 * GET /me - returns current user identity from active bearer token.
 */
export async function getCurrentUser(token?: string, signal?: AbortSignal): Promise<CurrentUserResponse> {
  return apiRequest<CurrentUserResponse>(ENDPOINTS.AUTH.ME, {
    method: 'GET',
    token,
    signal,
  });
}
