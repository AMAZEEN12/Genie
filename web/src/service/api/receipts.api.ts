import { apiRequest, apiBlobRequest } from '../httpclient';
import { ENDPOINTS } from '../endpoints';
import type { ReceiptModel, ReceiptDecisionRequest } from '../models/receipt.models';

/**
 * GET /receipts - list accessible receipts scoped by role and organisation.
 */
export async function listReceipts(signal?: AbortSignal): Promise<ReceiptModel[]> {
  return apiRequest<ReceiptModel[]>(ENDPOINTS.RECEIPTS.LIST, {
    method: 'GET',
    signal,
  });
}

/**
 * GET /receipts/{id} - get receipt metadata.
 */
export async function getReceipt(id: string, signal?: AbortSignal): Promise<ReceiptModel> {
  return apiRequest<ReceiptModel>(ENDPOINTS.RECEIPTS.DETAIL(id), {
    method: 'GET',
    signal,
  });
}

/**
 * POST /receipts - upload receipt file as multipart form data.
 */
export async function uploadReceipt(file: File, signal?: AbortSignal): Promise<ReceiptModel> {
  const formData = new FormData();
  formData.append('file', file);

  return apiRequest<ReceiptModel>(ENDPOINTS.RECEIPTS.UPLOAD, {
    method: 'POST',
    body: formData,
    signal,
  });
}

/**
 * PUT /receipts/{id}/decision - approve or reject a receipt (managers only, direct reports only).
 */
export async function decideReceipt(
  id: string,
  status: 'approved' | 'rejected',
  signal?: AbortSignal,
): Promise<ReceiptModel> {
  const data: ReceiptDecisionRequest = { status };
  return apiRequest<ReceiptModel>(ENDPOINTS.RECEIPTS.DECISION(id), {
    method: 'PUT',
    body: data,
    signal,
  });
}

/**
 * PUT /receipts/{id}/reimburse - mark an approved receipt as reimbursed (finance only).
 */
export async function reimburseReceipt(id: string, signal?: AbortSignal): Promise<ReceiptModel> {
  return apiRequest<ReceiptModel>(ENDPOINTS.RECEIPTS.REIMBURSE(id), {
    method: 'PUT',
    signal,
  });
}

/**
 * DELETE /receipts/{id} - delete receipt (uploader while submitted, finance anytime in org).
 */
export async function deleteReceipt(id: string, signal?: AbortSignal): Promise<void> {
  return apiRequest<void>(ENDPOINTS.RECEIPTS.DELETE(id), {
    method: 'DELETE',
    signal,
  });
}

/**
 * GET /receipts/{id}/file - stream receipt file from backend without exposing Cloudinary URLs.
 */
export async function fetchReceiptBlob(id: string, signal?: AbortSignal): Promise<Blob> {
  return apiBlobRequest(ENDPOINTS.RECEIPTS.FILE(id), signal);
}
