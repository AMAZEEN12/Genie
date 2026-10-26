import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router';
import * as requestsApi from '../../api/requests';
import { AuthContext } from '../../app/authContext';
import { RequestDetailPage } from './RequestDetailPage';

const mockDetail: requestsApi.RequestDetail = {
  id: 'req-uuid-1',
  reference: 'GEN-2026-0001',
  title: '500kVA Generator tripping on high water temp',
  description: 'Coolant leak caused temperature spike above 105C.',
  building: 'Headquarters',
  location: 'Basement Gen Room 1',
  equipment: 'CAT 500kVA Diesel Generator',
  category: 'Generator & Fuel',
  priority: 'URGENT',
  status: 'REPORTED',
  reportedBy: { id: 'u1', email: 'emp@genie.test', displayName: 'Fatima Bello', role: 'EMPLOYEE' },
  reportedAt: '2026-10-26T08:00:00Z',
  override: false,
  version: 1,
  estimates: [],
  history: [
    {
      id: 'h-1',
      requestId: 'req-uuid-1',
      toStatus: 'REPORTED',
      actor: { id: 'u1', email: 'emp@genie.test', displayName: 'Fatima Bello', role: 'EMPLOYEE' },
      at: '2026-10-26T08:00:00Z',
      note: 'Fault logged via portal',
    },
  ],
};

function renderRequestDetailPage(
  user: requestsApi.User,
  initialPath = '/requests/req-uuid-1',
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
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
            <Route path="/requests/:id" element={<RequestDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </AuthContext.Provider>,
  );
}

describe('RequestDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(requestsApi, 'getRequestApi').mockResolvedValue(mockDetail);
    vi.spyOn(requestsApi, 'getRequestHistoryApi').mockResolvedValue(mockDetail.history);
    vi.spyOn(requestsApi, 'listTechniciansApi').mockResolvedValue([
      { id: 't1', email: 'tech@genie.test', displayName: 'Tunde Repair', role: 'TECHNICIAN' },
    ]);
  });

  it('renders request details, facts card, and status history', async () => {
    const manager: requestsApi.User = {
      id: 'm1',
      email: 'manager@genie.test',
      displayName: 'Amina Manager',
      role: 'MANAGER',
    };

    renderRequestDetailPage(manager);

    await waitFor(() => {
      expect(screen.getByText('GEN-2026-0001')).toBeInTheDocument();
      expect(screen.getByText('500kVA Generator tripping on high water temp')).toBeInTheDocument();
      expect(screen.getByText('CAT 500kVA Diesel Generator')).toBeInTheDocument();
      expect(screen.getByText('Coolant leak caused temperature spike above 105C.')).toBeInTheDocument();
      expect(screen.getByText('"Fault logged via portal"')).toBeInTheDocument();
    });
  });

  it('shows Assign technician button for Manager at REPORTED status and opens modal', async () => {
    const manager: requestsApi.User = {
      id: 'm1',
      email: 'manager@genie.test',
      displayName: 'Amina Manager',
      role: 'MANAGER',
    };

    renderRequestDetailPage(manager);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /assign technician/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /assign technician/i }));

    expect(screen.getByRole('dialog', { name: /assign technician/i })).toBeInTheDocument();
  });

  it('shows Submit repair estimate button for assigned Technician at ASSIGNED status', async () => {
    const tech: requestsApi.User = {
      id: 't1',
      email: 'tech@genie.test',
      displayName: 'Tunde Repair',
      role: 'TECHNICIAN',
    };

    const assignedDetail: requestsApi.RequestDetail = {
      ...mockDetail,
      status: 'ASSIGNED',
      technician: tech,
    };
    vi.spyOn(requestsApi, 'getRequestApi').mockResolvedValue(assignedDetail);

    renderRequestDetailPage(tech);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /submit repair estimate/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /submit repair estimate/i }));
    expect(screen.getByRole('dialog', { name: /submit repair cost estimate/i })).toBeInTheDocument();
  });

  it('shows Approve and Reject buttons for Finance at ESTIMATE_SUBMITTED status', async () => {
    const finance: requestsApi.User = {
      id: 'f1',
      email: 'finance@genie.test',
      displayName: 'Chioma Finance',
      role: 'FINANCE',
    };

    const estimateDetail: requestsApi.RequestDetail = {
      ...mockDetail,
      status: 'ESTIMATE_SUBMITTED',
      estimates: [
        {
          id: 'est-1',
          requestId: 'req-uuid-1',
          amountKobo: 8500000,
          submittedBy: { id: 't1', email: 'tech@genie.test', displayName: 'Tunde Repair', role: 'TECHNICIAN' },
          submittedAt: '2026-10-26T08:30:00Z',
        },
      ],
    };
    vi.spyOn(requestsApi, 'getRequestApi').mockResolvedValue(estimateDetail);

    renderRequestDetailPage(finance);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /approve estimate/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reject estimate/i })).toBeInTheDocument();
      expect(screen.getByText('₦85,000.00')).toBeInTheDocument();
    });
  });

  it('shows Complete repair work button for assigned Technician at IN_PROGRESS status', async () => {
    const tech: requestsApi.User = {
      id: 't1',
      email: 'tech@genie.test',
      displayName: 'Tunde Repair',
      role: 'TECHNICIAN',
    };

    const inProgressDetail: requestsApi.RequestDetail = {
      ...mockDetail,
      status: 'IN_PROGRESS',
      technician: tech,
    };
    vi.spyOn(requestsApi, 'getRequestApi').mockResolvedValue(inProgressDetail);

    renderRequestDetailPage(tech);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /complete repair work/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /complete repair work/i }));
    expect(screen.getByRole('dialog', { name: /mark repair work completed/i })).toBeInTheDocument();
  });

  it('shows Verify & close repair button for Manager at COMPLETED status', async () => {
    const manager: requestsApi.User = {
      id: 'm1',
      email: 'manager@genie.test',
      displayName: 'Amina Manager',
      role: 'MANAGER',
    };

    const completedDetail: requestsApi.RequestDetail = {
      ...mockDetail,
      status: 'COMPLETED',
      workDone: 'Replaced radiator hose and flushed coolant',
      actualCostKobo: 7500000,
      completedOn: '2026-10-26',
    };
    vi.spyOn(requestsApi, 'getRequestApi').mockResolvedValue(completedDetail);

    renderRequestDetailPage(manager);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /verify & close repair/i })).toBeInTheDocument();
      expect(screen.getByText('₦75,000.00')).toBeInTheDocument();
    });
  });

  it('shows calm waiting indicator for non-actionable roles', async () => {
    const employee: requestsApi.User = {
      id: 'u1',
      email: 'emp@genie.test',
      displayName: 'Fatima Bello',
      role: 'EMPLOYEE',
    };

    renderRequestDetailPage(employee);

    await waitFor(() => {
      expect(screen.getByText(/your maintenance request is in/i)).toBeInTheDocument();
    });
  });
});
