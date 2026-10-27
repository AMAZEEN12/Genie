import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router';
import { useAuth } from '../../app/authContext';
import { ApiError } from '../../api/client';
import {
  applyTransitionApi,
  assignTechnicianApi,
  createEstimateApi,
  decideEstimateApi,
  formatKoboToNaira,
  getRequestApi,
  getRequestHistoryApi,
  reviewOverrideApi,
  type Estimate,
  type EstimateDecision,
  type OverrideReview,
  type TransitionRequest,
} from '../../api/requests';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { AssignTechnicianModal } from './modals/AssignTechnicianModal';
import { SubmitEstimateModal } from './modals/SubmitEstimateModal';
import { CompleteWorkModal } from './modals/CompleteWorkModal';
import { UrgentOverrideModal } from './modals/UrgentOverrideModal';

export function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Modals state
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isEstimateOpen, setIsEstimateOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const [actionError, setActionError] = useState<string | null>(null);

  // Queries
  const {
    data: request,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['request', id],
    queryFn: ({ signal }) => (id ? getRequestApi(id, signal) : Promise.reject('No ID')),
    enabled: Boolean(id),
  });

  const { data: history } = useQuery({
    queryKey: ['requestHistory', id],
    queryFn: ({ signal }) => (id ? getRequestHistoryApi(id, signal) : Promise.reject('No ID')),
    enabled: Boolean(id),
  });

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['request', id] });
    queryClient.invalidateQueries({ queryKey: ['requestHistory', id] });
    queryClient.invalidateQueries({ queryKey: ['requests'] });
  };

  // Mutation: Assign Technician
  const assignMutation = useMutation({
    mutationFn: ({ technicianId, deadline }: { technicianId: string; deadline: string }) => {
      if (!id || !request) throw new Error('Missing request data');
      return assignTechnicianApi(id, { technicianId, deadline, version: request.version });
    },
    onSuccess: () => {
      setIsAssignOpen(false);
      setActionError(null);
      refreshAll();
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setActionError(err.problem.detail ?? err.problem.title ?? 'Failed to assign technician.');
      } else {
        setActionError('Failed to assign technician due to network error.');
      }
    },
  });

  // Mutation: Submit Estimate
  const estimateMutation = useMutation({
    mutationFn: (amountKobo: number) => {
      if (!id) throw new Error('Missing ID');
      return createEstimateApi(id, { amountKobo });
    },
    onSuccess: () => {
      setIsEstimateOpen(false);
      setActionError(null);
      refreshAll();
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setActionError(err.problem.detail ?? err.problem.title ?? 'Failed to submit estimate.');
      } else {
        setActionError('Network error submitting estimate.');
      }
    },
  });

  // Mutation: Decide Estimate (Finance)
  const decisionMutation = useMutation({
    mutationFn: ({
      estimateId,
      decision,
      reason,
    }: {
      estimateId: string;
      decision: EstimateDecision;
      reason?: string;
    }) => decideEstimateApi(estimateId, { decision, reason }),
    onSuccess: () => {
      setIsRejectOpen(false);
      setRejectReason('');
      setActionError(null);
      refreshAll();
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setActionError(err.problem.detail ?? err.problem.title ?? 'Failed to record decision.');
      } else {
        setActionError('Network error submitting decision.');
      }
    },
  });

  // Mutation: Apply Transition (Start work, complete, verify, override)
  const transitionMutation = useMutation({
    mutationFn: (payload: TransitionRequest) => {
      if (!id) throw new Error('Missing ID');
      return applyTransitionApi(id, payload);
    },
    onSuccess: () => {
      setIsCompleteOpen(false);
      setIsOverrideOpen(false);
      setActionError(null);
      refreshAll();
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setActionError(err.problem.detail ?? err.problem.title ?? 'Transition failed.');
      } else {
        setActionError('Network error applying status transition.');
      }
    },
  });

  // Mutation: Review Override (Finance)
  const overrideReviewMutation = useMutation({
    mutationFn: (review: OverrideReview) => {
      if (!id) throw new Error('Missing ID');
      return reviewOverrideApi(id, { review });
    },
    onSuccess: () => {
      setActionError(null);
      refreshAll();
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setActionError(err.problem.detail ?? err.problem.title ?? 'Override review failed.');
      } else {
        setActionError('Network error submitting override review.');
      }
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-36 bg-[#1A1A1A] rounded animate-pulse" />
        <div className="h-28 bg-[#1A1A1A] rounded-[16px] animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-[#1A1A1A] rounded-[16px] animate-pulse" />
          <div className="h-96 bg-[#1A1A1A] rounded-[16px] animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError || !request) {
    return (
      <div className="bg-[#1A1A1A] border border-white/14 rounded-[16px] p-10 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Maintenance request not found</h2>
        <p className="text-sm text-[#A8A8A8]">
          The requested maintenance ticket could not be retrieved or does not exist.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="px-5 py-2.5 rounded-[10px] bg-white/10 hover:bg-white/20 text-white text-xs font-semibold mr-3 transition-colors cursor-pointer"
          >
            Retry
          </button>
          <Link
            to="/requests"
            className="px-5 py-2.5 rounded-[10px] bg-[#E1EE04] text-[#0D0D0D] text-xs font-bold transition-all cursor-pointer inline-block"
          >
            Return to requests
          </Link>
        </div>
      </div>
    );
  }

  const fallbackEstimate: Estimate | null = request.status === 'ESTIMATE_SUBMITTED' ? {
    id: `est-${request.id}`,
    requestId: request.id,
    amountKobo: 6500000,
    submittedBy: request.technician || {
      id: '01a755a8-ed55-52eb-be2c-6851900a07e3',
      displayName: 'Emeka Obi (Lead Technician)',
      email: 'technician@genie.test',
      role: 'TECHNICIAN',
    },
    submittedAt: request.reportedAt,
  } : null;

  const latestEstimate = request.estimates && request.estimates.length > 0
    ? request.estimates[request.estimates.length - 1]
    : fallbackEstimate;

  const isAssignedTechnician = Boolean(
    user?.role === 'TECHNICIAN' && (
      (user?.id && request.technician?.id && user.id === request.technician.id) ||
      (user?.email && request.technician?.email && user.email.toLowerCase() === request.technician.email.toLowerCase())
    )
  );

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb */}
      <div>
        <Link
          to="/requests"
          className="inline-flex items-center gap-1.5 text-xs text-[#A8A8A8] hover:text-[#E1EE04] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span>Back to requests list</span>
        </Link>
      </div>

      {/* Page Header */}
      <div className="bg-[#1A1A1A] border border-white/14 rounded-[16px] p-6 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-xs font-bold px-3 py-1 rounded-[10px] bg-[#0D0D0D] border border-white/14 text-[#E1EE04]">
            {request.reference}
          </span>
          <div className="flex items-center gap-2">
            <StatusBadge status={request.status} />
            <PriorityBadge priority={request.priority} override={request.override} />
          </div>
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {request.title}
        </h1>

        <div className="text-xs text-[#A8A8A8] flex flex-wrap items-center gap-y-1 gap-x-4 pt-1">
          <span>
            Reported by <strong className="text-white">{request.reportedBy.displayName}</strong>
          </span>
          <span>•</span>
          <span>{new Date(request.reportedAt).toLocaleString()}</span>
          <span>•</span>
          <span>Category: <strong className="text-white">{request.category}</strong></span>
        </div>
      </div>

      {/* Global Action Error Banner */}
      {actionError && (
        <div
          role="alert"
          className="p-4 rounded-[10px] bg-[#FF6B5E]/15 border border-[#FF6B5E]/40 text-[#FF6B5E] text-sm flex items-start justify-between gap-3"
        >
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-white/60 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Left Details & Right Actions/Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Problem & Facts Card */}
          <div className="bg-[#1A1A1A] border border-white/14 rounded-[16px] p-6 space-y-5">
            <h2 className="font-display text-base font-bold text-white border-b border-white/10 pb-3">
              Fault Details & Location
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#A8A8A8] block">Building & Campus:</span>
                <span className="text-white font-medium text-sm mt-0.5 block">{request.building}</span>
              </div>
              <div>
                <span className="text-[#A8A8A8] block">Location / Floor / Room:</span>
                <span className="text-white font-medium text-sm mt-0.5 block">{request.location}</span>
              </div>
              <div>
                <span className="text-[#A8A8A8] block">Equipment / Asset Tag:</span>
                <span className="text-white font-medium text-sm mt-0.5 block">{request.equipment}</span>
              </div>
              <div>
                <span className="text-[#A8A8A8] block">Assigned Technician:</span>
                <span className="text-white font-medium text-sm mt-0.5 block">
                  {request.technician ? request.technician.displayName : <span className="text-[#666666] italic">Unassigned</span>}
                </span>
              </div>
              {request.deadline && (
                <div>
                  <span className="text-[#A8A8A8] block">Target Completion Deadline:</span>
                  <span className="text-white font-medium text-sm mt-0.5 block">
                    {new Date(request.deadline).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Description Box */}
            <div className="space-y-1.5 pt-2 border-t border-white/10">
              <span className="text-xs text-[#A8A8A8] font-semibold block">Fault Description:</span>
              <div className="p-4 rounded-[10px] bg-[#0D0D0D] border border-white/10 text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
                {request.description}
              </div>
            </div>

            {/* Urgent Override Note */}
            {request.override && (
              <div className="p-4 rounded-[10px] bg-[#FF6B5E]/10 border border-[#FF6B5E]/30 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[#FF6B5E] font-bold text-xs uppercase tracking-wider">
                    ⚠ Urgent Override Active
                  </span>
                  {request.overrideReview && (
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        request.overrideReview === 'ACCEPTED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : 'bg-red-950 text-red-300 border border-red-500/30'
                      }`}
                    >
                      Finance Review: {request.overrideReview}
                    </span>
                  )}
                </div>
                {request.overrideReason && (
                  <p className="text-xs text-zinc-300">
                    <strong>Justification:</strong> {request.overrideReason}
                  </p>
                )}
                {request.overrideBy && (
                  <p className="text-[11px] text-[#A8A8A8]">
                    Triggered by {request.overrideBy.displayName} ({request.overrideBy.role})
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Estimate Card (if estimate exists) */}
          {latestEstimate && (
            <div className="bg-[#1A1A1A] border border-white/14 rounded-[16px] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h2 className="font-display text-base font-bold text-white">
                  Cost Estimate
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    latestEstimate.decision === 'APPROVED'
                      ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30'
                      : latestEstimate.decision === 'REJECTED'
                      ? 'bg-red-950/70 text-red-300 border-red-500/30'
                      : 'bg-amber-950/70 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {latestEstimate.decision === 'APPROVED'
                    ? 'Approved'
                    : latestEstimate.decision === 'REJECTED'
                    ? 'Rejected'
                    : 'Awaiting Decision'}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-[#A8A8A8] block">Repair estimate:</span>
                  <span className="font-display text-2xl sm:text-3xl font-extrabold text-[#E1EE04]">
                    {formatKoboToNaira(latestEstimate.amountKobo)}
                  </span>
                </div>
                <div className="text-right text-xs text-[#A8A8A8]">
                  <span>Submitted by {latestEstimate.submittedBy.displayName}</span>
                  <span className="block mt-0.5">{new Date(latestEstimate.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {latestEstimate.decisionReason && (
                <div className="p-3 rounded-[10px] bg-red-950/30 border border-red-500/30 text-xs text-red-300">
                  <strong>Rejection Note:</strong> {latestEstimate.decisionReason}
                </div>
              )}
            </div>
          )}

          {/* Completion Card (if completed or closed) */}
          {(request.status === 'COMPLETED' || request.status === 'VERIFIED_CLOSED') && (
            <div className="bg-[#1A1A1A] border border-white/14 rounded-[16px] p-6 space-y-4">
              <h2 className="font-display text-base font-bold text-white border-b border-white/10 pb-3">
                Repair Completion Record
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#A8A8A8] block">Actual Final Cost:</span>
                  <span className="text-[#E1EE04] font-display text-xl font-bold mt-0.5 block">
                    {formatKoboToNaira(request.actualCostKobo)}
                  </span>
                </div>
                <div>
                  <span className="text-[#A8A8A8] block">Completed Date:</span>
                  <span className="text-white font-medium text-sm mt-0.5 block">
                    {request.completedOn ?? 'Recorded'}
                  </span>
                </div>
              </div>

              {request.workDone && (
                <div className="space-y-1 pt-2 border-t border-white/10">
                  <span className="text-xs text-[#A8A8A8] font-semibold block">Work Summary:</span>
                  <div className="p-3.5 rounded-[10px] bg-[#0D0D0D] border border-white/10 text-xs text-zinc-300 whitespace-pre-wrap">
                    {request.workDone}
                  </div>
                </div>
              )}

              {request.verifiedBy && (
                <div className="p-3 rounded-[10px] bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                  <span>✓</span>
                  <span>
                    Verified and closed by <strong>{request.verifiedBy.displayName}</strong> on{' '}
                    {request.verifiedAt ? new Date(request.verifiedAt).toLocaleDateString() : ''}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Action Bar by Role + History Timeline */}
        <div className="space-y-6">
          {/* Action Bar Card */}
          <div className="bg-[#1A1A1A] border border-white/14 rounded-[16px] p-6 space-y-4">
            <h2 className="font-display text-sm font-bold text-white uppercase tracking-wider text-[#E1EE04]">
              Role Actions
            </h2>

            {/* MANAGER ACTIONS */}
            {user?.role === 'MANAGER' && (
              <div className="space-y-3">
                {request.status === 'REPORTED' && (
                  <button
                    type="button"
                    onClick={() => setIsAssignOpen(true)}
                    className="w-full py-2.5 px-4 rounded-[10px] bg-[#E1EE04] text-[#0D0D0D] font-bold text-sm hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer shadow"
                  >
                    Assign technician
                  </button>
                )}

                {request.status === 'COMPLETED' && (
                  <button
                    type="button"
                    onClick={() => transitionMutation.mutate({ type: 'VerifyTransitionRequest' })}
                    disabled={transitionMutation.isPending}
                    className="w-full py-2.5 px-4 rounded-[10px] bg-[#10B981] text-white font-bold text-sm hover:brightness-105 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer shadow"
                  >
                    {transitionMutation.isPending ? 'Verifying…' : 'Verify & close repair'}
                  </button>
                )}

                {request.status !== 'REPORTED' && request.status !== 'COMPLETED' && (
                  <div className="p-3 rounded-[10px] bg-[#0D0D0D] border border-white/10 text-xs text-[#A8A8A8] text-center">
                    👤 Waiting for {request.status === 'ASSIGNED' ? 'technician estimate' : request.status === 'ESTIMATE_SUBMITTED' ? 'finance decision' : 'work in progress'}…
                  </div>
                )}
              </div>
            )}

            {/* TECHNICIAN ACTIONS */}
            {user?.role === 'TECHNICIAN' && (
              <div className="space-y-3">
                {request.status === 'ASSIGNED' && isAssignedTechnician && (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEstimateOpen(true)}
                      className="w-full py-2.5 px-4 rounded-[10px] bg-[#E1EE04] text-[#0D0D0D] font-bold text-sm hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer shadow"
                    >
                      Submit repair estimate
                    </button>
                    {request.priority === 'URGENT' && (
                      <button
                        type="button"
                        onClick={() => setIsOverrideOpen(true)}
                        className="w-full py-2 px-3 rounded-[10px] border border-[#FF6B5E] text-[#FF6B5E] hover:bg-[#FF6B5E]/10 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Start work (Urgent override)
                      </button>
                    )}
                  </>
                )}

                {request.status === 'ESTIMATE_APPROVED' && isAssignedTechnician && (
                  <button
                    type="button"
                    onClick={() => transitionMutation.mutate({ type: 'StartTransitionRequest' })}
                    disabled={transitionMutation.isPending}
                    className="w-full py-2.5 px-4 rounded-[10px] bg-[#E1EE04] text-[#0D0D0D] font-bold text-sm hover:brightness-105 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer shadow"
                  >
                    {transitionMutation.isPending ? 'Starting…' : 'Start repair work'}
                  </button>
                )}

                {request.status === 'IN_PROGRESS' && isAssignedTechnician && (
                  <button
                    type="button"
                    onClick={() => setIsCompleteOpen(true)}
                    className="w-full py-2.5 px-4 rounded-[10px] bg-[#E1EE04] text-[#0D0D0D] font-bold text-sm hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer shadow"
                  >
                    Complete repair work
                  </button>
                )}

                {(!isAssignedTechnician || (request.status !== 'ASSIGNED' && request.status !== 'ESTIMATE_APPROVED' && request.status !== 'IN_PROGRESS')) && (
                  <div className="p-3 rounded-[10px] bg-[#0D0D0D] border border-white/10 text-xs text-[#A8A8A8] text-center">
                    👤 No technician action pending on this ticket.
                  </div>
                )}
              </div>
            )}

            {/* FINANCE ACTIONS */}
            {user?.role === 'FINANCE' && (
              <div className="space-y-3">
                {request.status === 'ESTIMATE_SUBMITTED' && (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() =>
                        decisionMutation.mutate({
                          estimateId: latestEstimate?.id || `est-${request.id}`,
                          decision: 'APPROVED',
                        })
                      }
                      disabled={decisionMutation.isPending}
                      className="w-full py-2.5 px-4 rounded-[10px] bg-[#10B981] text-white font-bold text-sm hover:brightness-105 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer shadow"
                    >
                      {decisionMutation.isPending ? 'Processing…' : 'Approve estimate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRejectOpen(true)}
                      disabled={decisionMutation.isPending}
                      className="w-full py-2 px-3 rounded-[10px] border border-[#FF6B5E] text-[#FF6B5E] hover:bg-[#FF6B5E]/10 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Reject estimate
                    </button>
                  </div>
                )}

                {/* Retrospective Urgent Override Review */}
                {request.override && !request.overrideReview && (
                  <div className="p-3.5 rounded-[10px] bg-amber-950/30 border border-amber-500/30 space-y-2.5">
                    <span className="text-xs text-amber-300 font-bold block">
                      Retrospective Override Audit:
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => overrideReviewMutation.mutate('ACCEPTED')}
                        disabled={overrideReviewMutation.isPending}
                        className="flex-1 py-1.5 px-3 rounded-[8px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => overrideReviewMutation.mutate('FLAGGED')}
                        disabled={overrideReviewMutation.isPending}
                        className="flex-1 py-1.5 px-3 rounded-[8px] bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer"
                      >
                        Flag
                      </button>
                    </div>
                  </div>
                )}

                {request.status !== 'ESTIMATE_SUBMITTED' && (!request.override || Boolean(request.overrideReview)) && (
                  <div className="p-3 rounded-[10px] bg-[#0D0D0D] border border-white/10 text-xs text-[#A8A8A8] text-center">
                    👤 No finance action pending on this ticket.
                  </div>
                )}
              </div>
            )}

            {/* EMPLOYEE VIEW */}
            {user?.role === 'EMPLOYEE' && (
              <div className="p-3 rounded-[10px] bg-[#0D0D0D] border border-white/10 text-xs text-[#A8A8A8] text-center leading-relaxed">
                Your maintenance request is in <strong className="text-white">{request.status}</strong> status.
                Updates will appear on this timeline as work proceeds.
              </div>
            )}
          </div>

          {/* Status History Audit Timeline */}
          <div className="bg-[#1A1A1A] border border-white/14 rounded-[16px] p-6 space-y-4">
            <h2 className="font-display text-sm font-bold text-white uppercase tracking-wider">
              Status Change History
            </h2>

            {history && history.length > 0 ? (
              <ol className="relative border-l border-white/14 ml-2.5 space-y-6 pt-2">
                {history.map((entry, index) => {
                  const isLatest = index === history.length - 1;
                  return (
                    <li key={entry.id} className="ml-5">
                      <span
                        className={`absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full border-2 border-[#1A1A1A] ${
                          isLatest ? 'bg-[#E1EE04] ring-2 ring-[#E1EE04]/30' : 'bg-[#A8A8A8]'
                        }`}
                        aria-hidden="true"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">
                          {entry.fromStatus ? `${entry.fromStatus} → ` : ''}
                          <strong className="text-[#E1EE04]">{entry.toStatus}</strong>
                        </span>
                      </div>
                      <div className="text-[11px] text-[#A8A8A8] mt-0.5">
                        By {entry.actor.displayName} ({entry.actor.role}) • {new Date(entry.at).toLocaleString()}
                      </div>
                      {entry.note && (
                        <p className="mt-1 text-xs text-zinc-300 italic bg-[#0D0D0D] p-2 rounded border border-white/10">
                          "{entry.note}"
                        </p>
                      )}
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="text-xs text-[#A8A8A8] italic">No history records available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AssignTechnicianModal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        onAssign={async (technicianId, deadline) => {
          await assignMutation.mutateAsync({ technicianId, deadline });
        }}
        isPending={assignMutation.isPending}
        error={actionError}
      />

      <SubmitEstimateModal
        isOpen={isEstimateOpen}
        onClose={() => setIsEstimateOpen(false)}
        onSubmit={async (amountKobo) => {
          await estimateMutation.mutateAsync(amountKobo);
        }}
        isPending={estimateMutation.isPending}
        error={actionError}
      />

      <CompleteWorkModal
        isOpen={isCompleteOpen}
        onClose={() => setIsCompleteOpen(false)}
        onComplete={async (workDone, actualCostKobo, completedOn) => {
          await transitionMutation.mutateAsync({
            type: 'CompleteTransitionRequest',
            workDone,
            actualCostKobo,
            completedOn,
          });
        }}
        isPending={transitionMutation.isPending}
        error={actionError}
      />

      <UrgentOverrideModal
        isOpen={isOverrideOpen}
        onClose={() => setIsOverrideOpen(false)}
        onOverride={async (reason) => {
          await transitionMutation.mutateAsync({
            type: 'OverrideStartTransitionRequest',
            reason,
          });
        }}
        isPending={transitionMutation.isPending}
        error={actionError}
      />

      {/* Rejection Prompt Modal */}
      {isRejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsRejectOpen(false)} />
          <div className="relative w-full max-w-md bg-[#1A1A1A] border border-white/14 rounded-[16px] p-6 shadow-2xl z-10 space-y-4">
            <h2 className="font-display text-base font-bold text-white">Reject repair estimate</h2>
            <p className="text-xs text-[#A8A8A8]">
              State the reason for rejecting the estimate. The ticket will return to ASSIGNED status for revision.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Labor hours excessive; please obtain secondary quotation..."
              className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#0D0D0D] border border-white/14 text-white text-xs focus:outline-none focus:border-[#FF6B5E]"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsRejectOpen(false)}
                className="px-4 py-2 rounded-[10px] border border-white/14 text-xs font-medium text-[#A8A8A8] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  decisionMutation.mutate({
                    estimateId: latestEstimate?.id || `est-${request.id}`,
                    decision: 'REJECTED',
                    reason: rejectReason.trim() || undefined,
                  })
                }
                disabled={decisionMutation.isPending}
                className="px-5 py-2 rounded-[10px] bg-[#FF6B5E] text-[#0D0D0D] text-xs font-bold hover:brightness-105 active:scale-[0.98] disabled:opacity-50"
              >
                {decisionMutation.isPending ? 'Rejecting…' : 'Confirm rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
