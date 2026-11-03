import React, { useEffect, useRef, useState } from 'react';
import type { Role } from '../../../api/auth';
import type { ReceiptModel } from '../../../service/models/receipt.models';
import { ReceiptStatusBadge } from '../ReceiptStatusBadge';
import { formatBytes } from '../formatBytes';
import {
  downloadReceiptBlob,
  useDecideReceiptMutation,
  useDeleteReceiptMutation,
  useReimburseReceiptMutation,
} from '../../../hooks/useReceipts';

interface ReceiptViewModalProps {
  receipt: ReceiptModel | null;
  isOpen: boolean;
  onClose: () => void;
  viewerRole?: Role;
  viewerUserId?: string;
  onActionComplete?: () => void;
}

function ReceiptViewModalContent({
  receipt,
  onClose,
  viewerRole,
  viewerUserId,
  onActionComplete,
}: {
  receipt: ReceiptModel;
  onClose: () => void;
  viewerRole?: Role;
  viewerUserId?: string;
  onActionComplete?: () => void;
}): React.JSX.Element {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoadingStream, setIsLoadingStream] = useState<boolean>(true);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const decideMutation = useDecideReceiptMutation();
  const reimburseMutation = useReimburseReceiptMutation();
  const deleteMutation = useDeleteReceiptMutation();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  // Fetch binary file stream on mount
  useEffect(() => {
    let isMounted = true;

    downloadReceiptBlob(receipt.id)
      .then((blob) => {
        if (!isMounted) return;
        setBlobUrl(URL.createObjectURL(blob));
        setIsLoadingStream(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setStreamError(err instanceof Error ? err.message : 'Unable to stream receipt from backend.');
        setIsLoadingStream(false);
      });

    return () => {
      isMounted = false;
    };
  }, [receipt.id]);

  // Clean up blob URL on unmount or URL replacement
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  const handleClose = () => {
    setActionError(null);
    onClose();
  };

  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      handleClose();
    }
  };

  const fileFormat =
    receipt.format?.toLowerCase() ||
    receipt.originalName?.split('.').pop()?.toLowerCase() ||
    'file';

  const isPdf =
    fileFormat === 'pdf' ||
    Boolean(receipt.originalName?.toLowerCase().endsWith('.pdf')) ||
    receipt.resourceType === 'raw';

  const isOwnReceipt = Boolean(viewerUserId && receipt.uploadedBy === viewerUserId);
  const canManagerDecide =
    viewerRole === 'MANAGER' && receipt.status === 'submitted' && !isOwnReceipt;
  const isManagerSelfApprovalForbidden =
    viewerRole === 'MANAGER' && receipt.status === 'submitted' && isOwnReceipt;
  const canFinanceReimburse =
    viewerRole === 'FINANCE' && receipt.status === 'approved';
  const canDelete =
    viewerRole === 'FINANCE' || (isOwnReceipt && receipt.status === 'submitted');

  const handleDecision = async (status: 'approved' | 'rejected') => {
    setActionError(null);
    try {
      await decideMutation.mutateAsync({ id: receipt.id, status });
      onActionComplete?.();
      handleClose();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to record decision');
    }
  };

  const handleReimburse = async () => {
    setActionError(null);
    try {
      await reimburseMutation.mutateAsync({ id: receipt.id });
      onActionComplete?.();
      handleClose();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to reimburse receipt');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this receipt? This action is logged to the audit trail.')) {
      return;
    }
    setActionError(null);
    try {
      await deleteMutation.mutateAsync({ id: receipt.id });
      onActionComplete?.();
      handleClose();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete receipt');
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleDialogClick}
      onCancel={(e) => {
        e.preventDefault();
        handleClose();
      }}
      aria-labelledby="receipt-view-title"
      className="m-auto bg-transparent p-0 text-white backdrop:bg-black/80 backdrop:backdrop-blur-sm max-w-4xl w-full"
    >
      <div className="bg-[#1A1A1A] border border-white/14 rounded-[16px] p-6 shadow-2xl relative space-y-5 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <ReceiptStatusBadge status={receipt.status} />
              <span className="font-mono text-xs text-[#A8A8A8]">ID: {receipt.id.slice(0, 8)}...</span>
            </div>
            <h2
              id="receipt-view-title"
              className="font-display text-xl font-bold text-white tracking-tight mt-1 truncate"
            >
              {receipt.originalName}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-white/60 hover:text-white text-xl p-1 -mr-1 -mt-1 cursor-pointer transition-colors"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Action Error Alert */}
        {actionError && (
          <div
            role="alert"
            className="p-3.5 rounded-[10px] bg-[#FF6B5E]/15 border border-[#FF6B5E]/40 text-[#FF6B5E] text-xs shrink-0"
          >
            {actionError}
          </div>
        )}

        {/* Content Body: Preview & Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto pr-1">
          {/* File Stream Preview (2 cols) */}
          <div className="md:col-span-2 bg-[#0D0D0D] border border-white/10 rounded-[12px] p-4 flex flex-col items-center justify-center min-h-[320px] max-h-[500px] overflow-hidden">
            {isLoadingStream ? (
              <div className="flex flex-col items-center gap-3 text-[#A8A8A8] text-sm">
                <span className="w-8 h-8 border-2 border-[#E1EE04] border-t-transparent rounded-full animate-spin" />
                <span>Streaming receipt securely...</span>
                <span className="text-[11px] text-white/40">Cache-Control: private, no-store</span>
              </div>
            ) : streamError ? (
              <div className="p-6 text-center space-y-3 max-w-md">
                <div className="w-12 h-12 rounded-full bg-[#FF6B5E]/10 border border-[#FF6B5E]/20 text-[#FF6B5E] flex items-center justify-center mx-auto text-xl font-bold">
                  !
                </div>
                <h4 className="text-sm font-semibold text-white">Receipt File Not Found</h4>
                <p className="text-xs text-[#A8A8A8] leading-relaxed">
                  {streamError.toLowerCase().includes('stored receipt file not found') || streamError.toLowerCase().includes('not found')
                    ? 'The file binary for this receipt was cleared during a server container restart before persistent storage was enabled.'
                    : streamError}
                </p>
                <p className="text-xs text-[#A8A8A8]">
                  Please delete this receipt record and re-upload to store it with persistent database backup.
                </p>
                {canDelete && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="px-3.5 py-1.5 rounded-[8px] bg-[#FF6B5E]/20 border border-[#FF6B5E]/40 text-[#FF6B5E] text-xs font-semibold hover:bg-[#FF6B5E]/30 transition-colors cursor-pointer"
                    >
                      {deleteMutation.isPending ? 'Deleting...' : 'Delete & Re-upload'}
                    </button>
                  </div>
                )}
              </div>
            ) : blobUrl ? (
              isPdf ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-[12px] bg-white/5 border border-white/10 flex items-center justify-center text-[#E1EE04]">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{receipt.originalName}</p>
                    <p className="text-xs text-[#A8A8A8] mt-1">PDF Document ({formatBytes(receipt.bytes)})</p>
                  </div>
                  <a
                    href={blobUrl}
                    download={receipt.originalName}
                    className="px-4 py-2 rounded-[8px] bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span>Download PDF Document</span>
                  </a>
                </div>
              ) : (
                <img
                  src={blobUrl}
                  alt={receipt.originalName}
                  onError={() => {
                    setStreamError('The file preview could not be rendered as an image.');
                  }}
                  className="max-h-[460px] w-auto object-contain rounded-[8px]"
                />
              )
            ) : null}
          </div>

          {/* Details Sidebar (1 col) */}
          <div className="space-y-4 text-xs">
            <div className="bg-[#0D0D0D] border border-white/10 rounded-[12px] p-4 space-y-3">
              <h3 className="font-semibold text-white text-sm">Receipt Details</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-[#A8A8A8] block">File Size</span>
                  <span className="text-white font-mono">{formatBytes(receipt.bytes)}</span>
                </div>
                <div>
                  <span className="text-[#A8A8A8] block">Format</span>
                  <span className="text-white uppercase font-mono">{fileFormat}</span>
                </div>
                <div>
                  <span className="text-[#A8A8A8] block">Uploaded On</span>
                  <span className="text-white">{new Date(receipt.createdAt).toLocaleString()}</span>
                </div>
                {receipt.decidedAt && (
                  <div>
                    <span className="text-[#A8A8A8] block">Manager Decision</span>
                    <span className="text-white">
                      {receipt.status} on {new Date(receipt.decidedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {receipt.reimbursedAt && (
                  <div>
                    <span className="text-[#A8A8A8] block">Reimbursed On</span>
                    <span className="text-white">{new Date(receipt.reimbursedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Self Approval Warning */}
            {isManagerSelfApprovalForbidden && (
              <div className="p-3 rounded-[10px] bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] text-xs">
                ⚠️ <strong>Self-approval prohibited:</strong> As a manager, you cannot approve your own uploaded receipts. Another manager or finance will review this.
              </div>
            )}

            {/* Privacy notice */}
            <div className="p-3 rounded-[10px] bg-white/5 border border-white/10 text-[11px] text-[#A8A8A8] space-y-1">
              <div className="flex items-center gap-1.5 text-white font-medium">
                <span>🔒</span>
                <span>Private Delivery</span>
              </div>
              <p>Streamed directly through authenticated backend. No Cloudinary keys or URLs are visible.</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            {blobUrl && !streamError && (
              <a
                href={blobUrl}
                download={receipt.originalName}
                className="px-3.5 py-2 rounded-[8px] border border-white/14 bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Save File</span>
              </a>
            )}

            {canDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-3.5 py-2 rounded-[8px] border border-[#FF6B5E]/30 bg-[#FF6B5E]/10 hover:bg-[#FF6B5E]/20 text-[#FF6B5E] text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Receipt'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canManagerDecide && (
              <>
                <button
                  type="button"
                  onClick={() => handleDecision('rejected')}
                  disabled={decideMutation.isPending}
                  className="px-4 py-2 rounded-[8px] border border-[#FF6B5E]/40 text-[#FF6B5E] hover:bg-[#FF6B5E]/10 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleDecision('approved')}
                  disabled={decideMutation.isPending}
                  className="px-4 py-2 rounded-[8px] bg-[#10B981] hover:bg-[#0ea371] text-[#0D0D0D] text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Approve Receipt
                </button>
              </>
            )}

            {canFinanceReimburse && (
              <button
                type="button"
                onClick={handleReimburse}
                disabled={reimburseMutation.isPending}
                className="px-4 py-2 rounded-[8px] bg-[#E1EE04] hover:bg-[#c9d403] text-[#0D0D0D] text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {reimburseMutation.isPending ? 'Processing...' : 'Mark as Reimbursed'}
              </button>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-[8px] text-xs font-medium text-[#A8A8A8] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

export function ReceiptViewModal(props: ReceiptViewModalProps): React.JSX.Element | null {
  if (!props.isOpen || !props.receipt) return null;
  return <ReceiptViewModalContent key={props.receipt.id} {...props} receipt={props.receipt} />;
}
