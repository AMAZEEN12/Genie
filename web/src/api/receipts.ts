import { getStoredUser } from './client';
import * as receiptsApi from '../service/api/receipts.api';
import type { ReceiptModel, ReceiptStatus } from '../service/models/receipt.models';

export type { ReceiptModel, ReceiptStatus };

const LOCAL_RECEIPTS_KEY = 'genie_local_receipts';
const DELETED_RECEIPTS_KEY = 'genie_deleted_receipt_ids';

export const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000001';

export const MOCK_SEED_RECEIPTS: ReceiptModel[] = [
  {
    id: 'a1000000-0000-0000-0000-000000000001',
    orgId: DEMO_ORG_ID,
    uploadedBy: '01a755a8-ed55-52eb-be2c-6851900a07e3', // Emeka (Technician 1)
    managerId: 'b2c9d1e4-5f6a-4b8c-9d0e-1f2a3b4c5d6e', // Amina (Manager)
    status: 'approved',
    originalName: 'generator_fuel_filters_invoice.pdf',
    format: 'pdf',
    resourceType: 'raw',
    bytes: 1420500,
    createdAt: '2026-10-31T09:30:00Z',
    decidedBy: 'b2c9d1e4-5f6a-4b8c-9d0e-1f2a3b4c5d6e',
    decidedAt: '2026-10-31T14:15:00Z',
    reimbursedBy: null,
    reimbursedAt: null,
  },
  {
    id: 'a1000000-0000-0000-0000-000000000002',
    orgId: DEMO_ORG_ID,
    uploadedBy: '01a755a8-ed55-52eb-be2c-6851900a07e3', // Emeka (Technician 1)
    managerId: 'b2c9d1e4-5f6a-4b8c-9d0e-1f2a3b4c5d6e', // Amina (Manager)
    status: 'submitted',
    originalName: 'ac_compressor_coolant_r410a.jpg',
    format: 'jpg',
    resourceType: 'image',
    bytes: 2350800,
    createdAt: '2026-11-01T11:00:00Z',
    decidedBy: null,
    decidedAt: null,
    reimbursedBy: null,
    reimbursedAt: null,
  },
  {
    id: 'a1000000-0000-0000-0000-000000000003',
    orgId: DEMO_ORG_ID,
    uploadedBy: '8ee1fe13-dc91-5486-93f1-a95e68809973', // Fatima (Technician 2)
    managerId: 'b2c9d1e4-5f6a-4b8c-9d0e-1f2a3b4c5d6e', // Amina (Manager)
    status: 'reimbursed',
    originalName: 'copper_pipes_and_valves_receipt.png',
    format: 'png',
    resourceType: 'image',
    bytes: 980400,
    createdAt: '2026-10-28T16:20:00Z',
    decidedBy: 'b2c9d1e4-5f6a-4b8c-9d0e-1f2a3b4c5d6e',
    decidedAt: '2026-10-29T10:00:00Z',
    reimbursedBy: 'c3d0e2f5-6a7b-4c9d-0e1f-2a3b4c5d6e7f', // Chioma (Finance)
    reimbursedAt: '2026-10-30T15:45:00Z',
  },
  {
    id: 'a1000000-0000-0000-0000-000000000004',
    orgId: DEMO_ORG_ID,
    uploadedBy: 'b2c9d1e4-5f6a-4b8c-9d0e-1f2a3b4c5d6e', // Amina (Manager - own upload)
    managerId: null,
    status: 'submitted',
    originalName: 'emergency_leak_patch_supplies.webp',
    format: 'webp',
    resourceType: 'image',
    bytes: 650200,
    createdAt: '2026-11-01T13:45:00Z',
    decidedBy: null,
    decidedAt: null,
    reimbursedBy: null,
    reimbursedAt: null,
  },
];

