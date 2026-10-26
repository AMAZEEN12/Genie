import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../app/authContext';
import {
  listRequestsApi,
  listTechniciansApi,
  type ListRequestsFilter,
  type Priority,
  type RequestStatus,
} from '../../api/requests';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';

export interface RequestListPageProps {
  preset?: 'all' | 'mine' | 'my-jobs' | 'approvals';
}

const ALL_STATUSES: { value: RequestStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'REPORTED', label: 'Reported' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'ESTIMATE_SUBMITTED', label: 'Estimate Submitted' },
  { value: 'ESTIMATE_APPROVED', label: 'Estimate Approved' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'VERIFIED_CLOSED', label: 'Verified & Closed' },
];

const CATEGORIES = [
  'All categories',
  'HVAC & Cooling',
  'Electrical & Power',
  'Generator & Fuel',
  'Plumbing & Water',
  'Structural & Civil',
  'IT & Networking',
  'Fire Safety & Security',
  'Other',
];

const PRIORITIES: { value: Priority | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All priorities' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

export function RequestListPage({ preset }: RequestListPageProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const userId = user?.id;
  const userRole = user?.role;

  // Determine effective preset based on role if not explicitly provided
  const effectivePreset = useMemo(() => {
    if (preset) return preset;
    if (userRole === 'EMPLOYEE') return 'mine';
    return 'all';
  }, [preset, userRole]);

  // Filters state
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus | 'ALL'>(() => {
    if (effectivePreset === 'approvals') return 'ESTIMATE_SUBMITTED';
    return 'ALL';
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('All categories');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'ALL'>('ALL');
  const [selectedTechnician, setSelectedTechnician] = useState<string>('ALL');
  const [overrideOnly, setOverrideOnly] = useState<boolean>(false);

  // Available technicians for assignment filtering
  const { data: technicians } = useQuery({
    queryKey: ['technicians'],
    queryFn: ({ signal }) => listTechniciansApi(signal),
    enabled: effectivePreset !== 'my-jobs' && userRole !== 'EMPLOYEE',
  });

  // Build query filter parameters
  const queryFilters: ListRequestsFilter = useMemo(() => {
    const filters: ListRequestsFilter = {};
    if (selectedStatus !== 'ALL') filters.status = selectedStatus;
    if (selectedCategory !== 'All categories') filters.category = selectedCategory;
    if (selectedPriority !== 'ALL') filters.priority = selectedPriority;
    if (overrideOnly) filters.override = true;

    // For technician's "my jobs", filter by their user ID or email
    if (effectivePreset === 'my-jobs' && (userId || user?.email)) {
      filters.technicianId = userId || user?.email;
    } else if (selectedTechnician !== 'ALL') {
      filters.technicianId = selectedTechnician;
    }

    return filters;
  }, [selectedStatus, selectedCategory, selectedPriority, overrideOnly, effectivePreset, userId, user?.email, selectedTechnician]);

  const { data: requests, isLoading, isError, refetch } = useQuery({
    queryKey: ['requests', queryFilters],
    queryFn: ({ signal }) => listRequestsApi(queryFilters, signal),
  });

  const clearAllFilters = () => {
    setSelectedStatus('ALL');
    setSelectedCategory('All categories');
    setSelectedPriority('ALL');
    setSelectedTechnician('ALL');
    setOverrideOnly(false);
  };

  const hasActiveFilters =
    (effectivePreset === 'approvals' ? selectedStatus !== 'ESTIMATE_SUBMITTED' : selectedStatus !== 'ALL') ||
    selectedCategory !== 'All categories' ||
    selectedPriority !== 'ALL' ||
    (effectivePreset !== 'my-jobs' && selectedTechnician !== 'ALL') ||
    overrideOnly;

  // Title and subtitle
  const headerContent = useMemo(() => {
    switch (effectivePreset) {
      case 'my-jobs':
        return {
          title: 'My assigned jobs',
          subtitle: 'Maintenance requests currently assigned to you for inspection and repair.',
        };
      case 'approvals':
        return {
          title: 'Pending cost approvals',
          subtitle: 'Submitted repair estimates awaiting Finance authorization.',
        };
      case 'mine':
        return {
          title: 'My fault requests',
          subtitle: 'Track status updates and technician assignments on requests you reported.',
        };
      case 'all':
      default:
        return {
          title: 'All maintenance requests',
          subtitle: 'Real-time overview of reported equipment failures and repair lifecycle.',
        };
    }
  }, [effectivePreset]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {headerContent.title}
          </h1>
          <p className="text-sm text-[#A8A8A8] mt-1">{headerContent.subtitle}</p>
        </div>

        {/* Action Button: only for roles that can report */}
        {(user?.role === 'EMPLOYEE' || user?.role === 'MANAGER') && (
          <Link
            to="/requests/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#E1EE04] text-[#0D0D0D] font-bold text-sm hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Report a fault</span>
          </Link>
        )}
      </div>

      {/* Filter Bar Card */}
      <div className="bg-[#1A1A1A] border border-white/14 rounded-[16px] p-4 sm:p-5 space-y-4">
        {/* Status Pills Scrolling Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" role="toolbar" aria-label="Status filter">
          {ALL_STATUSES.map((status) => {
            const isSelected = selectedStatus === status.value;
            return (
              <button
                key={status.value}
                type="button"
                onClick={() => setSelectedStatus(status.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#E1EE04] text-[#0D0D0D] border-[#E1EE04]'
                    : 'bg-[#0D0D0D] text-[#A8A8A8] border-white/14 hover:text-white hover:border-white/30'
                }`}
              >
                {status.label}
              </button>
            );
          })}
        </div>

        {/* Secondary Filters: Category, Priority, Override */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Dropdown */}
            <select
              aria-label="Filter by category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-[10px] bg-[#0D0D0D] border border-white/14 text-xs text-white focus:outline-none focus:border-[#E1EE04] cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-[#1A1A1A] text-white">
                  {cat}
                </option>
              ))}
            </select>

            {/* Priority Dropdown */}
            <select
              aria-label="Filter by priority"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as Priority | 'ALL')}
              className="px-3 py-1.5 rounded-[10px] bg-[#0D0D0D] border border-white/14 text-xs text-white focus:outline-none focus:border-[#E1EE04] cursor-pointer"
            >
              {PRIORITIES.map((pri) => (
                <option key={pri.value} value={pri.value} className="bg-[#1A1A1A] text-white">
                  {pri.label}
                </option>
              ))}
            </select>

            {/* Technician Dropdown (when not already viewing personal jobs or employee) */}
            {effectivePreset !== 'my-jobs' && userRole !== 'EMPLOYEE' && (
              <select
                aria-label="Filter by technician"
                value={selectedTechnician}
                onChange={(e) => setSelectedTechnician(e.target.value)}
                className="px-3 py-1.5 rounded-[10px] bg-[#0D0D0D] border border-white/14 text-xs text-white focus:outline-none focus:border-[#E1EE04] cursor-pointer"
              >
                <option value="ALL" className="bg-[#1A1A1A] text-white">
                  All technicians
                </option>
                {technicians?.map((tech) => (
                  <option key={tech.id} value={tech.id} className="bg-[#1A1A1A] text-white">
                    {tech.displayName}
                  </option>
                ))}
              </select>
            )}

            {/* Urgent Override Only Toggle */}
            <label className="inline-flex items-center gap-2 text-xs text-[#A8A8A8] hover:text-white cursor-pointer select-none">
              <input
                type="checkbox"
                checked={overrideOnly}
                onChange={(e) => setOverrideOnly(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-[#0D0D0D] accent-[#E1EE04] cursor-pointer"
              />
              <span>Urgent override only</span>
            </label>
          </div>

          {/* Active Filter Clear */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs text-[#E1EE04] hover:underline cursor-pointer font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 bg-[#1A1A1A] border border-white/10 rounded-[16px] animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div
          role="alert"
          className="p-6 rounded-[16px] bg-[#FF6B5E]/10 border border-[#FF6B5E]/30 text-center space-y-3"
        >
          <p className="text-[#FF6B5E] text-sm font-medium">
            Could not load maintenance requests from the service.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-[10px] bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && requests && requests.length === 0 && (
        <div className="bg-[#1A1A1A] border border-white/14 rounded-[16px] p-12 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#A8A8A8]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">No requests found</h3>
            <p className="text-sm text-[#A8A8A8] mt-1 max-w-sm mx-auto">
              {hasActiveFilters
                ? 'No maintenance requests match the selected filters. Try broadening your criteria.'
                : 'There are currently no maintenance requests recorded in this view.'}
            </p>
          </div>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearAllFilters}
              className="px-4 py-2 rounded-[10px] bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Reset filters
            </button>
          ) : (
            (user?.role === 'EMPLOYEE' || user?.role === 'MANAGER') && (
              <Link
                to="/requests/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#E1EE04] text-[#0D0D0D] font-bold text-sm hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
              >
                Report a fault
              </Link>
            )
          )}
        </div>
      )}

      {/* Results Display */}
      {!isLoading && !isError && requests && requests.length > 0 && (
        <>
          {/* Desktop Responsive Table (hidden on small viewports) */}
          <div
            tabIndex={0}
            role="region"
            aria-label="Maintenance requests directory"
            className="hidden md:block bg-[#1A1A1A] border border-white/14 rounded-[16px] overflow-x-auto shadow-xl"
          >
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/14 bg-[#141414] text-[#A8A8A8] text-xs font-semibold uppercase tracking-wider sticky top-0 z-10">
                  <th scope="col" className="px-5 py-3.5">Reference</th>
                  <th scope="col" className="px-5 py-3.5">Title & Asset</th>
                  <th scope="col" className="px-5 py-3.5">Status</th>
                  <th scope="col" className="px-5 py-3.5">Priority</th>
                  <th scope="col" className="px-5 py-3.5">Location</th>
                  <th scope="col" className="px-5 py-3.5">Technician</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Reported</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => navigate(`/requests/${req.id}`)}
                    className="hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    {/* Reference */}
                    <td className="px-5 py-4 font-mono font-bold text-xs text-[#E1EE04] group-hover:underline">
                      {req.reference}
                    </td>

                    {/* Title & Equipment */}
                    <td className="px-5 py-4 min-w-[240px]">
                      <div className="font-semibold text-white group-hover:text-[#E1EE04] transition-colors truncate">
                        {req.title}
                      </div>
                      <div className="text-xs text-[#A8A8A8] mt-0.5 truncate">
                        {req.equipment} · <span className="text-[#666666]">{req.category}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <StatusBadge status={req.status} />
                    </td>

                    {/* Priority */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <PriorityBadge priority={req.priority} override={req.override} />
                    </td>

                    {/* Location */}
                    <td className="px-5 py-4 text-xs text-[#A8A8A8]">
                      <div>{req.building}</div>
                      <div className="text-[#666666] truncate max-w-[140px]">{req.location}</div>
                    </td>

                    {/* Technician */}
                    <td className="px-5 py-4 text-xs whitespace-nowrap">
                      {req.technician ? (
                        <span className="text-white font-medium">{req.technician.displayName}</span>
                      ) : (
                        <span className="text-[#666666] italic">Unassigned</span>
                      )}
                    </td>

                    {/* Reported Date */}
                    <td className="px-5 py-4 text-right text-xs text-[#A8A8A8] whitespace-nowrap">
                      {new Date(req.reportedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Card View (displayed on mobile screens < 768px) */}
          <div className="md:hidden space-y-3" role="feed" aria-label="Maintenance requests list">
            {requests.map((req) => (
              <div
                key={req.id}
                onClick={() => navigate(`/requests/${req.id}`)}
                className="bg-[#1A1A1A] border border-white/14 rounded-[16px] p-4 space-y-3 cursor-pointer hover:border-white/30 active:scale-[0.99] transition-all"
              >
                {/* Card Top: Reference + Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-[#E1EE04]">
                    {req.reference}
                  </span>
                  <StatusBadge status={req.status} />
                </div>

                {/* Card Middle: Title & Equipment */}
                <div>
                  <h3 className="font-bold text-base text-white leading-snug">
                    {req.title}
                  </h3>
                  <p className="text-xs text-[#A8A8A8] mt-1">
                    {req.equipment} · <span className="text-[#666666]">{req.category}</span>
                  </p>
                </div>

                {/* Card Location & Technician */}
                <div className="text-xs text-[#A8A8A8] flex items-center justify-between pt-2 border-t border-white/10">
                  <span>{req.building} · {req.location}</span>
                  <span className="text-white/80">
                    {req.technician?.displayName ?? 'Unassigned'}
                  </span>
                </div>

                {/* Card Bottom: Priority + Date */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <PriorityBadge priority={req.priority} override={req.override} />
                  <span className="text-[11px] text-[#666666]">
                    {new Date(req.reportedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
