import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router';
import * as requestsApi from '../../api/requests';
import { AuthContext } from '../../app/authContext';
import { RequestListPage } from './RequestListPage';

const mockRequests: requestsApi.RequestSummary[] = [
  {
    id: 'req-1',
    reference: 'GEN-2026-0001',
    title: '500kVA Generator overheating',
    building: 'Headquarters',
    location: 'Basement Gen Room',
    equipment: 'CAT 500kVA Diesel Generator',
    category: 'Generator & Fuel',
    priority: 'URGENT',
    status: 'REPORTED',
    reportedBy: { id: 'u1', email: 'emp@genie.test', displayName: 'Employee User', role: 'EMPLOYEE' },
    reportedAt: '2026-10-26T08:00:00Z',
    override: true,
    version: 1,
  },
  {
    id: 'req-2',
    reference: 'GEN-2026-0002',
    title: 'Floor 3 AC leaking condensation',
    building: 'Main Tower',
    location: '3rd Floor East',
    equipment: 'Daikin Inverter AC #3',
    category: 'HVAC & Cooling',
    priority: 'HIGH',
    status: 'ASSIGNED',
    technician: { id: 't1', email: 'tech@genie.test', displayName: 'Tunde Technician', role: 'TECHNICIAN' },
    reportedBy: { id: 'u1', email: 'emp@genie.test', displayName: 'Employee User', role: 'EMPLOYEE' },
    reportedAt: '2026-10-26T08:30:00Z',
    override: false,
    version: 2,
  },
  {
    id: 'req-3',
    reference: 'GEN-2026-0003',
    title: 'Water pump pressure valve broken',
    building: 'Annex B',
    location: 'Utility Yard',
    equipment: 'Grundfos Booster Pump',
    category: 'Plumbing & Water',
    priority: 'MEDIUM',
    status: 'ESTIMATE_SUBMITTED',
    technician: { id: 't1', email: 'tech@genie.test', displayName: 'Tunde Technician', role: 'TECHNICIAN' },
    reportedBy: { id: 'u1', email: 'emp@genie.test', displayName: 'Employee User', role: 'EMPLOYEE' },
    reportedAt: '2026-10-26T09:00:00Z',
    override: false,
    version: 3,
  },
];

function renderRequestListPage(
  initialPath = '/requests',
  preset?: 'all' | 'mine' | 'my-jobs' | 'approvals',
  user: requestsApi.User = { id: 'm1', email: 'manager@genie.test', displayName: 'Amina Manager', role: 'MANAGER' },
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <AuthContext.Provider
      value={{
        user,
        token: 'test-token',
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
      }}
    >
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route path="/requests" element={<RequestListPage preset={preset} />} />
            <Route path="/my-jobs" element={<RequestListPage preset="my-jobs" />} />
            <Route path="/approvals" element={<RequestListPage preset="approvals" />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </AuthContext.Provider>,
  );
}

describe('RequestListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(requestsApi, 'listRequestsApi').mockResolvedValue(mockRequests);
  });

  it('renders requests table with reference numbers and titles', async () => {
    renderRequestListPage();

    await waitFor(() => {
      expect(screen.getAllByText('GEN-2026-0001').length).toBeGreaterThan(0);
      expect(screen.getAllByText('500kVA Generator overheating').length).toBeGreaterThan(0);
      expect(screen.getAllByText('GEN-2026-0002').length).toBeGreaterThan(0);
    });

    expect(screen.getByRole('region', { name: /maintenance requests directory/i })).toBeInTheDocument();
  });

  it('filters by status when clicking status pills', async () => {
    const spy = vi.spyOn(requestsApi, 'listRequestsApi').mockImplementation(async (filters) => {
      if (filters?.status === 'ASSIGNED') return [mockRequests[1]];
      return mockRequests;
    });

    renderRequestListPage();

    await waitFor(() => {
      expect(screen.getAllByText('GEN-2026-0001').length).toBeGreaterThan(0);
    });

    const assignedPill = screen.getByRole('button', { name: 'Assigned' });
    fireEvent.click(assignedPill);

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ status: 'ASSIGNED' }), expect.anything());
      expect(screen.getAllByText('GEN-2026-0002').length).toBeGreaterThan(0);
    });
  });

  it('filters by override toggle', async () => {
    const spy = vi.spyOn(requestsApi, 'listRequestsApi').mockResolvedValue([mockRequests[0]]);

    renderRequestListPage();

    const overrideCheckbox = screen.getByLabelText(/urgent override only/i);
    fireEvent.click(overrideCheckbox);

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ override: true }), expect.anything());
    });
  });

  it('clears active filters when clicking Clear filters', async () => {
    renderRequestListPage();

    const urgentCheckbox = screen.getByLabelText(/urgent override only/i);
    fireEvent.click(urgentCheckbox);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /clear filters/i }));

    expect(screen.queryByRole('button', { name: /clear filters/i })).not.toBeInTheDocument();
  });

  it('renders preset title for my-jobs route', async () => {
    renderRequestListPage('/my-jobs', 'my-jobs', {
      id: 't1',
      email: 'tech@genie.test',
      displayName: 'Tunde Technician',
      role: 'TECHNICIAN',
    });

    expect(screen.getByRole('heading', { name: /my assigned jobs/i })).toBeInTheDocument();
  });

  it('renders preset title for approvals route', async () => {
    renderRequestListPage('/approvals', 'approvals', {
      id: 'f1',
      email: 'finance@genie.test',
      displayName: 'Chioma Finance',
      role: 'FINANCE',
    });

    expect(screen.getByRole('heading', { name: /pending cost approvals/i })).toBeInTheDocument();
  });

  it('shows empty state when no requests match', async () => {
    vi.spyOn(requestsApi, 'listRequestsApi').mockResolvedValue([]);

    renderRequestListPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /no requests found/i })).toBeInTheDocument();
    });
  });
});