export function getLocalReceipts(): ReceiptModel[] {
  try {
    const raw = localStorage.getItem(LOCAL_RECEIPTS_KEY);
    return raw ? (JSON.parse(raw) as ReceiptModel[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalReceipt(receipt: ReceiptModel): void {
  try {
    const current = getLocalReceipts();
    const idx = current.findIndex((r) => r.id === receipt.id);
    if (idx >= 0) {
      current[idx] = receipt;
    } else {
      current.unshift(receipt);
    }
    localStorage.setItem(LOCAL_RECEIPTS_KEY, JSON.stringify(current));
  } catch {
    // Ignore storage errors
  }
}

export function getDeletedReceiptIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_RECEIPTS_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function deleteLocalReceipt(id: string): void {
  try {
    const current = getLocalReceipts();
    const next = current.filter((r) => r.id !== id);
    localStorage.setItem(LOCAL_RECEIPTS_KEY, JSON.stringify(next));

    const deleted = getDeletedReceiptIds();
    deleted.add(id);
    localStorage.setItem(DELETED_RECEIPTS_KEY, JSON.stringify(Array.from(deleted)));
  } catch {
    // Ignore storage errors
  }
}

function getAllMockReceipts(): ReceiptModel[] {
  const deleted = getDeletedReceiptIds();
  const local = getLocalReceipts().filter((r) => !deleted.has(r.id));
  const localIds = new Set(local.map((r) => r.id));
  const remainingSeed = MOCK_SEED_RECEIPTS.filter((s) => !localIds.has(s.id) && !deleted.has(s.id));
  return [...local, ...remainingSeed];
}

export function normalizeReceipt(r: ReceiptModel): ReceiptModel {
  const ext = r.originalName ? r.originalName.split('.').pop()?.toLowerCase() || 'file' : 'file';
  const isPdf = ext === 'pdf';
  return {
    ...r,
    format: r.format || ext,
    resourceType: r.resourceType || (isPdf ? 'raw' : 'image'),
  };
}

/**
 * List receipts filtered for current user role and permissions.
 */
export async function getReceiptsList(): Promise<ReceiptModel[]> {
  try {
    const list = await receiptsApi.listReceipts();
    return list.map(normalizeReceipt);
  } catch {
    const user = getStoredUser();
    const all = getAllMockReceipts().map(normalizeReceipt);

    if (!user) return all;

    if (user.role === 'TECHNICIAN') {
      return all.filter((r) => r.uploadedBy === user.id || r.uploadedBy === '01a755a8-ed55-52eb-be2c-6851900a07e3');
    }

    if (user.role === 'MANAGER') {
      // Manager sees own and direct reports
      return all.filter(
        (r) =>
          r.uploadedBy === user.id ||
          r.managerId === user.id ||
          r.managerId === 'b2c9d1e4-5f6a-4b8c-9d0e-1f2a3b4c5d6e',
      );
    }

    // Finance sees all
    return all;
  }
}

export async function uploadReceiptFile(file: File): Promise<ReceiptModel> {
  try {
    const uploaded = await receiptsApi.uploadReceipt(file);
    return normalizeReceipt(uploaded);
  } catch {
    const user = getStoredUser();
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const isPdf = ext === 'pdf';

    const newReceipt: ReceiptModel = {
      id: crypto.randomUUID(),
      orgId: DEMO_ORG_ID,
      uploadedBy: user?.id || '01a755a8-ed55-52eb-be2c-6851900a07e3',
      managerId: user?.role === 'TECHNICIAN' ? 'b2c9d1e4-5f6a-4b8c-9d0e-1f2a3b4c5d6e' : null,
      status: 'submitted',
      originalName: file.name,
      format: ext,
      resourceType: isPdf ? 'raw' : 'image',
      bytes: file.size,
      createdAt: new Date().toISOString(),
      decidedBy: null,
      decidedAt: null,
      reimbursedBy: null,
      reimbursedAt: null,
    };

    saveLocalReceipt(newReceipt);
    return newReceipt;
  }
}

export async function decideReceiptAction(id: string, decision: 'approved' | 'rejected'): Promise<ReceiptModel> {
  try {
    const decided = await receiptsApi.decideReceipt(id, decision);
    return normalizeReceipt(decided);
  } catch {
    const user = getStoredUser();
    const all = getAllMockReceipts();
    const found = all.find((r) => r.id === id);
    if (!found) {
      throw new Error('Receipt not found');
    }

    // Prevent self-approval in mock mode
    if (found.uploadedBy === user?.id) {
      throw new Error('Managers cannot approve their own receipt (SELF_APPROVAL)');
    }

    const updated: ReceiptModel = {
      ...found,
      status: decision,
      decidedBy: user?.id || 'b2c9d1e4-5f6a-4b8c-9d0e-1f2a3b4c5d6e',
      decidedAt: new Date().toISOString(),
    };

    saveLocalReceipt(updated);
    return updated;
  }
}

export async function reimburseReceiptAction(id: string): Promise<ReceiptModel> {
  try {
    const reimbursed = await receiptsApi.reimburseReceipt(id);
    return normalizeReceipt(reimbursed);
  } catch {
    const user = getStoredUser();
    const all = getAllMockReceipts();
    const found = all.find((r) => r.id === id);
    if (!found) {
      throw new Error('Receipt not found');
    }

    if (found.status !== 'approved') {
      throw new Error('Only approved receipts can be reimbursed');
    }

    const updated: ReceiptModel = {
      ...found,
      status: 'reimbursed',
      reimbursedBy: user?.id || 'c3d0e2f5-6a7b-4c9d-0e1f-2a3b4c5d6e7f',
      reimbursedAt: new Date().toISOString(),
    };

    saveLocalReceipt(updated);
    return updated;
  }
}

export async function deleteReceiptAction(id: string): Promise<void> {
  try {
    await receiptsApi.deleteReceipt(id);
  } catch {
    deleteLocalReceipt(id);
  }
}

export async function downloadReceiptBlob(id: string): Promise<Blob> {
  try {
    return await receiptsApi.fetchReceiptBlob(id);
  } catch (err) {
    // In mock mode or offline demo seed data without live backend
    const isMockSeed = id.startsWith('a1000000-');
    const isOffline = err instanceof Error && (err.message.includes('Network error') || (err as { problem?: { status?: number } }).problem?.status === 0);

    if (isMockSeed || isOffline) {
      // Valid SVG XML placeholder for offline mock preview
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
          <rect width="600" height="800" fill="#1A1A1A"/>
          <rect x="40" y="40" width="520" height="720" rx="16" fill="#111111" stroke="#333333" stroke-width="2"/>
          <text x="300" y="120" font-family="sans-serif" font-size="28" font-weight="bold" fill="#E1EE04" text-anchor="middle">GENIE RECEIPT PREVIEW</text>
          <line x1="80" y1="160" x2="520" y2="160" stroke="#444444" stroke-width="1"/>
          <text x="80" y="210" font-family="monospace" font-size="16" fill="#A8A8A8">Receipt ID: ${id.slice(0, 18)}...</text>
          <text x="80" y="250" font-family="sans-serif" font-size="16" fill="#FFFFFF">Private Authenticated Stream</text>
          <rect x="80" y="290" width="440" height="320" rx="10" fill="#222222" stroke="#444444"/>
          <text x="300" y="460" font-family="sans-serif" font-size="20" fill="#888888" text-anchor="middle">Receipt Content Streamed Securely</text>
          <text x="300" y="490" font-family="sans-serif" font-size="14" fill="#666666" text-anchor="middle">Cache-Control: private, no-store</text>
          <text x="300" y="700" font-family="sans-serif" font-size="14" fill="#555555" text-anchor="middle">Genie Maintenance &amp; Facility Operations</text>
        </svg>
      `;
      return new Blob([svg], { type: 'image/svg+xml' });
    }

    // Propagate backend error for real receipts so UI surfaces accurate problem details
    throw err;
  }
}
