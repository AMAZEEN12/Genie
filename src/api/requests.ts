import { apiRequest, getStoredUser } from './client';
import type { components } from './schema';

export type RequestSummary = components['schemas']['RequestSummary'];
export type RequestDetail = components['schemas']['RequestDetail'];
export type CreateRequest = components['schemas']['CreateRequest'];
export type Priority = components['schemas']['Priority'];
export type RequestStatus = components['schemas']['RequestStatus'];
export type User = components['schemas']['User'];
export type Estimate = components['schemas']['Estimate'];
export type StatusHistoryEntry = components['schemas']['StatusHistoryEntry'];
export type AssignRequest = components['schemas']['AssignRequest'];
export type CreateEstimateRequest = components['schemas']['CreateEstimateRequest'];
export type EstimateLine = components['schemas']['EstimateLine'];
export type EstimateLineInput = components['schemas']['EstimateLineInput'];
export type EstimateLineCategory = components['schemas']['EstimateLineCategory'];
export type EstimateDecisionRequest = components['schemas']['EstimateDecisionRequest'];
export type EstimateDecision = components['schemas']['EstimateDecision'];
export type TransitionRequest = components['schemas']['TransitionRequest'];
export type OverrideReviewRequest = components['schemas']['OverrideReviewRequest'];
export type OverrideReview = components['schemas']['OverrideReview'];

export interface ListRequestsFilter {
  status?: RequestStatus;
  category?: string;
  priority?: Priority;
  technicianId?: string;
  override?: boolean;
}

const LOCAL_REQUESTS_KEY = 'genie_local_requests';
const LOCAL_DETAILS_KEY = 'genie_local_request_details';

export const DEMO_TECHNICIAN_1: User = {
  id: '01a755a8-ed55-52eb-be2c-6851900a07e3',
  displayName: 'Emeka Obi (Lead Technician)',
  email: 'technician@genie.test',
  role: 'TECHNICIAN',
};

export const DEMO_TECHNICIAN_2: User = {
  id: '8ee1fe13-dc91-5486-93f1-a95e68809973',
  displayName: 'Fatima Aliyu (HVAC Specialist)',
  email: 'technician2@genie.test',
  role: 'TECHNICIAN',
};

export const DEMO_EMPLOYEE: User = {
  id: '20f89bc1-9ac5-5637-8cf7-90d23a80f420',
  displayName: 'Amina Bello (Employee)',
  email: 'employee@genie.test',
  role: 'EMPLOYEE',
};

export const DEMO_MANAGER: User = {
  id: '0c66451e-efb9-5662-b386-d98005f7a504',
  displayName: 'Chioma Nwosu (Operations Manager)',
  email: 'manager@genie.test',
  role: 'MANAGER',
};

export const DEMO_FINANCE: User = {
  id: '3b5c8178-a7ad-57c3-856c-39835fbbd27c',
  displayName: 'Babajide Adeleke (Finance Officer)',
  email: 'finance@genie.test',
  role: 'FINANCE',
};

/** Seed estimates matching database seed migrations */
export const MOCK_SEED_ESTIMATES: Record<string, Estimate[]> = {
  '7b22a048-b70d-5e21-bb0b-0e99a131c8e4': [
    {
      id: 'd9e10124-fe44-5db5-84a3-a23b014808f3',
      requestId: '7b22a048-b70d-5e21-bb0b-0e99a131c8e4',
      amountKobo: 6500000, // ₦65,000.00
      submittedBy: DEMO_TECHNICIAN_1,
      submittedAt: '2026-10-24T11:00:00Z',
    },
  ],
  '8c33b159-c81e-5f32-cc1c-1faab242d9f5': [
    {
      id: '899bbf0f-bd6d-5747-b91b-b29c02f908ed',
      requestId: '8c33b159-c81e-5f32-cc1c-1faab242d9f5',
      amountKobo: 12000000, // ₦120,000.00
      submittedBy: DEMO_TECHNICIAN_2,
      submittedAt: '2026-10-24T15:00:00Z',
      decision: 'APPROVED',
      decidedBy: DEMO_FINANCE,
      decidedAt: '2026-10-24T16:00:00Z',
    },
  ],
  '9d44c26a-d92f-5043-dd2d-20bbc353e006': [
    {
      id: '9831a4af-4624-5b6a-b3b9-bc3c1b5c2c50',
      requestId: '9d44c26a-d92f-5043-dd2d-20bbc353e006',
      amountKobo: 18500000, // ₦185,000.00
      submittedBy: DEMO_TECHNICIAN_1,
      submittedAt: '2026-10-25T09:00:00Z',
    },
  ],
  'ae55d37b-ea30-5154-ee3e-31ccd464f117': [
    {
      id: 'beab053b-d6dd-5dfb-8caa-f82dd157a6c0',
      requestId: 'ae55d37b-ea30-5154-ee3e-31ccd464f117',
      amountKobo: 4500000, // ₦45,000.00
      submittedBy: DEMO_TECHNICIAN_2,
      submittedAt: '2026-10-25T11:30:00Z',
      decision: 'APPROVED',
      decidedBy: DEMO_FINANCE,
      decidedAt: '2026-10-25T12:00:00Z',
    },
  ],
  'bf66e48c-fb41-5265-ff4f-42dde5750228': [
    {
      id: '5f7aade2-9352-503b-942a-5fe12bbc886e',
      requestId: 'bf66e48c-fb41-5265-ff4f-42dde5750228',
      amountKobo: 9000000, // ₦90,000.00
      submittedBy: DEMO_TECHNICIAN_1,
      submittedAt: '2026-10-20T08:00:00Z',
      decision: 'APPROVED',
      decidedBy: DEMO_FINANCE,
      decidedAt: '2026-10-20T09:00:00Z',
    },
  ],
};

