/**
 * Data models for receipt uploads, access, and workflow management.
 * Reference: contract/openapi.yaml v0.3.0
 */

export type ReceiptStatus = 'submitted' | 'approved' | 'rejected' | 'reimbursed';

export interface ReceiptModel {
  id: string;
  orgId: string;
  uploadedBy: string;
  managerId?: string | null;
  status: ReceiptStatus;
  originalName: string;
  format?: string | null;
  resourceType?: string | null;
  bytes: number;
  createdAt: string;
  decidedBy?: string | null;
  decidedAt?: string | null;
  reimbursedBy?: string | null;
  reimbursedAt?: string | null;
}

export interface ReceiptDecisionRequest {
  status: 'approved' | 'rejected';
}

export interface ReceiptFilterParams {
  status?: ReceiptStatus;
  search?: string;
  uploaderId?: string;
}
