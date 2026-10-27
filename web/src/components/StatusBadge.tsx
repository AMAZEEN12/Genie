import type { RequestStatus } from '../api/requests';

const STATUS_CONFIG: Record<
  RequestStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  REPORTED: {
    label: 'Reported',
    bg: 'bg-zinc-800/80',
    text: 'text-zinc-200',
    border: 'border-zinc-700',
    dot: 'bg-zinc-400',
  },
  ASSIGNED: {
    label: 'Assigned',
    bg: 'bg-sky-950/70',
    text: 'text-sky-300',
    border: 'border-sky-500/30',
    dot: 'bg-sky-400',
  },
  ESTIMATE_SUBMITTED: {
    label: 'Estimate Submitted',
    bg: 'bg-amber-950/70',
    text: 'text-amber-300',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400',
  },
  ESTIMATE_APPROVED: {
    label: 'Estimate Approved',
    bg: 'bg-lime-950/70',
    text: 'text-lime-300',
    border: 'border-lime-500/30',
    dot: 'bg-lime-400',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    bg: 'bg-indigo-950/70',
    text: 'text-indigo-300',
    border: 'border-indigo-500/30',
    dot: 'bg-indigo-400',
  },
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-emerald-950/70',
    text: 'text-emerald-300',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  VERIFIED_CLOSED: {
    label: 'Verified & Closed',
    bg: 'bg-zinc-900',
    text: 'text-zinc-400',
    border: 'border-zinc-800',
    dot: 'bg-zinc-500',
  },
};

export function StatusBadge({ status, className = '' }: { status: RequestStatus; className?: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.REPORTED;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}
