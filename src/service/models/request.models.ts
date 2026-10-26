import type { UserModel } from './auth.models';
import type { EstimateModel } from './estimate.models';
import type { OverrideReviewDecision, StatusHistoryModel } from './transition.models';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type RequestStatus =
  | 'REPORTED'
  | 'ASSIGNED'
  | 'ESTIMATE_SUBMITTED'
  | 'ESTIMATE_APPROVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'VERIFIED_CLOSED';

export interface CreateMaintenanceRequest {
  title: string;
  description: string;
  building: string;
  location: string;
  equipment: string;
  category: string;
  priority: Priority;
}

export interface RequestSummaryModel {
  id: string;
  reference: string;
  title: string;
  building: string;
  location: string;
  equipment: string;
  category: string;
  priority: Priority;
  status: RequestStatus;
  reportedBy: UserModel;
  reportedAt: string;
  technician?: UserModel | null;
  deadline?: string | null;
  override: boolean;
  version: number;
}

export interface RequestDetailModel extends RequestSummaryModel {
  description: string;
  assignedBy?: UserModel | null;
  overrideReason?: string | null;
  overrideBy?: UserModel | null;
  overrideReview?: OverrideReviewDecision | null;
  overrideReviewedBy?: UserModel | null;
  overrideReviewNote?: string | null;
  workDone?: string | null;
  actualCostKobo?: number | null;
  completedOn?: string | null;
  verifiedBy?: UserModel | null;
  verifiedAt?: string | null;
  estimates: EstimateModel[];
  history: StatusHistoryModel[];
}

export type CreateMaintenanceResponse = RequestDetailModel;
export type GetRequestDetailResponse = RequestDetailModel;
export type ListRequestsResponse = RequestSummaryModel[];

export interface AssignTechnicianRequest {
  technicianId: string;
  deadline: string;
  version: number;
}

export type AssignTechnicianResponse = RequestDetailModel;
export type TransitionResponse = RequestDetailModel;
export type OverrideReviewResponse = RequestDetailModel;

export interface RequestFilterParams {
  status?: RequestStatus;
  category?: string;
  priority?: Priority;
  technicianId?: string;
  override?: boolean;
}
