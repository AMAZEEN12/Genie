import React, { useState } from 'react';
import { formatKoboToNaira } from '../../../api/requests';

export interface CompleteWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (workDone: string, actualCostKobo: number, completedOn: string) => Promise<void>;
  isPending: boolean;
  error?: string | null;
}

export function CompleteWorkModal({
  isOpen,
  onClose,
  onComplete,
  isPending,
  error,
}: CompleteWorkModalProps) {
  const [workDone, setWorkDone] = useState('');
  const [nairaCost, setNairaCost] = useState('');
  const [completedOn, setCompletedOn] = useState(() => new Date().toISOString().slice(0, 10));
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const numericCost = parseFloat(nairaCost);
  const actualCostKobo = !isNaN(numericCost) && numericCost >= 0 ? Math.round(numericCost * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workDone.trim()) {
      setValidationError('Please describe the repair work performed.');
      return;
    }
    if (isNaN(numericCost) || numericCost < 0) {
      setValidationError('Please enter a valid actual cost (₦0.00 or greater).');
      return;
    }
    if (!completedOn) {
      setValidationError('Please select the completion date.');
      return;
    }
    setValidationError(null);
    await onComplete(workDone.trim(), actualCostKobo, completedOn);
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
        aria-labelledby="complete-modal-title"
        className="relative w-full max-w-md bg-[#1A1A1A] border border-white/14 rounded-[16px] p-6 shadow-2xl z-10 space-y-5"
      >
        <div className="flex items-center justify-between">
          <h2 id="complete-modal-title" className="font-display text-lg font-bold text-white">
            Mark repair work completed
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
            <label htmlFor="work-done" className="block text-xs font-semibold text-white">
              Work performed summary <span className="text-[#E1EE04]">*</span>
            </label>
            <textarea
              id="work-done"
              rows={3}
              required
              value={workDone}
              onChange={(e) => {
                setWorkDone(e.target.value);
                setValidationError(null);
              }}
              disabled={isPending}
              placeholder="Replaced worn impeller, flushed coolant lines, tested 30 mins under full load..."
              className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#0D0D0D] border border-white/14 text-white text-sm focus:outline-none focus:border-[#E1EE04]"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="actual-cost" className="block text-xs font-semibold text-white">
              Actual final repair cost (NGN ₦) <span className="text-[#E1EE04]">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A8A8] font-bold text-sm">
                ₦
              </span>
              <input
                type="number"
                id="actual-cost"
                step="0.01"
                min="0"
                required
                value={nairaCost}
                onChange={(e) => {
                  setNairaCost(e.target.value);
                  setValidationError(null);
                }}
                disabled={isPending}
                placeholder="e.g. 78500"
                className="w-full pl-8 pr-4 py-2.5 rounded-[10px] bg-[#0D0D0D] border border-white/14 text-white text-sm focus:outline-none focus:border-[#E1EE04] font-mono"
              />
            </div>
            {actualCostKobo >= 0 && nairaCost && (
              <p className="text-xs text-[#E1EE04] font-medium pt-1">
                Recording: {formatKoboToNaira(actualCostKobo)}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="completed-on" className="block text-xs font-semibold text-white">
              Completion date (YYYY-MM-DD) <span className="text-[#E1EE04]">*</span>
            </label>
            <input
              type="date"
              id="completed-on"
              required
              value={completedOn}
              onChange={(e) => {
                setCompletedOn(e.target.value);
                setValidationError(null);
              }}
              disabled={isPending}
              className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#0D0D0D] border border-white/14 text-white text-sm focus:outline-none focus:border-[#E1EE04]"
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
              className="px-5 py-2 rounded-[10px] bg-[#E1EE04] text-[#0D0D0D] text-xs font-bold hover:brightness-105 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
            >
              {isPending ? 'Completing…' : 'Submit completion report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
