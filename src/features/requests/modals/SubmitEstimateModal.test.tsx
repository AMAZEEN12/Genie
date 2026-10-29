import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SubmitEstimateModal } from './SubmitEstimateModal';
import { parseNairaToKobo } from '../../../api/requests';

/** MVP feedback item 6 (proposed by Victor Oyeleke): a cost breakdown when submitting an estimate. */
function renderModal() {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  render(<SubmitEstimateModal isOpen onClose={vi.fn()} onSubmit={onSubmit} isPending={false} />);
  return onSubmit;
}

const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe('SubmitEstimateModal cost breakdown', () => {
  it('sends every line and a total that is their sum, in integer kobo', async () => {
    const onSubmit = renderModal();
    type('Line 1 description', 'Two technicians, 3 hours');
    type('Line 1 amount in naira', '15,000');
    type('Line 2 description', 'Compressor capacitor');
    type('Line 2 amount in naira', '18500.50');
    fireEvent.click(screen.getByRole('button', { name: '+ Add line' }));
    fireEvent.change(screen.getByLabelText('Line 3 category'), { target: { value: 'OTHER' } });
    type('Line 3 description', 'Transport');
    type('Line 3 amount in naira', '2500');

    expect(screen.getByTestId('estimate-total').textContent).toBe('₦36,000.50');
    fireEvent.click(screen.getByRole('button', { name: 'Submit estimate for approval' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      amountKobo: 3600050,
      lines: [
        { category: 'LABOUR', description: 'Two technicians, 3 hours', amountKobo: 1500000 },
        { category: 'MATERIALS', description: 'Compressor capacitor', amountKobo: 1850050 },
        { category: 'OTHER', description: 'Transport', amountKobo: 250000 },
      ],
    });
  });

  it('refuses a line without a description or a valid amount, and sends nothing', async () => {
    const onSubmit = renderModal();
    type('Line 1 description', 'Labour');
    type('Line 1 amount in naira', '1000');
    type('Line 2 description', '');
    type('Line 2 amount in naira', '12.345');
    fireEvent.click(screen.getByRole('button', { name: 'Submit estimate for approval' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Line 2');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('lets lines be removed but always keeps one', () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Remove line 2' }));
    expect(screen.queryByLabelText('Line 2 description')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove line 1' })).toBeDisabled();
  });

  it('stops at 20 lines', () => {
    renderModal();
    const add = screen.getByRole('button', { name: '+ Add line' });
    for (let i = 0; i < 25; i++) fireEvent.click(add);
    expect(screen.getByLabelText('Line 20 description')).toBeInTheDocument();
    expect(screen.queryByLabelText('Line 21 description')).not.toBeInTheDocument();
    expect(add).toBeDisabled();
  });
});

describe('parseNairaToKobo', () => {
  it('turns typed naira into exact integer kobo', () => {
    expect(parseNairaToKobo('18500')).toBe(1850000);
    expect(parseNairaToKobo('18,500.5')).toBe(1850050);
    expect(parseNairaToKobo('0.05')).toBe(5);
    // A float would give 1999.9999999999998 * 100 here; the parser stays exact.
    expect(parseNairaToKobo('19.99')).toBe(1999);
  });

  it('rejects anything that is not a positive amount with at most two decimals', () => {
    for (const bad of ['', '0', '0.00', '-5', '12.345', 'abc', '1e3', '90071992547409.92']) {
      expect(parseNairaToKobo(bad)).toBeNull();
    }
  });
});
