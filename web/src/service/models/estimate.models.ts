import type { UserModel } from './auth.models';

export type EstimateStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED';
export type EstimateDecision = 'APPROVED' | 'REJECTED';

export interface EstimateModel {
  id: string;
  requestId: string;
  amountKobo: number;
  status: EstimateStatus;
  submittedBy: UserModel;
  submittedAt: string;
  decidedBy?: UserModel | null;
  decidedAt?: string | null;
  rejectionReason?: string | null;
}

export interface CreateEstimateRequest {
  amountKobo: number;
}

export type CreateEstimateResponse = EstimateModel;

export interface EstimateDecisionRequest {
  decision: EstimateDecision;
  reason?: string;
}

export type EstimateDecisionResponse = EstimateModel;
