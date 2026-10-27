export type Role = 'EMPLOYEE' | 'MANAGER' | 'TECHNICIAN' | 'FINANCE';

export interface UserModel {
  id: string;
  email: string;
  displayName: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SessionModel {
  token: string;
  expiresAt: string;
  user: UserModel;
}

export type LoginResponse = SessionModel;
export type CurrentUserResponse = UserModel;

export interface DemoUserCredentials {
  roleName: string;
  email: string;
  password: string;
}
