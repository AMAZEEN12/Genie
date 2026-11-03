import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import type { User } from '../../api/auth';
import { AuthContext } from '../../app/authContext';
import { ReceiptsPage } from './ReceiptsPage';

// jsdom polyfills for dialog and URL
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.open = true;
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.open = false;
  });
  window.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/mock-receipt');
  window.URL.revokeObjectURL = vi.fn();
  window.confirm = vi.fn(() => true);
  localStorage.clear();
});

const TECH_USER: User = {
  id: '01a755a8-ed55-52eb-be2c-6851900a07e3',
  displayName: 'Emeka Obi (Lead Technician)',
  email: 'technician@genie.test',
  role: 'TECHNICIAN',
};

const MANAGER_USER: User = {
  id: 'b2c9d1e4-5f6a-4b8c-9d0e-1f2a3b4c5d6e',
  displayName: 'Amina Manager',
  email: 'manager@genie.test',
  role: 'MANAGER',
};

const FINANCE_USER: User = {
  id: 'c3d0e2f5-6a7b-4c9d-0e1f-2a3b4c5d6e7f',
  displayName: 'Chioma Finance',
  email: 'finance@genie.test',
  role: 'FINANCE',
};

function renderReceiptsPage(user: User = TECH_USER) {
  localStorage.setItem('genie_user', JSON.stringify(user));

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
        token: 'mock-token',
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
      }}
    >
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/receipts']}>
          <ReceiptsPage />
        </MemoryRouter>
      </QueryClientProvider>
    </AuthContext.Provider>,
  );
}

