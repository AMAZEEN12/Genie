import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  assignTechnician,
  createRequest,
  getRequest,
  getRequestHistory,
  listRequests,
  reviewOverride,
} from '../service/api/requests.api';
import type {
  AssignTechnicianRequest,
  AssignTechnicianResponse,
  CreateMaintenanceRequest,
  CreateMaintenanceResponse,
  GetRequestDetailResponse,
  ListRequestsResponse,
  OverrideReviewResponse,
  RequestFilterParams,
} from '../service/models/request.models';
import type { GetHistoryResponse, OverrideReviewRequest } from '../service/models/transition.models';

export const requestKeys = {
  all: ['requests'] as const,
  list: (params?: RequestFilterParams) => ['requests', 'list', params] as const,
  detail: (id: string) => ['requests', 'detail', id] as const,
  history: (id: string) => ['requests', 'history', id] as const,
};

export function useRequestsQuery(params?: RequestFilterParams) {
  return useQuery<ListRequestsResponse>({
    queryKey: requestKeys.list(params),
    queryFn: ({ signal }) => listRequests(params, signal),
  });
}

export function useRequestDetailQuery(id: string, options?: { enabled?: boolean }) {
  return useQuery<GetRequestDetailResponse>({
    queryKey: requestKeys.detail(id),
    queryFn: ({ signal }) => getRequest(id, signal),
    enabled: options?.enabled !== undefined ? options.enabled : Boolean(id),
  });
}

export function useRequestHistoryQuery(id: string, options?: { enabled?: boolean }) {
  return useQuery<GetHistoryResponse>({
    queryKey: requestKeys.history(id),
    queryFn: ({ signal }) => getRequestHistory(id, signal),
    enabled: options?.enabled !== undefined ? options.enabled : Boolean(id),
  });
}

export interface CreateRequestMutationVariables {
  data: CreateMaintenanceRequest;
  idempotencyKey?: string;
}

export function useCreateRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation<CreateMaintenanceResponse, Error, CreateRequestMutationVariables>({
    mutationFn: ({ data, idempotencyKey = crypto.randomUUID() }) => createRequest(data, idempotencyKey),
    onSuccess: (newRequest) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.all });
      queryClient.setQueryData(requestKeys.detail(newRequest.id), newRequest);
    },
  });
}

export function useAssignTechnicianMutation(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation<AssignTechnicianResponse, Error, AssignTechnicianRequest>({
    mutationFn: (body) => assignTechnician(requestId, body),
    onSuccess: (updated) => {
      queryClient.setQueryData(requestKeys.detail(requestId), updated);
      queryClient.invalidateQueries({ queryKey: requestKeys.list() });
      queryClient.invalidateQueries({ queryKey: requestKeys.history(requestId) });
    },
  });
}

export function useReviewOverrideMutation(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation<OverrideReviewResponse, Error, OverrideReviewRequest>({
    mutationFn: (body) => reviewOverride(requestId, body),
    onSuccess: (updated) => {
      queryClient.setQueryData(requestKeys.detail(requestId), updated);
      queryClient.invalidateQueries({ queryKey: requestKeys.list() });
      queryClient.invalidateQueries({ queryKey: requestKeys.history(requestId) });
    },
  });
}
