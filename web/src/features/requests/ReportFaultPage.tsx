import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { ApiError } from '../../api/client';
import { createRequestApi, type CreateRequest, type Priority } from '../../api/requests';

const CATEGORIES = [
  'HVAC & Cooling',
  'Electrical & Power',
  'Generator & Fuel',
  'Plumbing & Water',
  'Structural & Civil',
  'IT & Networking',
  'Fire Safety & Security',
  'Other',
];

const PRIORITIES: { value: Priority; label: string; description: string; badgeClass: string }[] = [
  {
    value: 'LOW',
    label: 'Low',
    description: 'Minor wear, routine check, non-disruptive',
    badgeClass: 'text-[#A8A8A8] border-white/20',
  },
  {
    value: 'MEDIUM',
    label: 'Medium',
    description: 'Partial impairment, standard queue',
    badgeClass: 'text-[#38BDF8] border-[#38BDF8]/40',
  },
  {
    value: 'HIGH',
    label: 'High',
    description: 'Significant disruption to ongoing operations',
    badgeClass: 'text-[#F59E0B] border-[#F59E0B]/40',
  },
  {
    value: 'URGENT',
    label: 'Urgent',
    description: 'Safety hazard or critical power/cooling failure',
    badgeClass: 'text-[#FF6B5E] border-[#FF6B5E]/60 font-bold',
  },
];

