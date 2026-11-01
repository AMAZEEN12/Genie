import React, { useEffect, useRef, useState } from 'react';
import { useUploadReceiptMutation } from '../../../hooks/useReceipts';
import { formatBytes } from '../formatBytes';

interface UploadReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'pdf']);

export function UploadReceiptModal({ isOpen, onClose, onSuccess }: UploadReceiptModalProps): React.JSX.Element | null {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const uploadMutation = useUploadReceiptMutation();

  // Dialog lifecycle per modern-web-guidance
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  const clearSelectedFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  const validateAndSetFile = (file: File) => {
    setValidationError(null);

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const isValidExt = ALLOWED_EXTENSIONS.has(ext);
    const isValidMime = ALLOWED_MIME_TYPES.has(file.type) || (file.type === '' && isValidExt);

    if (!isValidExt || !isValidMime) {
      setValidationError(
        `Invalid file type (${ext || file.type || 'unknown'}). Only JPEG, PNG, WebP, and PDF files are accepted.`,
      );
      clearSelectedFile();
      return;
    }

    if (file.size > MAX_BYTES) {
      setValidationError(
        `File is too large (${formatBytes(file.size)}). Maximum allowed upload size is 10 MB.`,
      );
      clearSelectedFile();
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleClose = () => {
    if (uploadMutation.isPending) return;
    clearSelectedFile();
    setValidationError(null);
    uploadMutation.reset();
    onClose();
  };

  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      handleClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || uploadMutation.isPending) return;

    try {
      await uploadMutation.mutateAsync({ file: selectedFile });
      handleClose();
      onSuccess?.();
    } catch {
      // Error is captured in uploadMutation.error
    }
  };

  if (!isOpen) return null;

  const isPdf = selectedFile?.name.toLowerCase().endsWith('.pdf') || selectedFile?.type === 'application/pdf';

  return (
    <dialog
      ref={dialogRef}
      onClick={handleDialogClick}
      onCancel={(e) => {
        e.preventDefault();
        handleClose();
      }}
      aria-labelledby="upload-receipt-title"
      className="m-auto bg-transparent p-0 text-white backdrop:bg-black/75 backdrop:backdrop-blur-sm max-w-lg w-full"
    >
      <div className="bg-[#1A1A1A] border border-white/14 rounded-[16px] p-6 shadow-2xl relative space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="upload-receipt-title" className="font-display text-xl font-bold text-white tracking-tight">
              Upload Receipt
            </h2>
            <p className="text-xs text-[#A8A8A8] mt-1">
              Upload an expense receipt for reimbursement. Accepts JPEG, PNG, WebP, or PDF up to 10 MB.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={uploadMutation.isPending}
            className="text-white/60 hover:text-white text-xl p-1 -mr-1 -mt-1 cursor-pointer transition-colors disabled:opacity-50"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Mutation Server Error Alert */}
        {uploadMutation.isError && (
          <div
            role="alert"
            className="p-3.5 rounded-[10px] bg-[#FF6B5E]/15 border border-[#FF6B5E]/40 text-[#FF6B5E] text-xs leading-relaxed"
          >
            <strong>Upload failed:</strong> {uploadMutation.error.message}
          </div>
        )}

        {/* Client-Side Validation Error Alert */}
        {validationError && (
          <div
            role="alert"
            className="p-3.5 rounded-[10px] bg-[#FF6B5E]/15 border border-[#FF6B5E]/40 text-[#FF6B5E] text-xs leading-relaxed"
          >
            {validationError}
          </div>
        )}

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {!selectedFile ? (
            /* Dropzone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-[12px] p-8 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-[#E1EE04] bg-[#E1EE04]/5'
                  : 'border-white/20 bg-[#0D0D0D]/50 hover:border-white/40 hover:bg-[#0D0D0D]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Choose receipt file"
              />
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#E1EE04]">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Click to browse or drag and drop receipt
                  </p>
                  <p className="text-xs text-[#A8A8A8] mt-1">
                    JPEG, PNG, WebP or PDF (Max 10 MB)
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Selected File Preview Box */
            <div className="bg-[#0D0D0D] border border-white/14 rounded-[12px] p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-[8px] bg-white/10 flex items-center justify-center shrink-0 text-[#E1EE04] font-bold text-xs uppercase font-mono">
                    {isPdf ? 'PDF' : selectedFile.name.split('.').pop() || 'IMG'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{selectedFile.name}</p>
                    <p className="text-xs text-[#A8A8A8]">{formatBytes(selectedFile.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearSelectedFile}
                  disabled={uploadMutation.isPending}
                  className="text-xs text-[#FF6B5E] hover:underline cursor-pointer disabled:opacity-50 shrink-0"
                >
                  Change file
                </button>
              </div>

              {/* Image Preview Thumbnail */}
              {previewUrl && (
                <div className="relative rounded-[8px] overflow-hidden border border-white/10 max-h-48 bg-black flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Receipt preview"
                    className="max-h-48 w-auto object-contain"
                  />
                </div>
              )}

              {/* PDF Preview Notice */}
              {isPdf && (
                <div className="p-3 rounded-[8px] bg-white/5 border border-white/10 text-xs text-[#A8A8A8] flex items-center gap-2">
                  <span className="text-[#E1EE04]">ℹ</span>
                  <span>PDF selected. Full document view available after upload.</span>
                </div>
              )}
            </div>
          )}

          {/* Privacy & Security Note */}
          <div className="text-[11px] text-[#A8A8A8] flex items-center gap-2 px-1">
            <span className="text-[#10B981]">🔒</span>
            <span>Location and camera metadata are automatically stripped before storage.</span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={handleClose}
              disabled={uploadMutation.isPending}
              className="px-4 py-2.5 rounded-[10px] text-xs font-medium text-[#A8A8A8] hover:text-white hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFile || uploadMutation.isPending}
              className="px-5 py-2.5 rounded-[10px] text-xs font-semibold bg-[#E1EE04] text-[#0D0D0D] hover:bg-[#c9d403] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploadMutation.isPending ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-[#0D0D0D] border-t-transparent rounded-full animate-spin" />
                  <span>Uploading securely...</span>
                </>
              ) : (
                <span>Upload Receipt</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
