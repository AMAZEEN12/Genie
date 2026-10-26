import { apiRequest } from './client';
import type { components } from './schema';

export type LoginRequest = components['schemas']['LoginRequest'];
export type Session = components['schemas']['Session'];
export type User = components['schemas']['User'];
export type Role = components['schemas']['Role'];

export const DEMO_USERS = [
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

export async function loginApi(credentials: LoginRequest, signal?: AbortSignal): Promise<Session> {
  return apiRequest<Session>('/auth/sessions', {
    method: 'POST',
    body: credentials,
    signal,
  });
}

export async function getCurrentUser(token?: string, signal?: AbortSignal): Promise<User> {
  return apiRequest<User>('/me', {
    method: 'GET',
    token,
    signal,
  });
}