export function ReportFaultPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CreateRequest>({
    title: '',
    category: CATEGORIES[0],
    priority: 'MEDIUM',
    building: '',
    location: '',
    equipment: '',
    description: '',
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: CreateRequest) => createRequestApi(data),
    onSuccess: (newRequest) => {
      // Invalidate requests list so fresh data appears
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      navigate(`/requests/${newRequest.id}`);
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        setErrorMessage(error.problem.detail ?? error.problem.title ?? 'Failed to submit fault report.');
      } else {
        setErrorMessage('A network error occurred. Please check your connection.');
      }
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage(null);
  };

  const handlePrioritySelect = (priority: Priority) => {
    setFormData((prev) => ({ ...prev, priority }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!formData.title.trim()) {
      setErrorMessage('Please provide a fault title.');
      return;
    }
    if (!formData.building.trim()) {
      setErrorMessage('Please provide the building name.');
      return;
    }
    if (!formData.location.trim()) {
      setErrorMessage('Please specify the location or room within the building.');
      return;
    }
    if (!formData.equipment.trim()) {
      setErrorMessage('Please specify the equipment or asset name.');
      return;
    }
    if (!formData.description.trim()) {
      setErrorMessage('Please provide a detailed description of the fault.');
      return;
    }

    mutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Report a fault
        </h1>
        <p className="text-sm text-[#A8A8A8] mt-1">
          Submit an equipment issue or infrastructure breakdown for rapid repair triage.
        </p>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div
          role="alert"
          className="p-4 rounded-[10px] bg-[#FF6B5E]/10 border border-[#FF6B5E]/30 text-[#FF6B5E] text-sm flex items-start gap-3"
        >
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div className="flex-1">{errorMessage}</div>
        </div>
      )}

      {/* Main Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#1A1A1A] border border-white/14 rounded-[16px] p-6 sm:p-8 space-y-6 shadow-xl"
      >
        {/* Title */}
        <div className="space-y-1.5">
          <label htmlFor="title" className="block text-sm font-semibold text-white">
            Fault title <span className="text-[#E1EE04]">*</span>
          </label>
          <span id="title-hint" className="block text-xs text-[#A8A8A8]">
            Summarize the failure clearly (e.g. "Server Room AC 2 condenser not spinning")
          </span>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. 500kVA Generator tripping on high water temp"
            aria-describedby="title-hint"
            className="w-full px-4 py-2.5 rounded-[10px] bg-[#0D0D0D] border border-white/14 text-white text-sm focus:outline-none focus:border-[#E1EE04] focus:ring-1 focus:ring-[#E1EE04] placeholder:text-[#555555] transition-colors"
          />
        </div>

        {/* Category & Priority Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div className="space-y-1.5">
            <label htmlFor="category" className="block text-sm font-semibold text-white">
              Category <span className="text-[#E1EE04]">*</span>
            </label>
            <span id="category-hint" className="block text-xs text-[#A8A8A8]">
              Primary technical domain of the asset
            </span>
            <select
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              aria-describedby="category-hint"
              className="w-full px-4 py-2.5 rounded-[10px] bg-[#0D0D0D] border border-white/14 text-white text-sm focus:outline-none focus:border-[#E1EE04] focus:ring-1 focus:ring-[#E1EE04] transition-colors"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#1A1A1A] text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Pills */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-white">
              Priority level <span className="text-[#E1EE04]">*</span>
            </label>
            <span id="priority-hint" className="block text-xs text-[#A8A8A8]">
              Determines response urgency and manager SLA
            </span>
            <div
              role="radiogroup"
              aria-labelledby="priority-hint"
              className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1"
            >
              {PRIORITIES.map((p) => {
                const isSelected = formData.priority === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handlePrioritySelect(p.value)}
                    className={`px-3 py-2 rounded-[10px] text-xs font-semibold border transition-all text-center cursor-pointer ${
                      isSelected
                        ? p.value === 'URGENT'
                          ? 'bg-[#FF6B5E]/20 border-[#FF6B5E] text-[#FF6B5E] ring-1 ring-[#FF6B5E]'
                          : 'bg-[#E1EE04] border-[#E1EE04] text-[#0D0D0D] ring-1 ring-[#E1EE04]'
                        : 'bg-[#0D0D0D] border-white/14 text-[#A8A8A8] hover:text-white hover:border-white/30'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Building, Location, Equipment Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Building */}
          <div className="space-y-1.5">
            <label htmlFor="building" className="block text-sm font-semibold text-white">
              Building <span className="text-[#E1EE04]">*</span>
            </label>
            <input
              type="text"
              id="building"
              name="building"
              required
              value={formData.building}
              onChange={handleChange}
              placeholder="e.g. Main Tower"
              className="w-full px-4 py-2.5 rounded-[10px] bg-[#0D0D0D] border border-white/14 text-white text-sm focus:outline-none focus:border-[#E1EE04] focus:ring-1 focus:ring-[#E1EE04] placeholder:text-[#555555] transition-colors"
            />
          </div>

          {/* Location / Floor */}
          <div className="space-y-1.5">
            <label htmlFor="location" className="block text-sm font-semibold text-white">
              Location / Room <span className="text-[#E1EE04]">*</span>
            </label>
            <input
              type="text"
              id="location"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. 2nd Floor, Server Room"
              className="w-full px-4 py-2.5 rounded-[10px] bg-[#0D0D0D] border border-white/14 text-white text-sm focus:outline-none focus:border-[#E1EE04] focus:ring-1 focus:ring-[#E1EE04] placeholder:text-[#555555] transition-colors"
            />
          </div>

          {/* Equipment / Asset */}
          <div className="space-y-1.5">
            <label htmlFor="equipment" className="block text-sm font-semibold text-white">
              Equipment / Asset <span className="text-[#E1EE04]">*</span>
            </label>
            <input
              type="text"
              id="equipment"
              name="equipment"
              required
              value={formData.equipment}
              onChange={handleChange}
              placeholder="e.g. Daikin Inverter #02"
              className="w-full px-4 py-2.5 rounded-[10px] bg-[#0D0D0D] border border-white/14 text-white text-sm focus:outline-none focus:border-[#E1EE04] focus:ring-1 focus:ring-[#E1EE04] placeholder:text-[#555555] transition-colors"
            />
          </div>
        </div>

        {/* Detailed Description */}
        <div className="space-y-1.5">
          <label htmlFor="description" className="block text-sm font-semibold text-white">
            Detailed description <span className="text-[#E1EE04]">*</span>
          </label>
          <span id="desc-hint" className="block text-xs text-[#A8A8A8]">
            Note what happened, error lights, sounds, or who was affected
          </span>
          <textarea
            id="description"
            name="description"
            rows={4}
            required
            value={formData.description}
            onChange={handleChange}
            placeholder="Explain symptoms, warning indicators, or emergency status..."
            aria-describedby="desc-hint"
            className="w-full px-4 py-3 rounded-[10px] bg-[#0D0D0D] border border-white/14 text-white text-sm focus:outline-none focus:border-[#E1EE04] focus:ring-1 focus:ring-[#E1EE04] placeholder:text-[#555555] transition-colors"
          />
        </div>

        {/* Form Actions */}
        <div className="pt-4 border-t border-white/14 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/requests')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-[10px] border border-white/14 text-sm font-medium text-[#A8A8A8] hover:text-white hover:bg-white/5 transition-colors cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full sm:w-auto px-6 py-2.5 rounded-[10px] bg-[#E1EE04] text-[#0D0D0D] text-sm font-bold hover:brightness-105 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {mutation.isPending ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-[#0D0D0D]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Submitting report…
              </>
            ) : (
              'Submit fault report'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
