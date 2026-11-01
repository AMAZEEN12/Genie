import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getReceiptsList,
  uploadReceiptFile,
  decideReceiptAction,
  reimburseReceiptAction,
  deleteReceiptAction,
  downloadReceiptBlob,
  type ReceiptModel,
} from '../api/receipts';

export const receiptKeys = {
  all: ['receipts'] as const,
  list: () => ['receipts', 'list'] as const,
  detail: (id: string) => ['receipts', 'detail', id] as const,
  file: (id: string) => ['receipts', 'file', id] as const,
};

export function useReceiptsQuery() {
  return useQuery<ReceiptModel[]>({
    queryKey: receiptKeys.list(),
    queryFn: () => getReceiptsList(),
  });
}

export function useUploadReceiptMutation() {
  const queryClient = useQueryClient();

  return useMutation<ReceiptModel, Error, { file: File }>({
    mutationFn: ({ file }) => uploadReceiptFile(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receiptKeys.all });
    },
  });
}

export function useDecideReceiptMutation() {
  const queryClient = useQueryClient();

  return useMutation<ReceiptModel, Error, { id: string; status: 'approved' | 'rejected' }>({
    mutationFn: ({ id, status }) => decideReceiptAction(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receiptKeys.all });
    },
  });
}

export function useReimburseReceiptMutation() {
  const queryClient = useQueryClient();

  return useMutation<ReceiptModel, Error, { id: string }>({
    mutationFn: ({ id }) => reimburseReceiptAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receiptKeys.all });
    },
  });
}

export function useDeleteReceiptMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string }>({
    mutationFn: ({ id }) => deleteReceiptAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receiptKeys.all });
    },
  });
}

export { downloadReceiptBlob };
