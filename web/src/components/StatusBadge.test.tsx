import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';
import { statusLabel } from './statusLabels';

/** MVP feedback item 1: employees get neutral wording for the estimate statuses. */
describe('statusLabel', () => {
  it('uses neutral wording for employees', () => {
    expect(statusLabel('ESTIMATE_SUBMITTED', 'EMPLOYEE')).toBe('Awaiting approval');
    expect(statusLabel('ESTIMATE_APPROVED', 'EMPLOYEE')).toBe('Approved for repair');
    expect(statusLabel('IN_PROGRESS', 'EMPLOYEE')).toBe('In Progress');
  });

  it('keeps the workflow names for every other role', () => {
    for (const role of ['MANAGER', 'TECHNICIAN', 'FINANCE'] as const) {
      expect(statusLabel('ESTIMATE_SUBMITTED', role)).toBe('Estimate Submitted');
      expect(statusLabel('ESTIMATE_APPROVED', role)).toBe('Estimate Approved');
    }
    expect(statusLabel('ESTIMATE_SUBMITTED')).toBe('Estimate Submitted');
  });

  it('renders the role-aware label in the badge', () => {
    render(<StatusBadge status="ESTIMATE_SUBMITTED" viewerRole="EMPLOYEE" />);
    expect(screen.getByText('Awaiting approval')).toBeInTheDocument();
  });
});
