import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, login } from '../service/api/auth.api';
import { setStoredToken } from '../service/httpclient';
import type { CurrentUserResponse, LoginRequest, LoginResponse } from '../service/models/auth.models';
export { useAuth } from '../app/authContext';

export const authKeys = {
  currentUser: ['currentUser'] as const,
};

export function useCurrentUserQuery(token?: string, options?: { enabled?: boolean }) {
  return useQuery<CurrentUserResponse>({
    queryKey: authKeys.currentUser,
    queryFn: ({ signal }) => getCurrentUser(token, signal),
    enabled: options?.enabled,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: (credentials: LoginRequest) => login(credentials),
    onSuccess: (data) => {
      setStoredToken(data.token);
      queryClient.setQueryData(authKeys.currentUser, data.user);
    },
  });
}
