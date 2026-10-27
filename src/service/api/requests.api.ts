import { apiRequest } from '../httpclient';
import { ENDPOINTS } from '../endpoints';
import type {
  AssignTechnicianRequest,
  AssignTechnicianResponse,
  CreateMaintenanceRequest,
  CreateMaintenanceResponse,
  GetRequestDetailResponse,
  ListRequestsResponse,
  OverrideReviewResponse,
  RequestFilterParams,
} from '../models/request.models';
import type { GetHistoryResponse, OverrideReviewRequest } from '../models/transition.models';

function buildQueryString(params?: RequestFilterParams): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.set('status', params.status);
  if (params.category) searchParams.set('category', params.category);
  if (params.priority) searchParams.set('priority', params.priority);
  if (params.technicianId) searchParams.set('technicianId', params.technicianId);
  if (params.override !== undefined) searchParams.set('override', String(params.override));
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

/**
 * GET /requests - list maintenance requests with optional filtering.
 */
export async function listRequests(
  params?: RequestFilterParams,
  signal?: AbortSignal,
): Promise<ListRequestsResponse> {
  const qs = buildQueryString(params);
  return apiRequest<ListRequestsResponse>(`${ENDPOINTS.REQUESTS.LIST}${qs}`, {
    method: 'GET',
    signal,
  });
}

/**
 * POST /requests - report a new maintenance request. Requires Idempotency-Key.
 */
export async function createRequest(
  data: CreateMaintenanceRequest,
  idempotencyKey: string,
  signal?: AbortSignal,
): Promise<CreateMaintenanceResponse> {
  return apiRequest<CreateMaintenanceResponse>(ENDPOINTS.REQUESTS.CREATE, {
    method: 'POST',
    body: data,
    idempotencyKey,
    signal,
  });
}

/**
 * GET /requests/{id} - fetch full request detail including history and estimates.
 */
export async function getRequest(id: string, signal?: AbortSignal): Promise<GetRequestDetailResponse> {
  return apiRequest<GetRequestDetailResponse>(ENDPOINTS.REQUESTS.DETAIL(id), {
    method: 'GET',
    signal,
  });
}

/**
 * PUT /requests/{id}/assignment - assign a technician with target completion deadline and version check.
 */
export async function assignTechnician(
  id: string,
  body: AssignTechnicianRequest,
  signal?: AbortSignal,
): Promise<AssignTechnicianResponse> {
  return apiRequest<AssignTechnicianResponse>(ENDPOINTS.REQUESTS.ASSIGNMENT(id), {
    method: 'PUT',
    body,
    signal,
  });
}

/**
 * GET /requests/{id}/history - retrieve status transition audit trail.
 */
export async function getRequestHistory(id: string, signal?: AbortSignal): Promise<GetHistoryResponse> {
  return apiRequest<GetHistoryResponse>(ENDPOINTS.REQUESTS.HISTORY(id), {
    method: 'GET',
    signal,
  });
}

/**
 * PUT /requests/{id}/override-review - finance review for emergency work started under urgent override.
 */
export async function reviewOverride(
  id: string,
  body: OverrideReviewRequest,
  signal?: AbortSignal,
): Promise<OverrideReviewResponse> {
  return apiRequest<OverrideReviewResponse>(ENDPOINTS.REQUESTS.OVERRIDE_REVIEW(id), {
    method: 'PUT',
    body,
    signal,
  });
}
