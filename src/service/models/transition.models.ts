import type { UserModel } from './auth.models';

export type TransitionType = 'START' | 'OVERRIDE_START' | 'COMPLETE' | 'VERIFY';

export interface StartTransitionRequest {
  type: 'START';
}

export interface OverrideStartTransitionRequest {
  type: 'OVERRIDE_START';
  reason: string;
}

export interface CompleteTransitionRequest {
  type: 'COMPLETE';
  workDone: string;
  actualCostKobo: number;
  completedOn: string;
}

export interface VerifyTransitionRequest {
  type: 'VERIFY';
}

export type TransitionRequest =
  | StartTransitionRequest
  | OverrideStartTransitionRequest
  | CompleteTransitionRequest
  | VerifyTransitionRequest;

export type OverrideReviewDecision = 'ACCEPTED' | 'FLAGGED';

export interface OverrideReviewRequest {
  review: OverrideReviewDecision;
  note?: string;
}

export interface StatusHistoryModel {
  id: string;
  requestId: string;
  fromStatus?: string | null;
  toStatus: string;
  changedBy: UserModel;
  changedAt: string;
  note?: string | null;
}

export type GetHistoryResponse = StatusHistoryModel[];
