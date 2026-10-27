import { apiRequest } from '../httpclient';
import { ENDPOINTS } from '../endpoints';
import type {
  CreateEstimateRequest,
  CreateEstimateResponse,
  EstimateDecisionRequest,
  EstimateDecisionResponse,
} from '../models/estimate.models';

/**
 * POST /requests/{requestId}/estimates - submit an initial or revised repair estimate.
 */
export async function createEstimate(
  requestId: string,
  body: CreateEstimateRequest,
  signal?: AbortSignal,
): Promise<CreateEstimateResponse> {
  return apiRequest<CreateEstimateResponse>(ENDPOINTS.ESTIMATES.CREATE(requestId), {
    method: 'POST',
    body,
    signal,
  });
}

/**
 * PUT /estimates/{estimateId}/decision - approve or reject an estimate (Manager or Finance).
 */
export async function decideEstimate(
  estimateId: string,
  body: EstimateDecisionRequest,
  signal?: AbortSignal,
): Promise<EstimateDecisionResponse> {
  return apiRequest<EstimateDecisionResponse>(ENDPOINTS.ESTIMATES.DECISION(estimateId), {
    method: 'PUT',
    body,
    signal,
  });
}
