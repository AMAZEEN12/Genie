import type { Priority } from '../api/requests';

const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; bg: string; text: string; border: string; icon: string }
> = {
  LOW: {
    label: 'Low',
    bg: 'bg-zinc-800/60',
    text: 'text-zinc-300',
    border: 'border-zinc-700',
    icon: '↓',
  },
  MEDIUM: {
    label: 'Medium',
    bg: 'bg-sky-950/60',
    text: 'text-sky-300',
    border: 'border-sky-500/30',
    icon: '→',
  },
  HIGH: {
    label: 'High',
    bg: 'bg-amber-950/60',
    text: 'text-amber-300',
    border: 'border-amber-500/30',
    icon: '↑',
  },
  URGENT: {
    label: 'Urgent',
    bg: 'bg-[#FF6B5E]/15',
    text: 'text-[#FF6B5E]',
    border: 'border-[#FF6B5E]/40',
    icon: '⚠',
  },
};

export function PriorityBadge({
  priority,
  override = false,
  className = '',
}: {
  priority: Priority;
  override?: boolean;
  className?: string;
}) {
  const config = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.MEDIUM;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
      >
        <span aria-hidden="true" className="text-[11px] font-bold">
          {config.icon}
        </span>
        <span>{config.label}</span>
      </span>

      {override && (
        <span
          title="Urgent override applied by manager"
          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#FF6B5E] text-[#0D0D0D]"
        >
          Override
        </span>
      )}
    </div>
  );
}