describe('ReceiptsPage', () => {
  it('renders role header, upload button, filter tabs, and receipt list for TECHNICIAN', async () => {
    renderReceiptsPage(TECH_USER);

    expect(screen.getByRole('heading', { name: /my receipts/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload receipt/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText('generator_fuel_filters_invoice.pdf').length).toBeGreaterThan(0);
    });

    expect(screen.getAllByText('ac_compressor_coolant_r410a.jpg').length).toBeGreaterThan(0);
  });

  it('filters receipts when clicking status tabs', async () => {
    renderReceiptsPage(TECH_USER);

    await waitFor(() => {
      expect(screen.getAllByText('generator_fuel_filters_invoice.pdf').length).toBeGreaterThan(0);
    });

    // Click 'Submitted' tab
    const submittedTab = screen.getByRole('button', { name: /submitted/i });
    fireEvent.click(submittedTab);

    // Submitted item should remain, approved item should be filtered out
    expect(screen.getAllByText('ac_compressor_coolant_r410a.jpg').length).toBeGreaterThan(0);
    expect(screen.queryByText('generator_fuel_filters_invoice.pdf')).not.toBeInTheDocument();

    // Click 'All' tab to reset
    const allTab = screen.getByRole('button', { name: /^all/i });
    fireEvent.click(allTab);

    expect(screen.getAllByText('generator_fuel_filters_invoice.pdf').length).toBeGreaterThan(0);
  });

  it('filters receipts based on search query', async () => {
    renderReceiptsPage(TECH_USER);

    await waitFor(() => {
      expect(screen.getAllByText('generator_fuel_filters_invoice.pdf').length).toBeGreaterThan(0);
    });

    const searchInput = screen.getByPlaceholderText(/search receipts/i);
    fireEvent.change(searchInput, { target: { value: 'coolant' } });

    expect(screen.getAllByText('ac_compressor_coolant_r410a.jpg').length).toBeGreaterThan(0);
    expect(screen.queryByText('generator_fuel_filters_invoice.pdf')).not.toBeInTheDocument();
  });

  it('opens upload modal and enforces file type and size validation', async () => {
    renderReceiptsPage(TECH_USER);

    const uploadBtns = screen.getAllByRole('button', { name: /upload receipt/i });
    fireEvent.click(uploadBtns[0]);

    expect(screen.getByRole('heading', { name: /upload receipt/i })).toBeInTheDocument();

    const fileInput = screen.getByLabelText(/choose receipt file/i);

    // 1. Invalid file extension (.exe)
    const invalidFile = new File(['dummy binary content'], 'malware.exe', { type: 'application/x-msdownload' });
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    expect(screen.getByRole('alert')).toHaveTextContent(/invalid file type/i);

    // 2. Oversized file (> 10MB)
    const largeFile = new File(['a'.repeat(100)], 'huge_invoice.pdf', { type: 'application/pdf' });
    Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 });
    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    expect(screen.getByRole('alert')).toHaveTextContent(/file is too large/i);

    // 3. Valid image file
    const validFile = new File(['fake image bytes'], 'test_receipt.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [validFile] } });

    expect(screen.getByText('test_receipt.png')).toBeInTheDocument();

    // Submit upload inside modal (last button with name Upload Receipt)
    const allUploadBtns = screen.getAllByRole('button', { name: /upload receipt/i });
    const modalSubmitBtn = allUploadBtns[allUploadBtns.length - 1];
    expect(modalSubmitBtn).not.toBeDisabled();
    fireEvent.click(modalSubmitBtn);

    await waitFor(() => {
      expect(screen.getAllByText('test_receipt.png').length).toBeGreaterThan(0);
    });
  });

  it('opens receipt viewer modal and displays streamed file details', async () => {
    renderReceiptsPage(TECH_USER);

    await waitFor(() => {
      expect(screen.getAllByText('generator_fuel_filters_invoice.pdf').length).toBeGreaterThan(0);
    });

    const viewButtons = screen.getAllByRole('button', { name: /view/i });
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'generator_fuel_filters_invoice.pdf' })).toBeInTheDocument();
    });

    expect(screen.getByText(/private delivery/i)).toBeInTheDocument();
    expect(screen.getByText(/download pdf document/i)).toBeInTheDocument();
  });

  it('renders Manager decision actions for direct reports and restricts self-approval', async () => {
    renderReceiptsPage(MANAGER_USER);

    expect(screen.getByRole('heading', { name: /team receipts & approvals/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText('ac_compressor_coolant_r410a.jpg').length).toBeGreaterThan(0);
    });

    // Direct report submitted receipt shows Approve & Reject buttons
    const approveButtons = screen.getAllByRole('button', { name: /^approve$/i });
    expect(approveButtons.length).toBeGreaterThan(0);

    // Click Approve on direct report's receipt
    fireEvent.click(approveButtons[0]);

    await waitFor(() => {
      // Receipt updates to approved
      expect(screen.getAllByText(/approved/i).length).toBeGreaterThan(0);
    });

    // Opening Manager's own receipt shows self-approval prohibited notice
    const ownReceiptRows = screen.getAllByText('emergency_leak_patch_supplies.webp');
    fireEvent.click(ownReceiptRows[0]);

    await waitFor(() => {
      expect(screen.getByText(/self-approval prohibited/i)).toBeInTheDocument();
    });
  });

  it('renders Finance reimbursement action on approved receipts and handles export', async () => {
    renderReceiptsPage(FINANCE_USER);

    expect(screen.getByRole('heading', { name: /receipts & reimbursements/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText('generator_fuel_filters_invoice.pdf').length).toBeGreaterThan(0);
    });

    // Approved receipt has 'Reimburse' button
    const reimburseButtons = screen.getAllByRole('button', { name: /reimburse/i });
    expect(reimburseButtons.length).toBeGreaterThan(0);

    fireEvent.click(reimburseButtons[0]);

    await waitFor(() => {
      expect(screen.getAllByText(/reimbursed/i).length).toBeGreaterThan(0);
    });

    // Export CSV
    const exportBtn = screen.getByRole('button', { name: /export csv/i });
    fireEvent.click(exportBtn);
  });

  it('allows uploader to delete a submitted receipt', async () => {
    renderReceiptsPage(TECH_USER);

    await waitFor(() => {
      expect(screen.getAllByText('ac_compressor_coolant_r410a.jpg').length).toBeGreaterThan(0);
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete receipt/i });
    expect(deleteButtons.length).toBeGreaterThan(0);

    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('ac_compressor_coolant_r410a.jpg')).not.toBeInTheDocument();
    });
  });

  it('renders receipts safely without crashing even if format or resourceType is undefined (R31 bugfix)', async () => {
    const rawBackendReceipt = {
      id: 'a1000000-0000-0000-0000-999999999999',
      orgId: '00000000-0000-0000-0000-000000000001',
      uploadedBy: TECH_USER.id,
      managerId: 'b2c9d1e4-5f6a-4b8c-9d0e-1f2a3b4c5d6e',
      status: 'submitted' as const,
      originalName: 'valve_fitting_receipt.png',
      bytes: 123450,
      createdAt: '2026-11-03T11:00:00Z',
    };
    localStorage.setItem('genie_local_receipts', JSON.stringify([rawBackendReceipt]));

    renderReceiptsPage(TECH_USER);

    await waitFor(() => {
      expect(screen.getAllByText('valve_fitting_receipt.png').length).toBeGreaterThan(0);
    });

    // Verify it safely derived PNG badge from filename without throwing TypeError
    expect(screen.getAllByText('PNG').length).toBeGreaterThan(0);
  });
});
