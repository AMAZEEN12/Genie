import type { RequestStatus, User } from '../api/requests';

const LABELS: Record<RequestStatus, string> = {
  REPORTED: 'Reported',
  ASSIGNED: 'Assigned',
  ESTIMATE_SUBMITTED: 'Estimate Submitted',
  ESTIMATE_APPROVED: 'Estimate Approved',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  VERIFIED_CLOSED: 'Verified & Closed',
};

/**
 * MVP feedback item 1: employees see nothing about billing, so the two estimate statuses get
 * neutral wording for them. Every other role sees the workflow names.
 */
const EMPLOYEE_LABELS: Partial<Record<RequestStatus, string>> = {
  ESTIMATE_SUBMITTED: 'Awaiting approval',
  ESTIMATE_APPROVED: 'Approved for repair',
};

export function statusLabel(status: RequestStatus, viewerRole?: User['role']): string {
  if (viewerRole === 'EMPLOYEE' && EMPLOYEE_LABELS[status]) return EMPLOYEE_LABELS[status]!;
  return LABELS[status] ?? LABELS.REPORTED;
}
