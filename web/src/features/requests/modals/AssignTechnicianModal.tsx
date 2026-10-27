import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listTechniciansApi } from '../../../api/requests';

export interface AssignTechnicianModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (technicianId: string, deadline: string) => Promise<void>;
  isPending: boolean;
  error?: string | null;
}

export function AssignTechnicianModal({
  isOpen,
  onClose,
  onAssign,
  isPending,
  error,
}: AssignTechnicianModalProps) {
  const { data: technicians, isLoading: isLoadingTechs } = useQuery({
    queryKey: ['technicians'],
    queryFn: ({ signal }) => listTechniciansApi(signal),
    enabled: isOpen,
  });

  const [technicianId, setTechnicianId] = useState('');
  const [deadline, setDeadline] = useState(() => {
    // Default deadline to 48 hours in future
    const d = new Date();
    d.setHours(d.getHours() + 48);
    return d.toISOString().slice(0, 16);
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!technicianId) {
      setValidationError('Please select a technician.');
      return;
    }
    if (!deadline) {
      setValidationError('Please set a completion deadline.');
      return;
    }
    setValidationError(null);
    const deadlineIso = new Date(deadline).toISOString();
    await onAssign(technicianId, deadlineIso);
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
        aria-labelledby="assign-modal-title"
        className="relative w-full max-w-md bg-[#1A1A1A] border border-white/14 rounded-[16px] p-6 shadow-2xl z-10 space-y-5"
      >
        <div className="flex items-center justify-between">
          <h2 id="assign-modal-title" className="font-display text-lg font-bold text-white">
            Assign technician
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
            <label htmlFor="tech-select" className="block text-xs font-semibold text-white">
              Technician <span className="text-[#E1EE04]">*</span>
            </label>
            <select
              id="tech-select"
              required
              value={technicianId}
              onChange={(e) => {
                setTechnicianId(e.target.value);
                setValidationError(null);
              }}
              disabled={isLoadingTechs || isPending}
              className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#0D0D0D] border border-white/14 text-white text-sm focus:outline-none focus:border-[#E1EE04] cursor-pointer"
            >
              <option value="" disabled className="bg-[#1A1A1A] text-[#A8A8A8]">
                {isLoadingTechs ? 'Loading technicians…' : 'Select a technician…'}
              </option>
              {technicians?.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#1A1A1A] text-white">
                  {t.displayName} ({t.email})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="deadline-input" className="block text-xs font-semibold text-white">
              Target completion deadline <span className="text-[#E1EE04]">*</span>
            </label>
            <input
              type="datetime-local"
              id="deadline-input"
              required
              value={deadline}
              onChange={(e) => {
                setDeadline(e.target.value);
                setValidationError(null);
              }}
              disabled={isPending}
              className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#0D0D0D] border border-white/14 text-white text-sm focus:outline-none focus:border-[#E1EE04] cursor-pointer"
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
              disabled={isPending || isLoadingTechs}
              className="px-5 py-2 rounded-[10px] bg-[#E1EE04] text-[#0D0D0D] text-xs font-bold hover:brightness-105 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
            >
              {isPending ? 'Assigning…' : 'Confirm assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
