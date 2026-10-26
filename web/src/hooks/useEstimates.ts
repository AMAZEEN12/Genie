import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEstimate, decideEstimate } from '../service/api/estimates.api';
import type {
  CreateEstimateRequest,
  CreateEstimateResponse,
  EstimateDecisionRequest,
  EstimateDecisionResponse,
} from '../service/models/estimate.models';
import { requestKeys } from './useRequests';

export function useCreateEstimateMutation(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation<CreateEstimateResponse, Error, CreateEstimateRequest>({
    mutationFn: (body) => createEstimate(requestId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(requestId) });
      queryClient.invalidateQueries({ queryKey: requestKeys.history(requestId) });
    },
  });
}

export interface EstimateDecisionVariables {
  estimateId: string;
  requestId?: string;
  body: EstimateDecisionRequest;
}

export function useEstimateDecisionMutation() {
  const queryClient = useQueryClient();

  return useMutation<EstimateDecisionResponse, Error, EstimateDecisionVariables>({
    mutationFn: ({ estimateId, body }) => decideEstimate(estimateId, body),
    onSuccess: (_data, variables) => {
      if (variables.requestId) {
        queryClient.invalidateQueries({ queryKey: requestKeys.detail(variables.requestId) });
        queryClient.invalidateQueries({ queryKey: requestKeys.history(variables.requestId) });
      }
      queryClient.invalidateQueries({ queryKey: requestKeys.all });
    },
  });
}
