import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createUser, listUsers } from '../service/api/users.api';
import type { Role } from '../service/models/auth.models';
import type { CreateUserRequest, CreateUserResponse, ListUsersResponse } from '../service/models/user.models';

export const userKeys = {
  all: ['users'] as const,
  list: (role?: Role) => ['users', 'list', role] as const,
};

export function useUsersQuery(role?: Role) {
  return useQuery<ListUsersResponse>({
    queryKey: userKeys.list(role),
    queryFn: ({ signal }) => listUsers(role, signal),
  });
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation<CreateUserResponse, Error, CreateUserRequest>({
    mutationFn: (body) => createUser(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
