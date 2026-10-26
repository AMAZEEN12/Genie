import { apiRequest } from '../httpclient';
import { ENDPOINTS } from '../endpoints';
import type { TransitionRequest } from '../models/transition.models';
import type { TransitionResponse } from '../models/request.models';

/**
 * POST /requests/{requestId}/transitions - advance a request through its lifecycle:
 * - START (ASSIGNED -> IN_PROGRESS)
 * - OVERRIDE_START (ASSIGNED -> IN_PROGRESS emergency override with reason)
 * - COMPLETE (IN_PROGRESS -> COMPLETED with workDone, actualCostKobo, completedOn)
 * - VERIFY (COMPLETED -> VERIFIED_CLOSED by reporter or manager)
 */
export async function applyTransition(
  requestId: string,
  body: TransitionRequest,
  signal?: AbortSignal,
): Promise<TransitionResponse> {
  return apiRequest<TransitionResponse>(ENDPOINTS.REQUESTS.TRANSITIONS(requestId), {
    method: 'POST',
    body,
    signal,
  });
}
