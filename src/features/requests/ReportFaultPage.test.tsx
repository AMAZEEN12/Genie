import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router';
import * as requestsApi from '../../api/requests';
import { ApiError } from '../../api/client';
import { ReportFaultPage } from './ReportFaultPage';

const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderReportFaultPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/requests/new']}>
        <Routes>
          <Route path="/requests/new" element={<ReportFaultPage />} />
          <Route path="/requests/:id" element={<div>Request Details Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ReportFaultPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form input fields and priority selection pills', () => {
    renderReportFaultPage();

    expect(screen.getByRole('heading', { name: /report a fault/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/fault title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/building/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/equipment/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/detailed description/i)).toBeInTheDocument();

    expect(screen.getByRole('radio', { name: 'Low' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Medium' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'High' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Urgent' })).toBeInTheDocument();
  });

  it('selects different priority pills', () => {
    renderReportFaultPage();

    const urgentPill = screen.getByRole('radio', { name: 'Urgent' });
    fireEvent.click(urgentPill);
    expect(urgentPill).toHaveAttribute('aria-checked', 'true');

    const lowPill = screen.getByRole('radio', { name: 'Low' });
    fireEvent.click(lowPill);
    expect(lowPill).toHaveAttribute('aria-checked', 'true');
    expect(urgentPill).toHaveAttribute('aria-checked', 'false');
  });

  it('submits form with valid data and navigates to the new request detail page', async () => {
    const mockCreated = {
      id: 'req-uuid-1234',
      reference: 'GEN-2026-0001',
      title: 'AC unit leaking water',
      category: 'HVAC & Cooling',
      priority: 'HIGH' as const,
      building: 'Headquarters',
      location: '2nd Floor, Room 204',
      equipment: 'Carrier Split AC',
      description: 'Condensation leaking onto meeting room floor',
      status: 'REPORTED' as const,
      reportedBy: { id: 'u1', email: 'emp@genie.test', displayName: 'Employee User', role: 'EMPLOYEE' as const },
      reportedAt: '2026-10-26T08:00:00Z',
      override: false,
      version: 1,
      estimates: [],
      history: [],
    };

    const spy = vi.spyOn(requestsApi, 'createRequestApi').mockResolvedValue(mockCreated);

    renderReportFaultPage();

    fireEvent.change(screen.getByLabelText(/fault title/i), { target: { value: 'AC unit leaking water' } });
    fireEvent.change(screen.getByLabelText(/building/i), { target: { value: 'Headquarters' } });
    fireEvent.change(screen.getByLabelText(/location/i), { target: { value: '2nd Floor, Room 204' } });
    fireEvent.change(screen.getByLabelText(/equipment/i), { target: { value: 'Carrier Split AC' } });
    fireEvent.change(screen.getByLabelText(/detailed description/i), {
      target: { value: 'Condensation leaking onto meeting room floor' },
    });

    fireEvent.click(screen.getByRole('radio', { name: 'High' }));

    fireEvent.click(screen.getByRole('button', { name: /submit fault report/i }));

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'AC unit leaking water',
          building: 'Headquarters',
          location: '2nd Floor, Room 204',
          equipment: 'Carrier Split AC',
          description: 'Condensation leaking onto meeting room floor',
          priority: 'HIGH',
        }),
      );
      expect(mockNavigate).toHaveBeenCalledWith('/requests/req-uuid-1234');
    });
  });

  it('displays API error alert when submission fails', async () => {
    vi.spyOn(requestsApi, 'createRequestApi').mockRejectedValue(
      new ApiError({
        status: 400,
        title: 'Bad Request',
        detail: 'Equipment asset tag not recognized or duplicate title.',
      }),
    );

    renderReportFaultPage();

    fireEvent.change(screen.getByLabelText(/fault title/i), { target: { value: 'Faulty Generator' } });
    fireEvent.change(screen.getByLabelText(/building/i), { target: { value: 'Annex' } });
    fireEvent.change(screen.getByLabelText(/location/i), { target: { value: 'Basement' } });
    fireEvent.change(screen.getByLabelText(/equipment/i), { target: { value: 'Gen 1' } });
    fireEvent.change(screen.getByLabelText(/detailed description/i), { target: { value: 'Smoke coming from exhaust' } });

    fireEvent.click(screen.getByRole('button', { name: /submit fault report/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Equipment asset tag not recognized or duplicate title.',
      );
    });
  });
});
