import { apiRequest } from '../httpclient';
import { ENDPOINTS } from '../endpoints';
import type { Role } from '../models/auth.models';
import type { CreateUserRequest, CreateUserResponse, ListUsersResponse } from '../models/user.models';

/**
 * GET /users - list system users, optionally filtered by role (e.g. TECHNICIAN for assignment dropdown).
 */
export async function listUsers(role?: Role, signal?: AbortSignal): Promise<ListUsersResponse> {
  const query = role ? `?role=${encodeURIComponent(role)}` : '';
  return apiRequest<ListUsersResponse>(`${ENDPOINTS.USERS.LIST}${query}`, {
    method: 'GET',
    signal,
  });
}

/**
 * POST /users - provision a new user (manager-only).
 */
export async function createUser(body: CreateUserRequest, signal?: AbortSignal): Promise<CreateUserResponse> {
  return apiRequest<CreateUserResponse>(ENDPOINTS.USERS.CREATE, {
    method: 'POST',
    body,
    signal,
  });
}
