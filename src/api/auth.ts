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

/** Canonical profiles for mock/demo logins matching R__seed_demo.sql */
export const DEMO_USER_PROFILES: Record<string, User> = {
  'employee@genie.test': {
    id: '20f89bc1-9ac5-5637-8cf7-90d23a80f420',
    email: 'employee@genie.test',
    displayName: 'Amina Bello (Employee)',
    role: 'EMPLOYEE',
  },
  'manager@genie.test': {
    id: '0c66451e-efb9-5662-b386-d98005f7a504',
    email: 'manager@genie.test',
    displayName: 'Chioma Nwosu (Operations Manager)',
    role: 'MANAGER',
  },
  'technician@genie.test': {
    id: '01a755a8-ed55-52eb-be2c-6851900a07e3',
    email: 'technician@genie.test',
    displayName: 'Emeka Obi (Lead Technician)',
    role: 'TECHNICIAN',
  },
  'technician2@genie.test': {
    id: '8ee1fe13-dc91-5486-93f1-a95e68809973',
    email: 'technician2@genie.test',
    displayName: 'Fatima Aliyu (HVAC Specialist)',
    role: 'TECHNICIAN',
  },
  'finance@genie.test': {
    id: '3b5c8178-a7ad-57c3-856c-39835fbbd27c',
    email: 'finance@genie.test',
    displayName: 'Babajide Adeleke (Finance Officer)',
    role: 'FINANCE',
  },
};

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

  const emailLower = credentials.email.trim().toLowerCase();
  const demoProfile = DEMO_USER_PROFILES[emailLower];
  const isMockResponse =
    session.user.email === 'string' ||
    session.user.displayName === 'string' ||
    session.user.id === 'string' ||
    session.user.id === '497f6eca-6276-4993-bfeb-53cbbbba6f08';

  let user: User;
  if (isMockResponse && demoProfile) {
    user = demoProfile;
  } else {
    const emailRole = getRoleFromEmail(credentials.email);
    const role = (isMockResponse && emailRole) ? emailRole : (session.user.role || emailRole || 'EMPLOYEE');
    const email = (session.user.email === 'string' || !session.user.email) ? credentials.email : session.user.email;
    const id = (session.user.id === 'string' || !session.user.id) ? (demoProfile?.id || crypto.randomUUID()) : session.user.id;
    let displayName = session.user.displayName;
    if (!displayName || displayName === 'string') {
      displayName = demoProfile?.displayName || 'Genie User';
    }
    user = { id, email, role, displayName };
  }

  return {
    ...session,
    user,
  };
}

export async function getCurrentUser(token?: string, signal?: AbortSignal): Promise<User> {
  return apiRequest<User>('/me', {
    method: 'GET',
    token,
    signal,
  });
}
