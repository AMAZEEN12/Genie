import type { Role, UserModel } from './auth.models';

export interface CreateUserRequest {
  email: string;
  displayName: string;
  role: Role;
  password?: string;
}

export type CreateUserResponse = UserModel;
export type ListUsersResponse = UserModel[];
