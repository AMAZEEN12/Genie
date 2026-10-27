import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applyTransition } from '../service/api/transitions.api';
import type { TransitionRequest } from '../service/models/transition.models';
import type { TransitionResponse } from '../service/models/request.models';
import { requestKeys } from './useRequests';

export function useApplyTransitionMutation(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation<TransitionResponse, Error, TransitionRequest>({
    mutationFn: (body) => applyTransition(requestId, body),
    onSuccess: (updated) => {
      queryClient.setQueryData(requestKeys.detail(requestId), updated);
      queryClient.invalidateQueries({ queryKey: requestKeys.list() });
      queryClient.invalidateQueries({ queryKey: requestKeys.history(requestId) });
    },
  });
}