export function getSeedEstimates(seed: RequestSummary): Estimate[] {
  if (MOCK_SEED_ESTIMATES[seed.id]) {
    return [...MOCK_SEED_ESTIMATES[seed.id]];
  }
  if (
    seed.status === 'ESTIMATE_SUBMITTED' ||
    seed.status === 'ESTIMATE_APPROVED' ||
    seed.status === 'IN_PROGRESS' ||
    seed.status === 'COMPLETED' ||
    seed.status === 'VERIFIED_CLOSED'
  ) {
    return [
      {
        id: `est-${seed.id}`,
        requestId: seed.id,
        amountKobo: 6500000,
        submittedBy: seed.technician || DEMO_TECHNICIAN_1,
        submittedAt: seed.reportedAt,
        decision: seed.status !== 'ESTIMATE_SUBMITTED' ? 'APPROVED' : undefined,
        decidedBy: seed.status !== 'ESTIMATE_SUBMITTED' ? DEMO_FINANCE : undefined,
        decidedAt: seed.status !== 'ESTIMATE_SUBMITTED' ? seed.reportedAt : undefined,
      },
    ];
  }
  return [];
}

const MOCK_SEED_REQUESTS: Array<RequestSummary & Partial<RequestDetail>> = [
  {
    id: '67518891-24dc-54c5-9885-a00ecc541fa7',
    reference: 'GEN-001',
    title: 'Flickering fluorescent tube in reception',
    building: 'Main Tower',
    location: 'Ground Floor',
    equipment: 'Fluorescent Fixture',
    category: 'Electrical & Power',
    priority: 'LOW',
    status: 'REPORTED',
    reportedBy: DEMO_EMPLOYEE,
    reportedAt: '2026-10-21T09:15:00Z',
    override: false,
    version: 1,
  },
  {
    id: 'fc9a074c-cf2f-57c1-87fb-5b3d897762c4',
    reference: 'GEN-002',
    title: 'Leaking tap in 3rd floor kitchenette',
    building: 'Annex Building',
    location: 'Floor 3',
    equipment: 'Kitchenette Sink',
    category: 'Plumbing & Water',
    priority: 'MEDIUM',
    status: 'REPORTED',
    reportedBy: DEMO_EMPLOYEE,
    reportedAt: '2026-10-21T11:30:00Z',
    override: false,
    version: 1,
  },
  {
    id: 'c401b210-a4bd-5f4e-b0a5-19d7bff069c9',
    reference: 'GEN-003',
    title: 'Broken caster wheel on executive chair',
    building: 'Tech Hub',
    location: 'Room 204',
    equipment: 'Ergonomic Chair',
    category: 'Structural & Civil',
    priority: 'LOW',
    status: 'REPORTED',
    reportedBy: DEMO_EMPLOYEE,
    reportedAt: '2026-10-22T08:45:00Z',
    override: false,
    version: 1,
  },
  {
    id: 'e1e1d0e2-5ae0-5b21-b216-192620ebd0eb',
    reference: 'GEN-004',
    title: 'Loose door handle on server room',
    building: 'Main Tower',
    location: 'Basement',
    equipment: 'Access Door',
    category: 'Fire Safety & Security',
    priority: 'HIGH',
    status: 'REPORTED',
    reportedBy: DEMO_EMPLOYEE,
    reportedAt: '2026-10-22T14:20:00Z',
    override: false,
    version: 1,
  },
  {
    id: 'a563e039-8b11-5871-addb-7459a91d6b7a',
    reference: 'GEN-005',
    title: 'Air conditioning unit making rattling noise',
    building: 'Tech Hub',
    location: 'Floor 1',
    equipment: 'Split AC Unit',
    category: 'HVAC & Cooling',
    priority: 'URGENT',
    status: 'REPORTED',
    reportedBy: DEMO_EMPLOYEE,
    reportedAt: '2026-10-23T10:00:00Z',
    override: false,
    version: 1,
  },
  {
    id: '3068be38-a6fc-52d1-aafa-9d889e20b7d3',
    reference: 'GEN-006',
    title: 'Conference room projector HDMI port loose',
    building: 'Main Tower',
    location: 'Boardroom',
    equipment: 'Epson Projector',
    category: 'IT & Networking',
    priority: 'MEDIUM',
    status: 'ASSIGNED',
    reportedBy: DEMO_EMPLOYEE,
    reportedAt: '2026-10-23T12:00:00Z',
    technician: DEMO_TECHNICIAN_1,
    deadline: '2026-10-28T17:00:00Z',
    override: false,
    version: 2,
  },
  {
    id: '7b22a048-b70d-5e21-bb0b-0e99a131c8e4',
    reference: 'GEN-011',
    title: 'UPS battery replacement in data room',
    building: 'Main Tower',
    location: 'Data Center B',
    equipment: 'APC Smart-UPS 5000',
    category: 'Electrical & Power',
    priority: 'HIGH',
    status: 'ESTIMATE_SUBMITTED',
    reportedBy: DEMO_EMPLOYEE,
    reportedAt: '2026-10-24T09:00:00Z',
    technician: DEMO_TECHNICIAN_1,
    deadline: '2026-10-27T17:00:00Z',
    override: false,
    version: 3,
  },
  {
    id: '8c33b159-c81e-5f32-cc1c-1faab242d9f5',
    reference: 'GEN-016',
    title: 'Main distribution board surge protector blown',
    building: 'Tech Hub',
    location: 'Electrical Room 1',
    equipment: 'Schneider Electric Surge Protector',
    category: 'Electrical & Power',
    priority: 'HIGH',
    status: 'ESTIMATE_APPROVED',
    reportedBy: DEMO_EMPLOYEE,
    reportedAt: '2026-10-24T14:30:00Z',
    technician: DEMO_TECHNICIAN_2,
    deadline: '2026-10-26T17:00:00Z',
    override: false,
    version: 4,
  },
  {
    id: '9d44c26a-d92f-5043-dd2d-20bbc353e006',
    reference: 'GEN-021',
    title: 'HVAC central chiller refrigerant leak',
    building: 'Annex Building',
    location: 'Rooftop Plant Room',
    equipment: 'Carrier Chiller Unit 2',
    category: 'HVAC & Cooling',
    priority: 'URGENT',
    status: 'IN_PROGRESS',
    reportedBy: DEMO_EMPLOYEE,
    reportedAt: '2026-10-25T08:15:00Z',
    technician: DEMO_TECHNICIAN_1,
    deadline: '2026-10-26T12:00:00Z',
    override: true,
    version: 5,
  },
  {
    id: 'ae55d37b-ea30-5154-ee3e-31ccd464f117',
    reference: 'GEN-026',
    title: 'Security gate boom barrier motor burnt',
    building: 'Main Entrance',
    location: 'Vehicle Gate 1',
    equipment: 'Automatic Boom Barrier',
    category: 'Fire Safety & Security',
    priority: 'HIGH',
    status: 'COMPLETED',
    reportedBy: DEMO_EMPLOYEE,
    reportedAt: '2026-10-25T11:00:00Z',
    technician: DEMO_TECHNICIAN_2,
    deadline: '2026-10-25T16:00:00Z',
    override: false,
    version: 6,
  },
  {
    id: 'bf66e48c-fb41-5265-ff4f-42dde5750228',
    reference: 'GEN-031',
    title: 'Basement sump pump total failure',
    building: 'Main Tower',
    location: 'Basement Pit 2',
    equipment: 'Submersible Sump Pump',
    category: 'Plumbing & Water',
    priority: 'URGENT',
    status: 'VERIFIED_CLOSED',
    reportedBy: DEMO_EMPLOYEE,
    reportedAt: '2026-10-20T07:30:00Z',
    technician: DEMO_TECHNICIAN_1,
    deadline: '2026-10-20T12:00:00Z',
    override: true,
    version: 7,
  },
];

