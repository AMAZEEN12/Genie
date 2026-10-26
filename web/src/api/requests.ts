import { apiRequest } from './client';
import type { components } from './schema';

export type RequestSummary = components['schemas']['RequestSummary'];
export type RequestDetail = components['schemas']['RequestDetail'];
export type CreateRequest = components['schemas']['CreateRequest'];
export type Priority = components['schemas']['Priority'];
export type RequestStatus = components['schemas']['RequestStatus'];
export type User = components['schemas']['User'];
export type Estimate = components['schemas']['Estimate'];
export type StatusHistoryEntry = components['schemas']['StatusHistoryEntry'];
export type AssignRequest = components['schemas']['AssignRequest'];
export type CreateEstimateRequest = components['schemas']['CreateEstimateRequest'];
export type EstimateDecisionRequest = components['schemas']['EstimateDecisionRequest'];
export type TransitionRequest = components['schemas']['TransitionRequest'];
export type OverrideReviewRequest = components['schemas']['OverrideReviewRequest'];

export interface ListRequestsFilter {
  status?: RequestStatus;
  category?: string;
  priority?: Priority;
  technicianId?: string;
  override?: boolean;
}

/** Submit a new fault request (POST /requests) with Idempotency-Key */
export async function createRequestApi(
  payload: CreateRequest,
  idempotencyKey = crypto.randomUUID(),
  signal?: AbortSignal,
): Promise<RequestDetail> {
  return apiRequest<RequestDetail>('/requests', {
    method: 'POST',
    body: payload,
    idempotencyKey,
    signal,
  });
}

/** Search and filter maintenance requests (GET /requests) */
export async function listRequestsApi(
  filters: ListRequestsFilter = {},
  signal?: AbortSignal,
): Promise<RequestSummary[]> {
  const searchParams = new URLSearchParams();
  if (filters.status) searchParams.set('status', filters.status);
  if (filters.category) searchParams.set('category', filters.category);
  if (filters.priority) searchParams.set('priority', filters.priority);
  if (filters.technicianId) searchParams.set('technicianId', filters.technicianId);
  if (filters.override !== undefined) searchParams.set('override', String(filters.override));

  const query = searchParams.toString();
  const path = query ? `/requests?${query}` : '/requests';
  return apiRequest<RequestSummary[]>(path, { method: 'GET', signal });
}

/** Retrieve full request details with estimates and history (GET /requests/{id}) */
export async function getRequestApi(id: string, signal?: AbortSignal): Promise<RequestDetail> {
  return apiRequest<RequestDetail>(`/requests/${id}`, { method: 'GET', signal });
}

/** Assign a technician and deadline (PUT /requests/{id}/assignment) */
export async function assignTechnicianApi(
  id: string,
  payload: AssignRequest,
  signal?: AbortSignal,
): Promise<RequestDetail> {
  return apiRequest<RequestDetail>(`/requests/${id}/assignment`, {
    method: 'PUT',
    body: payload,
    signal,
  });
}

/** Submit a cost estimate in integer kobo (POST /requests/{id}/estimates) */
export async function createEstimateApi(
  requestId: string,
  payload: CreateEstimateRequest,
  signal?: AbortSignal,
): Promise<Estimate> {
  return apiRequest<Estimate>(`/requests/${requestId}/estimates`, {
    method: 'POST',
    body: payload,
    signal,
  });
}

/** Decide an estimate - APPROVE or REJECT (PUT /estimates/{id}/decision) */
export async function decideEstimateApi(
  estimateId: string,
  payload: EstimateDecisionRequest,
  signal?: AbortSignal,
): Promise<Estimate> {
  return apiRequest<Estimate>(`/estimates/${estimateId}/decision`, {
    method: 'PUT',
    body: payload,
    signal,
  });
}

/** Apply a status transition (POST /requests/{id}/transitions) */
export async function applyTransitionApi(
  id: string,
  payload: TransitionRequest,
  signal?: AbortSignal,
): Promise<RequestDetail> {
  return apiRequest<RequestDetail>(`/requests/${id}/transitions`, {
    method: 'POST',
    body: payload,
    signal,
  });
}

/** Review an urgent override - ACCEPTED or FLAGGED (PUT /requests/{id}/override-review) */
export async function reviewOverrideApi(
  id: string,
  payload: OverrideReviewRequest,
  signal?: AbortSignal,
): Promise<RequestDetail> {
  return apiRequest<RequestDetail>(`/requests/${id}/override-review`, {
    method: 'PUT',
    body: payload,
    signal,
  });
}

/** Retrieve the append-only status change audit history (GET /requests/{id}/history) */
export async function getRequestHistoryApi(
  id: string,
  signal?: AbortSignal,
): Promise<StatusHistoryEntry[]> {
  return apiRequest<StatusHistoryEntry[]>(`/requests/${id}/history`, {
    method: 'GET',
    signal,
  });
}

/** List available technicians for assignment (GET /users?role=TECHNICIAN) */
export async function listTechniciansApi(signal?: AbortSignal): Promise<User[]> {
  return apiRequest<User[]>('/users?role=TECHNICIAN', {
    method: 'GET',
    signal,
  });
}

/** Format kobo integer to Nigerian Naira string (e.g. 150000 kobo -> ₦1,500.00) */
export function formatKoboToNaira(kobo?: number | null): string {
  if (kobo === undefined || kobo === null) return '₦0.00';
  const naira = kobo / 100;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(naira)
    .replace('NGN', '₦');
}
