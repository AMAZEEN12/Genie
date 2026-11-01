import React from 'react';
import type { ReceiptStatus } from '../../service/models/receipt.models';

interface ReceiptStatusBadgeProps {
  status: ReceiptStatus;
  className?: string;
}

export function ReceiptStatusBadge({ status, className = '' }: ReceiptStatusBadgeProps): React.JSX.Element {
  let label = 'Submitted';
  let styles = 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30';

  switch (status) {
    case 'submitted':
      label = 'Submitted';
      styles = 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30';
      break;
    case 'approved':
      label = 'Approved';
      styles = 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30';
      break;
    case 'rejected':
      label = 'Rejected';
      styles = 'bg-[#FF6B5E]/15 text-[#FF6B5E] border-[#FF6B5E]/30';
      break;
    case 'reimbursed':
      label = 'Reimbursed';
      styles = 'bg-[#E1EE04]/15 text-[#E1EE04] border-[#E1EE04]/30';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] border text-xs font-medium tracking-wide uppercase font-mono ${styles} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
    </span>
  );
}
