import { render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router';
import * as requestsApi from '../../api/requests';
import { AuthContext } from '../../app/authContext';
import { RequestDetailPage } from './RequestDetailPage';

/** MVP feedback item 1 (employees see nothing about billing) and item 7 (Finance's Role Actions never blank). */

const employee: requestsApi.User = { id: 'u1', email: 'employee@genie.test', displayName: 'Tunde Balogun', role: 'EMPLOYEE' };
const manager: requestsApi.User = { id: 'm1', email: 'manager@genie.test', displayName: 'Chioma Nwosu', role: 'MANAGER' };
const finance: requestsApi.User = { id: 'f1', email: 'finance@genie.test', displayName: 'Babajide Adeleke', role: 'FINANCE' };
const technician: requestsApi.User = { id: 't1', email: 'technician@genie.test', displayName: 'Emeka Obi', role: 'TECHNICIAN' };

/** A request carrying every kind of cost data the service can return. */
const pricedRequest: requestsApi.RequestDetail = {
  id: 'req-1',
  reference: 'GEN-2026-0007',
  title: 'Air conditioner leaking in the server room',
  description: 'Water dripping onto the rack.',
  building: 'Headquarters',
  location: 'Floor 2, Server room',
  equipment: 'Daikin split unit',
  category: 'HVAC',
  priority: 'URGENT',
  status: 'COMPLETED',
  reportedBy: employee,
  reportedAt: '2026-10-26T08:00:00Z',
  technician,
  override: true,
  overrideReason: 'Server room overheating',
  overrideBy: manager,
  overrideReview: 'ACCEPTED',
  workDone: 'Replaced the drain pump.',
  actualCostKobo: 7250000,
  completedOn: '2026-10-27',
  version: 5,
  estimates: [
    {
      id: 'est-1',
      requestId: 'req-1',
      amountKobo: 6500000,
      submittedBy: technician,
      submittedAt: '2026-10-26T10:00:00Z',
      decision: 'REJECTED',
      decisionReason: 'Quote is above the HVAC budget',
    },
  ],
  history: [
    { id: 'h1', requestId: 'req-1', toStatus: 'REPORTED', actor: employee, at: '2026-10-26T08:00:00Z', note: 'Dripping since this morning' },
    { id: 'h2', requestId: 'req-1', fromStatus: 'ASSIGNED', toStatus: 'ESTIMATE_SUBMITTED', actor: technician, at: '2026-10-26T10:00:00Z', note: 'Estimate submitted: 6500000 kobo' },
    { id: 'h3', requestId: 'req-1', fromStatus: 'ESTIMATE_SUBMITTED', toStatus: 'ASSIGNED', actor: finance, at: '2026-10-26T11:00:00Z', note: 'Estimate rejected: Quote is above the HVAC budget' },
  ],
};

function renderAs(user: requestsApi.User) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <AuthContext.Provider value={{ user, token: 't', isAuthenticated: true, isLoading: false, login: vi.fn(), logout: vi.fn() }}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/requests/req-1']}>
          <Routes>
            <Route path="/requests/:id" element={<RequestDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </AuthContext.Provider>,
  );
}

function useRequest(detail: requestsApi.RequestDetail) {
  vi.spyOn(requestsApi, 'getRequestApi').mockResolvedValue(detail);
  vi.spyOn(requestsApi, 'getRequestHistoryApi').mockResolvedValue(detail.history ?? []);
  vi.spyOn(requestsApi, 'listTechniciansApi').mockResolvedValue([technician]);
}

beforeEach(() => vi.restoreAllMocks());

describe('Employees see nothing about billing (item 1)', () => {
  it('hides estimates, costs, finance reviews and cost notes from the employee who reported the fault', async () => {
    useRequest(pricedRequest);
    renderAs(employee);
    await screen.findByText(pricedRequest.title);

    const page = document.body.textContent ?? '';
    expect(page).not.toMatch(/₦/);
    expect(page).not.toMatch(/kobo/i);
    expect(page).not.toMatch(/estimate/i);
    expect(page).not.toMatch(/cost/i);
    expect(page).not.toMatch(/budget/i);
    expect(page).not.toMatch(/finance review/i);
    // Neutral wording instead of the estimate statuses, and the employee's own note stays.
    expect(screen.getAllByText('Awaiting approval').length).toBeGreaterThan(0);
    expect(screen.getByText('"Dripping since this morning"')).toBeInTheDocument();
    // Work summary is not billing, so it stays.
    expect(screen.getByText('Replaced the drain pump.')).toBeInTheDocument();
  });

  it('still shows the costs to a manager', async () => {
    useRequest(pricedRequest);
    renderAs(manager);
    await screen.findByText(pricedRequest.title);

    expect(screen.getByText('Cost Estimate')).toBeInTheDocument();
    expect(screen.getByText('Actual Final Cost:')).toBeInTheDocument();
    expect(screen.getByText('₦72,500.00')).toBeInTheDocument();
    expect(screen.getByText('"Estimate submitted: 6500000 kobo"')).toBeInTheDocument();
  });
});

describe("Finance's Role Actions box is never blank (item 7)", () => {
  const statuses: requestsApi.RequestStatus[] = [
    'REPORTED', 'ASSIGNED', 'ESTIMATE_SUBMITTED', 'ESTIMATE_APPROVED', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED_CLOSED',
  ];
  const overrides = [
    { name: 'no override', override: false, overrideReview: undefined },
    { name: 'override awaiting review', override: true, overrideReview: undefined },
    { name: 'override reviewed', override: true, overrideReview: 'ACCEPTED' as const },
  ];

  for (const status of statuses) {
    for (const variant of overrides) {
      it(`shows an action or a "no action" message at ${status}, ${variant.name}`, async () => {
        useRequest({
          ...pricedRequest,
          status,
          override: variant.override,
          overrideReview: variant.overrideReview,
          estimates: status === 'ESTIMATE_SUBMITTED' ? [] : pricedRequest.estimates,
        });
        renderAs(finance);

        const heading = await screen.findByRole('heading', { name: /role actions/i });
        const box = heading.parentElement!;
        await waitFor(() => {
          const hasButton = within(box).queryAllByRole('button').length > 0;
          const hasMessage = /no finance action pending/i.test(box.textContent ?? '');
          expect(hasButton || hasMessage).toBe(true);
        });
      });
    }
  }
});
