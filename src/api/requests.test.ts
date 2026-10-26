import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createRequestApi,
  formatKoboToNaira,
  getLocalRequests,
  listRequestsApi,
  listTechniciansApi,
  saveLocalRequest,
  type CreateRequest,
} from './requests';

describe('requests API & mock persistence layer', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('formats kobo integer amounts into Nigerian Naira correctly', () => {
    expect(formatKoboToNaira(0)).toContain('0.00');
    expect(formatKoboToNaira(150000)).toContain('1,500.00');
    expect(formatKoboToNaira(4500000)).toContain('45,000.00');
    expect(formatKoboToNaira(null)).toContain('0.00');
  });

  it('saves and retrieves local requests', () => {
    const sampleRequest = {
      id: 'test-uuid-1',
      reference: 'GEN-100',
      title: 'Server Room AC Failure',
      building: 'Engineering Block',
      location: 'Room 302',
      equipment: 'Chiller Unit',
      category: 'HVAC & Cooling',
      priority: 'URGENT' as const,
      status: 'REPORTED' as const,
      reportedBy: {
        id: 'user-1',
        email: 'emp@genie.test',
        displayName: 'Amina Bello',
        role: 'EMPLOYEE' as const,
      },
      reportedAt: new Date().toISOString(),
      override: true,
      version: 1,
    };

    saveLocalRequest(sampleRequest);
    const stored = getLocalRequests();
    expect(stored).toHaveLength(1);
    expect(stored[0].title).toBe('Server Room AC Failure');
    expect(stored[0].reference).toBe('GEN-100');
  });

  it('stores newly reported fault and displays it at the top of listRequestsApi in mock mode', async () => {
    // Mock fetch returning Prism mock generic object
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
        if (init?.method === 'POST') {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                id: '497f6eca-6276-4993-bfeb-53cbbbba6f08',
                reference: 'string',
                title: 'string',
                building: 'string',
                location: 'string',
                equipment: 'string',
                category: 'string',
                priority: 'LOW',
                status: 'REPORTED',
                reportedBy: {
                  id: '497f6eca-6276-4993-bfeb-53cbbbba6f08',
                  email: 'user@example.com',
                  displayName: 'string',
                  role: 'EMPLOYEE',
                },
                reportedAt: '2019-08-24T14:15:22Z',
                override: false,
                version: 1,
              }),
              { status: 201, headers: { 'Content-Type': 'application/json' } },
            ),
          );
        }

        // GET /requests mock returning 1 placeholder item
        return Promise.resolve(
          new Response(
            JSON.stringify([
              {
                id: '497f6eca-6276-4993-bfeb-53cbbbba6f08',
                reference: 'string',
                title: 'string',
                status: 'REPORTED',
              },
            ]),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          ),
        );
      }),
    );

    const newFault: CreateRequest = {
      title: 'Water pipe leaking in server room',
      building: 'Data Center',
      location: 'Rack 4B',
      equipment: 'Overhead chilled water pipe',
      category: 'Plumbing & Water',
      priority: 'URGENT',
      description: 'Water dripping directly on network switches.',
    };

    const created = await createRequestApi(newFault);
    expect(created.title).toBe('Water pipe leaking in server room');
    expect(created.status).toBe('REPORTED');
    expect(created.reference).toMatch(/^GEN-/);

    // Now query listRequestsApi as a Manager
    const list = await listRequestsApi({ status: 'REPORTED' });
    expect(list.length).toBeGreaterThan(0);
    // Newly created fault should be at the very top of the list!
    expect(list[0].title).toBe('Water pipe leaking in server room');
    expect(list[0].status).toBe('REPORTED');
  });

  it('provides demo technicians in mock mode', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify([
            { id: '1', displayName: 'string', email: 'string', role: 'EMPLOYEE' },
          ]),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    );

    const technicians = await listTechniciansApi();
    expect(technicians).toHaveLength(2);
    expect(technicians[0].role).toBe('TECHNICIAN');
    expect(technicians[0].displayName).toContain('Babatunde Adeleke');
  });
});
