import React, { useState } from 'react';
import { formatKoboToNaira } from '../../../api/requests';

export interface SubmitEstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amountKobo: number) => Promise<void>;
  isPending: boolean;
  error?: string | null;
}

export function SubmitEstimateModal({
  isOpen,
  onClose,
  onSubmit,
  isPending,
  error,
}: SubmitEstimateModalProps) {
  const [nairaAmount, setNairaAmount] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const numericValue = parseFloat(nairaAmount);
  const calculatedKobo = !isNaN(numericValue) && numericValue > 0 ? Math.round(numericValue * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calculatedKobo || calculatedKobo <= 0) {
      setValidationError('Please enter a valid estimate amount greater than ₦0.00.');
      return;
    }
    setValidationError(null);
    await onSubmit(calculatedKobo);
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
        aria-labelledby="estimate-modal-title"
        className="relative w-full max-w-md bg-[#1A1A1A] border border-white/14 rounded-[16px] p-6 shadow-2xl z-10 space-y-5"
      >
        <div className="flex items-center justify-between">
          <h2 id="estimate-modal-title" className="font-display text-lg font-bold text-white">
            Submit repair cost estimate
          </h2>
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

        {(error || validationError) && (
          <div role="alert" className="p-3 rounded-[10px] bg-[#FF6B5E]/15 border border-[#FF6B5E]/40 text-[#FF6B5E] text-xs">
            {error || validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="amount-input" className="block text-xs font-semibold text-white">
              Estimated repair cost (NGN ₦) <span className="text-[#E1EE04]">*</span>
            </label>
            <span id="amount-hint" className="block text-xs text-[#A8A8A8]">
              Include spare parts, materials, and technician labor
            </span>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A8A8] font-bold text-sm">
                ₦
              </span>
              <input
                type="number"
                id="amount-input"
                step="0.01"
                min="1"
                required
                value={nairaAmount}
                onChange={(e) => {
                  setNairaAmount(e.target.value);
                  setValidationError(null);
                }}
                disabled={isPending}
                placeholder="e.g. 85000"
                aria-describedby="amount-hint"
                className="w-full pl-8 pr-4 py-2.5 rounded-[10px] bg-[#0D0D0D] border border-white/14 text-white text-sm focus:outline-none focus:border-[#E1EE04] font-mono"
              />
            </div>
            {calculatedKobo > 0 && (
              <p className="text-xs text-[#E1EE04] font-medium pt-1">
                Submitting: {formatKoboToNaira(calculatedKobo)} ({calculatedKobo} integer kobo)
              </p>
            )}
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
              disabled={isPending || calculatedKobo <= 0}
              className="px-5 py-2 rounded-[10px] bg-[#E1EE04] text-[#0D0D0D] text-xs font-bold hover:brightness-105 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
            >
              {isPending ? 'Submitting…' : 'Submit estimate for approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