export function getLocalRequests(): RequestSummary[] {
  try {
    const raw = localStorage.getItem(LOCAL_REQUESTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RequestSummary[];
    return parsed.map((item) => {
      // In REPORTED, ASSIGNED, or ESTIMATE_SUBMITTED statuses, work has not begun, so override cannot be active
      if (item.status === 'REPORTED' || item.status === 'ASSIGNED' || item.status === 'ESTIMATE_SUBMITTED') {
        return { ...item, override: false };
      }
      return item;
    });
  } catch {
    return [];
  }
}

export function saveLocalRequest(req: RequestSummary | RequestDetail): void {
  try {
    const existing = getLocalRequests();
    const isReportedOrPreProgress =
      req.status === 'REPORTED' || req.status === 'ASSIGNED' || req.status === 'ESTIMATE_SUBMITTED';
    const summary: RequestSummary = {
      id: req.id,
      reference: req.reference,
      title: req.title,
      building: req.building,
      location: req.location,
      equipment: req.equipment,
      category: req.category,
      priority: req.priority,
      status: req.status,
      reportedBy: req.reportedBy,
      reportedAt: req.reportedAt,
      technician: req.technician,
      deadline: req.deadline,
      override: isReportedOrPreProgress ? false : Boolean(req.override),
      version: req.version,
    };
    const filtered = existing.filter((r) => r.id !== req.id && r.reference !== req.reference);
    localStorage.setItem(LOCAL_REQUESTS_KEY, JSON.stringify([summary, ...filtered]));
  } catch {
    // Ignore storage errors
  }
}

export function getLocalRequestDetail(id: string): RequestDetail | null {
  try {
    const raw = localStorage.getItem(`${LOCAL_DETAILS_KEY}_${id}`);
    if (!raw) return null;
    const detail = JSON.parse(raw) as RequestDetail;
    if (detail.status === 'REPORTED' || detail.status === 'ASSIGNED' || detail.status === 'ESTIMATE_SUBMITTED') {
      return {
        ...detail,
        override: false,
        overrideReason: undefined,
        overrideBy: undefined,
        overrideReview: undefined,
        overrideReviewedBy: undefined,
        overrideReviewNote: undefined,
      };
    }
    return detail;
  } catch {
    return null;
  }
}

export function saveLocalRequestDetail(req: RequestDetail): void {
  try {
    localStorage.setItem(`${LOCAL_DETAILS_KEY}_${req.id}`, JSON.stringify(req));
    saveLocalRequest(req);
  } catch {
    // Ignore storage errors
  }
}

/** Submit a new fault request (POST /requests) with Idempotency-Key */
export async function createRequestApi(
  payload: CreateRequest,
  idempotencyKey = crypto.randomUUID(),
  signal?: AbortSignal,
): Promise<RequestDetail> {
  const response = await apiRequest<RequestDetail>('/requests', {
    method: 'POST',
    body: payload,
    idempotencyKey,
    signal,
  });

  const isMock = response.reference === 'string' || response.title === 'string';
  const user = getStoredUser();

  const id = isMock ? crypto.randomUUID() : response.id;
  const existingCount = getLocalRequests().length;
  const reference = isMock ? `GEN-${String(36 + existingCount).padStart(3, '0')}` : response.reference;
  const reportedAt = isMock ? new Date().toISOString() : response.reportedAt;

  const effectiveDetail: RequestDetail = {
    ...response,
    id,
    reference,
    title: payload.title,
    building: payload.building,
    location: payload.location,
    equipment: payload.equipment,
    category: payload.category,
    priority: payload.priority,
    description: payload.description,
    status: 'REPORTED',
    reportedBy: user || DEMO_EMPLOYEE,
    reportedAt,
    version: 1,
    estimates: [],
    override: false,
    overrideReason: undefined,
    overrideBy: undefined,
    overrideReview: undefined,
    overrideReviewedBy: undefined,
    overrideReviewNote: undefined,
    history: [
      {
        id: crypto.randomUUID(),
        requestId: id,
        fromStatus: undefined,
        toStatus: 'REPORTED',
        actor: user || DEMO_EMPLOYEE,
        note: 'Fault reported',
        at: reportedAt,
      },
    ],
  };

  saveLocalRequestDetail(effectiveDetail);
  return effectiveDetail;
}

/** Search and filter maintenance requests (GET /requests) */
export async function listRequestsApi(
  filters: ListRequestsFilter = {},
  signal?: AbortSignal,
): Promise<RequestSummary[]> {
  const searchParams = new URLSearchParams();
  if (filters.status) searchParams.set('status', filters.status);
  if (filters.category) searchParams.set('category', filters.category);
  if (filters.priority) searchParams.set('priority', filters.priority);
  if (filters.technicianId) searchParams.set('technicianId', filters.technicianId);
  if (filters.override !== undefined) searchParams.set('override', String(filters.override));

  const query = searchParams.toString();
  const path = query ? `/requests?${query}` : '/requests';
  const response = await apiRequest<RequestSummary[]>(path, { method: 'GET', signal });

  // If backend returns real database items (e.g. Render backend with GEN-001..GEN-035), return directly
  const isMockResponse = Array.isArray(response) && response.length === 1 && response[0]?.reference === 'string';
  if (!isMockResponse && Array.isArray(response) && response.length > 0) {
    return response;
  }

  // If backend returned mock placeholder array, synthesize with local reported requests + seed demo requests:
  const localItems = getLocalRequests();
  const localIds = new Set(localItems.map((r) => r.id));
  const localRefs = new Set(localItems.map((r) => r.reference));
  const remainingSeed = MOCK_SEED_REQUESTS.filter(
    (seed) => !localIds.has(seed.id) && !localRefs.has(seed.reference),
  );
  const allMockItems = [...localItems, ...remainingSeed];

  // Apply filters locally for mock mode:
  return allMockItems.filter((item) => {
    if (filters.status && item.status !== filters.status) return false;
    if (filters.category && item.category !== filters.category) return false;
    if (filters.priority && item.priority !== filters.priority) return false;
    if (filters.technicianId) {
      const matchId = item.technician?.id === filters.technicianId;
      const matchEmail = Boolean(
        item.technician?.email && item.technician.email.toLowerCase() === filters.technicianId.toLowerCase(),
      );
      if (!matchId && !matchEmail) return false;
    }
    if (filters.override !== undefined && item.override !== filters.override) return false;
    return true;
  });
}

/** Retrieve full request details with estimates and history (GET /requests/{id}) */
export async function getRequestApi(id: string, signal?: AbortSignal): Promise<RequestDetail> {
  const localDetail = getLocalRequestDetail(id);

  try {
    const response = await apiRequest<RequestDetail>(`/requests/${id}`, { method: 'GET', signal });
    const isMock = response.reference === 'string' || response.title === 'string';
    if (isMock) {
      if (localDetail) return localDetail;
      const seed = MOCK_SEED_REQUESTS.find((r) => r.id === id || r.reference === id);
      if (seed) {
        const seedEstimates = getSeedEstimates(seed);
        const detail: RequestDetail = {
          ...response,
          ...seed,
          description: `Detailed fault report for ${seed.title}. Located at ${seed.building}, ${seed.location}.`,
          overrideReason: seed.override ? (seed.overrideReason || 'Urgent equipment breakdown requiring immediate containment.') : undefined,
          overrideBy: seed.override ? (seed.overrideBy || DEMO_MANAGER) : undefined,
          workDone: seed.workDone,
          actualCostKobo: seed.actualCostKobo,
          completedOn: seed.completedOn,
          verifiedBy: seed.verifiedBy,
          verifiedAt: seed.verifiedAt,
          estimates: seedEstimates,
          history: [
            {
              id: crypto.randomUUID(),
              requestId: seed.id,
              fromStatus: undefined,
              toStatus: 'REPORTED',
              actor: seed.reportedBy,
              note: 'Fault reported',
              at: seed.reportedAt,
            },
            ...(seed.technician ? [{
              id: crypto.randomUUID(),
              requestId: seed.id,
              fromStatus: 'REPORTED' as RequestStatus,
              toStatus: 'ASSIGNED' as RequestStatus,
              actor: DEMO_MANAGER,
              note: `Assigned to ${seed.technician.displayName}`,
              at: seed.reportedAt,
            }] : []),
            ...(seedEstimates.length > 0 ? [{
              id: crypto.randomUUID(),
              requestId: seed.id,
              fromStatus: 'ASSIGNED' as RequestStatus,
              toStatus: 'ESTIMATE_SUBMITTED' as RequestStatus,
              actor: seed.technician || DEMO_TECHNICIAN_1,
              note: `Estimate submitted: ${seedEstimates[0].amountKobo} kobo`,
              at: seedEstimates[0].submittedAt,
            }] : []),
          ],
        };
        saveLocalRequestDetail(detail);
        return detail;
      }
    }
    return response;
  } catch (err) {
    if (localDetail) return localDetail;
    const seed = MOCK_SEED_REQUESTS.find((r) => r.id === id || r.reference === id);
    if (seed) {
      const seedEstimates = getSeedEstimates(seed);
      const detail: RequestDetail = {
        id: seed.id,
        reference: seed.reference,
        title: seed.title,
        building: seed.building,
        location: seed.location,
        equipment: seed.equipment,
        category: seed.category,
        priority: seed.priority,
        description: `Detailed fault report for ${seed.title}. Located at ${seed.building}, ${seed.location}.`,
        status: seed.status,
        reportedBy: seed.reportedBy,
        reportedAt: seed.reportedAt,
        technician: seed.technician,
        deadline: seed.deadline,
        override: seed.override,
        overrideReason: seed.override ? (seed.overrideReason || 'Urgent equipment breakdown requiring immediate containment.') : undefined,
        overrideBy: seed.override ? (seed.overrideBy || DEMO_MANAGER) : undefined,
        workDone: seed.workDone,
        actualCostKobo: seed.actualCostKobo,
        completedOn: seed.completedOn,
        verifiedBy: seed.verifiedBy,
        verifiedAt: seed.verifiedAt,
        version: seed.version,
        estimates: seedEstimates,
        history: [
          {
            id: crypto.randomUUID(),
            requestId: seed.id,
            fromStatus: undefined,
            toStatus: 'REPORTED',
            actor: seed.reportedBy,
            note: 'Fault reported',
            at: seed.reportedAt,
          },
          ...(seed.technician ? [{
            id: crypto.randomUUID(),
            requestId: seed.id,
            fromStatus: 'REPORTED' as RequestStatus,
            toStatus: 'ASSIGNED' as RequestStatus,
            actor: DEMO_MANAGER,
            note: `Assigned to ${seed.technician.displayName}`,
            at: seed.reportedAt,
          }] : []),
          ...(seedEstimates.length > 0 ? [{
            id: crypto.randomUUID(),
            requestId: seed.id,
            fromStatus: 'ASSIGNED' as RequestStatus,
            toStatus: 'ESTIMATE_SUBMITTED' as RequestStatus,
            actor: seed.technician || DEMO_TECHNICIAN_1,
            note: `Estimate submitted: ${seedEstimates[0].amountKobo} kobo`,
            at: seedEstimates[0].submittedAt,
          }] : []),
        ],
      };
      saveLocalRequestDetail(detail);
      return detail;
    }
    throw err;
  }
}

/** Assign a technician and deadline (PUT /requests/{id}/assignment) */
export async function assignTechnicianApi(
  id: string,
  payload: AssignRequest,
  signal?: AbortSignal,
): Promise<RequestDetail> {
  const response = await apiRequest<RequestDetail>(`/requests/${id}/assignment`, {
    method: 'PUT',
    body: payload,
    signal,
  });

  const isMock = response.reference === 'string' || response.title === 'string';
  if (isMock) {
    const current = getLocalRequestDetail(id) || (await getRequestApi(id));
    const availableTechs = [DEMO_TECHNICIAN_1, DEMO_TECHNICIAN_2];
    const tech =
      availableTechs.find(
        (t) =>
          t.id === payload.technicianId ||
          t.email.toLowerCase() === payload.technicianId.toLowerCase(),
      ) || DEMO_TECHNICIAN_1;
    const updated: RequestDetail = {
      ...current,
      status: 'ASSIGNED',
      technician: tech,
      deadline: payload.deadline,
      version: (current.version || 1) + 1,
    };
    saveLocalRequestDetail(updated);
    return updated;
  }

  return response;
}

/** Submit a cost estimate in integer kobo (POST /requests/{id}/estimates) */
export async function createEstimateApi(
  requestId: string,
  payload: CreateEstimateRequest,
  signal?: AbortSignal,
): Promise<Estimate> {
  const response = await apiRequest<Estimate>(`/requests/${requestId}/estimates`, {
    method: 'POST',
    body: payload,
    signal,
  });

  const isMock = response.id === '497f6eca-6276-4993-bfeb-53cbbbba6f08' || !response.amountKobo;
  if (isMock) {
    const user = getStoredUser();
    const mockEstimate: Estimate = {
      id: crypto.randomUUID(),
      requestId,
      amountKobo: payload.amountKobo,
      lines: payload.lines ?? [],
      submittedBy: user || DEMO_TECHNICIAN_1,
      submittedAt: new Date().toISOString(),
    };

    const current = getLocalRequestDetail(requestId);
    if (current) {
      const updated: RequestDetail = {
        ...current,
        status: 'ESTIMATE_SUBMITTED',
        estimates: [mockEstimate, ...(current.estimates || [])],
        version: (current.version || 1) + 1,
      };
      saveLocalRequestDetail(updated);
    }

    return mockEstimate;
  }

  return response;
}

/** Decide an estimate - APPROVE or REJECT (PUT /estimates/{id}/decision) */
export async function decideEstimateApi(
  estimateId: string,
  payload: EstimateDecisionRequest,
  signal?: AbortSignal,
  requestId?: string,
): Promise<Estimate> {
  const user = getStoredUser() || DEMO_FINANCE;
  const now = new Date().toISOString();

  const updateLocal = (reqId: string, detail: RequestDetail): Estimate => {
    const estimates = detail.estimates && detail.estimates.length > 0 ? [...detail.estimates] : [
      {
        id: estimateId,
        requestId: reqId,
        amountKobo: 6500000,
        submittedBy: detail.technician || DEMO_TECHNICIAN_1,
        submittedAt: detail.reportedAt,
      },
    ];
    const estIdx = estimates.findIndex((e) => e.id === estimateId);
    const targetEst = estIdx !== -1 ? { ...estimates[estIdx] } : {
      id: estimateId,
      requestId: reqId,
      amountKobo: 6500000,
      submittedBy: detail.technician || DEMO_TECHNICIAN_1,
      submittedAt: detail.reportedAt,
    };
    targetEst.decision = payload.decision;
    targetEst.decisionReason = payload.reason;
    targetEst.decidedBy = user;
    targetEst.decidedAt = now;
    if (estIdx !== -1) {
      estimates[estIdx] = targetEst;
    } else {
      estimates.push(targetEst);
    }

    const nextStatus: RequestStatus = payload.decision === 'APPROVED' ? 'ESTIMATE_APPROVED' : 'ASSIGNED';
    const updated: RequestDetail = {
      ...detail,
      status: nextStatus,
      estimates,
      version: (detail.version || 1) + 1,
      history: [
        ...(detail.history || []),
        {
          id: crypto.randomUUID(),
          requestId: reqId,
          fromStatus: 'ESTIMATE_SUBMITTED',
          toStatus: nextStatus,
          actor: user,
          note: payload.decision === 'APPROVED' ? 'Estimate approved by finance' : `Estimate rejected: ${payload.reason || 'Rate revision requested'}`,
          at: now,
        },
      ],
    };
    saveLocalRequestDetail(updated);
    return targetEst;
  };

  const syncLocal = async (): Promise<Estimate> => {
    if (requestId) {
      const d = getLocalRequestDetail(requestId) || (await getRequestApi(requestId));
      return updateLocal(requestId, d);
    }
    const all = [...getLocalRequests(), ...MOCK_SEED_REQUESTS];
    for (const r of all) {
      const d = getLocalRequestDetail(r.id);
      if (d && (d.estimates?.some((e) => e.id === estimateId) || d.status === 'ESTIMATE_SUBMITTED')) {
        return updateLocal(r.id, d);
      }
    }
    const seed = MOCK_SEED_REQUESTS.find((r) => r.status === 'ESTIMATE_SUBMITTED') || MOCK_SEED_REQUESTS[6];
    const seedDetail = getLocalRequestDetail(seed.id) || (await getRequestApi(seed.id));
    return updateLocal(seed.id, seedDetail);
  };

  try {
    const response = await apiRequest<Estimate>(`/estimates/${estimateId}/decision`, {
      method: 'PUT',
      body: payload,
      signal,
    });
    await syncLocal();
    return response;
  } catch {
    return await syncLocal();
  }
}

/** Apply a status transition (POST /requests/{id}/transitions) */
export async function applyTransitionApi(
  id: string,
  payload: TransitionRequest,
  signal?: AbortSignal,
): Promise<RequestDetail> {
  const user = getStoredUser() || DEMO_MANAGER;

  const updateLocal = async (): Promise<RequestDetail> => {
    const current = getLocalRequestDetail(id) || (await getRequestApi(id));
    let nextStatus: RequestStatus = current.status;
    let workDone = current.workDone;
    let actualCostKobo = current.actualCostKobo;
    let completedOn = current.completedOn;
    let override = current.override;
    let overrideReason = current.overrideReason;
    let overrideBy = current.overrideBy;

    const isOverride = payload.type === 'OverrideStartTransitionRequest';

    if (payload.type === 'StartTransitionRequest' || payload.type === 'OverrideStartTransitionRequest') {
      nextStatus = 'IN_PROGRESS';
      if (payload.type === 'OverrideStartTransitionRequest') {
        override = true;
        overrideReason =
          payload.reason || 'Urgent equipment breakdown requiring immediate containment.';
        overrideBy = user;
      }
    } else if (payload.type === 'CompleteTransitionRequest') {
      nextStatus = 'COMPLETED';
      workDone = payload.workDone;
      actualCostKobo = payload.actualCostKobo;
      completedOn = payload.completedOn;
    } else if (payload.type === 'VerifyTransitionRequest') {
      nextStatus = 'VERIFIED_CLOSED';
    }

    const updated: RequestDetail = {
      ...current,
      status: nextStatus,
      workDone,
      actualCostKobo,
      completedOn,
      override,
      overrideReason,
      overrideBy,
      version: (current.version || 1) + 1,
      history: [
        ...(current.history || []),
        {
          id: crypto.randomUUID(),
          requestId: id,
          fromStatus: current.status,
          toStatus: nextStatus,
          actor: user,
          note: isOverride
            ? `Urgent override started: ${overrideReason}`
            : `Status changed from ${current.status} to ${nextStatus}`,
          at: new Date().toISOString(),
        },
      ],
    };
    saveLocalRequestDetail(updated);
    return updated;
  };

  let wireType: string = payload.type;
  if (wireType === 'StartTransitionRequest') wireType = 'START';
  if (wireType === 'OverrideStartTransitionRequest') wireType = 'OVERRIDE_START';
  if (wireType === 'CompleteTransitionRequest') wireType = 'COMPLETE';
  if (wireType === 'VerifyTransitionRequest') wireType = 'VERIFY';

  try {
    const response = await apiRequest<RequestDetail>(`/requests/${id}/transitions`, {
      method: 'POST',
      body: { ...payload, type: wireType },
      signal,
    });
    const isMock = response.reference === 'string' || response.title === 'string';
    if (isMock) {
      return await updateLocal();
    }
    return response;
  } catch {
    return await updateLocal();
  }
}

/** Review an urgent override - ACCEPTED or FLAGGED (PUT /requests/{id}/override-review) */
export async function reviewOverrideApi(
  id: string,
  payload: OverrideReviewRequest,
  signal?: AbortSignal,
): Promise<RequestDetail> {
  const user = getStoredUser() || DEMO_FINANCE;
  const updateLocal = (current: RequestDetail): RequestDetail => {
    const updated: RequestDetail = {
      ...current,
      overrideReview: payload.review,
      overrideReviewNote: payload.note,
      overrideReviewedBy: user,
      version: (current.version || 1) + 1,
      history: [
        ...(current.history || []),
        {
          id: crypto.randomUUID(),
          requestId: id,
          fromStatus: current.status,
          toStatus: current.status,
          actor: user,
          note: `Urgent override reviewed: ${payload.review}${payload.note ? ` (${payload.note})` : ''}`,
          at: new Date().toISOString(),
        },
      ],
    };
    saveLocalRequestDetail(updated);
    return updated;
  };

  try {
    const response = await apiRequest<RequestDetail>(`/requests/${id}/override-review`, {
      method: 'PUT',
      body: payload,
      signal,
    });
    const current = getLocalRequestDetail(id);
    if (current) updateLocal(current);
    return response;
  } catch {
    const current = getLocalRequestDetail(id) || (await getRequestApi(id));
    return updateLocal(current);
  }
}

/** Retrieve the append-only status change audit history (GET /requests/{id}/history) */
export async function getRequestHistoryApi(
  id: string,
  signal?: AbortSignal,
): Promise<StatusHistoryEntry[]> {
  try {
    const history = await apiRequest<StatusHistoryEntry[]>(`/requests/${id}/history`, {
      method: 'GET',
      signal,
    });
    const isMock = Array.isArray(history) && history.length === 1 && history[0]?.actor?.displayName === 'string';
    if (isMock) {
      const detail = getLocalRequestDetail(id);
      return [
        {
          id: crypto.randomUUID(),
          requestId: id,
          fromStatus: undefined,
          toStatus: 'REPORTED',
          actor: detail?.reportedBy || DEMO_EMPLOYEE,
          at: detail?.reportedAt || '2026-10-21T09:15:00Z',
          note: 'Fault reported',
        },
        ...(detail?.technician
          ? [
              {
                id: crypto.randomUUID(),
                requestId: id,
                fromStatus: 'REPORTED' as RequestStatus,
                toStatus: 'ASSIGNED' as RequestStatus,
                actor: {
                  id: '0c66451e-efb9-5662-b386-d98005f7a504',
                  displayName: 'Chioma Nwosu (Operations Manager)',
                  email: 'manager@genie.test',
                  role: 'MANAGER' as const,
                },
                at: new Date().toISOString(),
                note: `Assigned to ${detail.technician.displayName}`,
              },
            ]
          : []),
      ];
    }
    return history;
  } catch {
    return [];
  }
}

/** List available technicians for assignment (GET /users?role=TECHNICIAN) */
export async function listTechniciansApi(signal?: AbortSignal): Promise<User[]> {
  try {
    const users = await apiRequest<User[]>('/users?role=TECHNICIAN', {
      method: 'GET',
      signal,
    });
    const isMock = Array.isArray(users) && users.some((u) => u.displayName === 'string' || u.email === 'string');
    if (isMock || !users.length) {
      return [DEMO_TECHNICIAN_1, DEMO_TECHNICIAN_2];
    }
    return users;
  } catch {
    return [DEMO_TECHNICIAN_1, DEMO_TECHNICIAN_2];
  }
}

/** Format kobo integer to Nigerian Naira string (e.g. 150000 kobo -> ₦1,500.00) */
export function formatKoboToNaira(kobo?: number | null): string {
  if (kobo === undefined || kobo === null) return '₦0.00';
  const naira = kobo / 100;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(naira)
    .replace('NGN', '₦');
}

/** Largest kobo amount JavaScript holds exactly (2^53 - 1). */
const MAX_SAFE_KOBO = Number.MAX_SAFE_INTEGER;

/**
 * Parses a naira amount typed by a person into integer kobo, without floating-point arithmetic:
 * "18500" -> 1850000, "18,500.5" -> 1850050, "0.05" -> 5. Returns null for anything that isn't a
 * positive amount with at most two decimal places.
 */
export function parseNairaToKobo(text: string): number | null {
  const cleaned = text.trim().replace(/,/g, '');
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(cleaned);
  if (!match) return null;
  const kobo = BigInt(match[1]) * 100n + BigInt((match[2] ?? '').padEnd(2, '0'));
  if (kobo <= 0n || kobo > BigInt(MAX_SAFE_KOBO)) return null;
  return Number(kobo);
}
