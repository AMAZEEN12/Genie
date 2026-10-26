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

/** Derive role from email for demo/mock logins if the backend returns a mock/default role */
export function getRoleFromEmail(email: string): Role | null {
  const lower = email.trim().toLowerCase();
  if (lower.includes('manager')) return 'MANAGER';
  if (lower.includes('technician') || lower.includes('tech')) return 'TECHNICIAN';
  if (lower.includes('finance')) return 'FINANCE';
  if (lower.includes('employee')) return 'EMPLOYEE';
  return null;
}

export async function loginApi(credentials: LoginRequest, signal?: AbortSignal): Promise<Session> {
  const session = await apiRequest<Session>('/auth/sessions', {
    method: 'POST',
    body: credentials,
    signal,
  });

  const emailRole = getRoleFromEmail(credentials.email);
  const isMockResponse = session.user.email === 'string' || session.user.displayName === 'string';
  const role = (isMockResponse && emailRole) ? emailRole : (session.user.role || emailRole || 'EMPLOYEE');

  let displayName = session.user.displayName;
  if (!displayName || displayName === 'string') {
    if (role === 'MANAGER') displayName = 'Chioma Nwosu (Operations Manager)';
    else if (role === 'TECHNICIAN') displayName = 'Babatunde Adeleke (Senior HVAC Tech)';
    else if (role === 'FINANCE') displayName = 'Folasade Adegoke (Finance Lead)';
    else displayName = 'Amina Bello (Employee)';
  }

  const email = (session.user.email === 'string' || !session.user.email) ? credentials.email : session.user.email;

  return {
    ...session,
    user: {
      ...session.user,
      email,
      role,
      displayName,
    },
  };
}

export async function getCurrentUser(token?: string, signal?: AbortSignal): Promise<User> {
  return apiRequest<User>('/me', {
    method: 'GET',
    token,
    signal,
  });
}
