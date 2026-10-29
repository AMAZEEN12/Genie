import React, { useState } from 'react';
import {
  formatKoboToNaira,
  parseNairaToKobo,
  type CreateEstimateRequest,
  type EstimateLineCategory,
} from '../../../api/requests';

export interface SubmitEstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (estimate: CreateEstimateRequest) => Promise<void>;
  isPending: boolean;
  error?: string | null;
}

/** Contract v0.2.0: 1 to 20 lines, each Labour, Materials or Other (MVP feedback item 6). */
const MAX_LINES = 20;
const CATEGORIES: { value: EstimateLineCategory; label: string }[] = [
  { value: 'LABOUR', label: 'Labour' },
  { value: 'MATERIALS', label: 'Materials' },
  { value: 'OTHER', label: 'Other' },
];

interface LineDraft {
  key: number;
  category: EstimateLineCategory;
  description: string;
  naira: string;
}

let nextKey = 1;
const newLine = (category: EstimateLineCategory): LineDraft => ({ key: nextKey++, category, description: '', naira: '' });

export function SubmitEstimateModal({ isOpen, onClose, onSubmit, isPending, error }: SubmitEstimateModalProps) {
  const [lines, setLines] = useState<LineDraft[]>(() => [newLine('LABOUR'), newLine('MATERIALS')]);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const update = (key: number, change: Partial<LineDraft>) => {
    setLines((current) => current.map((line) => (line.key === key ? { ...line, ...change } : line)));
    setValidationError(null);
  };

  // Integer kobo throughout: each amount is parsed as text, never through floating point.
  const parsed = lines.map((line) => ({ ...line, kobo: parseNairaToKobo(line.naira) }));
  const totalKobo = parsed.reduce((sum, line) => sum + (line.kobo ?? 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const problem = parsed.findIndex((line) => !line.description.trim() || line.description.trim().length > 120 || line.kobo === null);
    if (problem >= 0) {
      setValidationError(`Line ${problem + 1}: add a description (up to 120 characters) and an amount greater than ₦0.00.`);
      return;
    }
    if (!Number.isSafeInteger(totalKobo)) {
      setValidationError('The total is too large.');
      return;
    }
    setValidationError(null);
    await onSubmit({
      amountKobo: totalKobo,
      lines: parsed.map((line) => ({ category: line.category, description: line.description.trim(), amountKobo: line.kobo! })),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      {/* Dialog box */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="estimate-modal-title"
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#1A1A1A] border border-white/14 rounded-[16px] p-6 shadow-2xl z-10 space-y-5"
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

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold text-white">
              Cost breakdown <span className="text-[#E1EE04]">*</span>
            </legend>
            <p className="text-xs text-[#A8A8A8]">One line per item: labour, each material or part, and anything else.</p>

            <ol className="space-y-3">
              {lines.map((line, index) => {
                const n = index + 1;
                const invalidAmount = line.naira.trim() !== '' && parseNairaToKobo(line.naira) === null;
                return (
                  <li key={line.key} className="grid grid-cols-1 sm:grid-cols-[8rem_1fr_8rem_auto] gap-2 items-start">
                    <select
                      aria-label={`Line ${n} category`}
                      value={line.category}
                      onChange={(e) => update(line.key, { category: e.target.value as EstimateLineCategory })}
                      disabled={isPending}
                      className="w-full px-3 py-2.5 rounded-[10px] bg-[#0D0D0D] border border-white/14 text-white text-sm focus:outline-none focus:border-[#E1EE04]"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      aria-label={`Line ${n} description`}
                      value={line.description}
                      maxLength={120}
                      onChange={(e) => update(line.key, { description: e.target.value })}
                      disabled={isPending}
                      placeholder={line.category === 'LABOUR' ? 'e.g. Two technicians, 3 hours' : 'e.g. Compressor capacitor'}
                      className="w-full px-3 py-2.5 rounded-[10px] bg-[#0D0D0D] border border-white/14 text-white text-sm focus:outline-none focus:border-[#E1EE04]"
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A8A8] font-bold text-sm" aria-hidden="true">₦</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        aria-label={`Line ${n} amount in naira`}
                        aria-invalid={invalidAmount}
                        value={line.naira}
                        onChange={(e) => update(line.key, { naira: e.target.value })}
                        disabled={isPending}
                        placeholder="0.00"
                        className="w-full pl-7 pr-3 py-2.5 rounded-[10px] bg-[#0D0D0D] border border-white/14 text-white text-sm font-mono focus:outline-none focus:border-[#E1EE04] aria-[invalid=true]:border-[#FF6B5E]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setLines((current) => current.filter((l) => l.key !== line.key))}
                      disabled={isPending || lines.length === 1}
                      aria-label={`Remove line ${n}`}
                      className="px-3 py-2.5 rounded-[10px] border border-white/14 text-xs text-[#A8A8A8] hover:text-white disabled:opacity-40 cursor-pointer"
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
            </ol>

            <button
              type="button"
              onClick={() => setLines((current) => [...current, newLine('OTHER')])}
              disabled={isPending || lines.length >= MAX_LINES}
              className="px-3.5 py-2 rounded-[10px] border border-dashed border-white/25 text-xs font-semibold text-white hover:border-[#E1EE04] disabled:opacity-40 cursor-pointer"
            >
              + Add line
            </button>
          </fieldset>

          <div className="flex items-center justify-between p-3 rounded-[10px] bg-[#0D0D0D] border border-white/10">
            <span className="text-xs font-semibold text-[#A8A8A8]">Estimate total</span>
            <span className="font-display text-lg font-bold text-[#E1EE04]" aria-live="polite" data-testid="estimate-total">
              {formatKoboToNaira(totalKobo)}
            </span>
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
              disabled={isPending || totalKobo <= 0}
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
