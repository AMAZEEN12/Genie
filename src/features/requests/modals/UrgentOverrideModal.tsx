import React, { useState } from 'react';

export interface UrgentOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOverride: (reason: string) => Promise<void>;
  isPending: boolean;
  error?: string | null;
}

export function UrgentOverrideModal({
  isOpen,
  onClose,
  onOverride,
  isPending,
  error,
}: UrgentOverrideModalProps) {
  const [reason, setReason] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setValidationError('Please state the justification for the emergency override.');
      return;
    }
    setValidationError(null);
    await onOverride(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog box */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="override-modal-title"
        className="relative w-full max-w-md bg-[#1A1A1A] border border-[#FF6B5E]/50 rounded-[16px] p-6 shadow-2xl z-10 space-y-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#FF6B5E] text-xl font-bold">⚠</span>
            <h2 id="override-modal-title" className="font-display text-lg font-bold text-white">
              Start work with urgent override
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-[#A8A8A8] hover:text-white rounded-[10px] transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-[#A8A8A8] leading-relaxed">
          Urgent overrides bypass prior Finance cost approval so critical repairs can start
          immediately. Finance will conduct a retrospective audit after completion.
        </p>

        {(error || validationError) && (
          <div role="alert" className="p-3 rounded-[10px] bg-[#FF6B5E]/15 border border-[#FF6B5E]/40 text-[#FF6B5E] text-xs">
            {error || validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="override-reason" className="block text-xs font-semibold text-white">
              Emergency override justification <span className="text-[#FF6B5E]">*</span>
            </label>
            <textarea
              id="override-reason"
              rows={3}
              required
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setValidationError(null);
              }}
              disabled={isPending}
              placeholder="e.g. Critical data center power failure imminent; commencing emergency radiator hose replacement immediately..."
              className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#0D0D0D] border border-white/14 text-white text-sm focus:outline-none focus:border-[#FF6B5E]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-[10px] border border-white/14 text-xs font-medium text-[#A8A8A8] hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 rounded-[10px] bg-[#FF6B5E] text-[#0D0D0D] text-xs font-bold hover:brightness-105 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
            >
              {isPending ? 'Starting work…' : 'Confirm emergency start'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
