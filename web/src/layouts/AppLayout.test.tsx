import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';
import type { User } from '../api/auth';
import { AuthContext } from '../app/authContext';
import { AppLayout } from './AppLayout';

const mockLogout = vi.fn();

function renderWithAuth(
  initialPath: string,
  user: User | null,
  isAuthenticated: boolean,
  isLoading = false,
) {
  return render(
    <AuthContext.Provider
      value={{
        user,
        token: user ? 'mock-token' : null,
        isAuthenticated,
        isLoading,
        login: vi.fn(),
        logout: mockLogout,
      }}
    >
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<div>Landing Content</div>} />
            <Route path="requests" element={<div>Requests Page</div>} />
            <Route path="requests/new" element={<div>New Request Page</div>} />
            <Route path="my-jobs" element={<div>My Jobs Page</div>} />
            <Route path="approvals" element={<div>Approvals Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('AppLayout Shell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders landing page content without sidebar on root path', () => {
    renderWithAuth('/', null, false);
    expect(screen.getByText('Landing Content')).toBeInTheDocument();
    expect(screen.queryByLabelText('Sidebar navigation')).not.toBeInTheDocument();
  });

  it('shows sign-in prompt when unauthenticated user visits protected route', () => {
    renderWithAuth('/requests', null, false);
    expect(screen.getByText('Session expired or sign-in required')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /return to home/i })).toBeInTheDocument();
  });

  it('renders navigation links and user avatar for EMPLOYEE', () => {
    const employee: User = {
      id: 'e1',
      displayName: 'Fatima Bello',
      email: 'employee@genie.test',
      role: 'EMPLOYEE',
    };
    renderWithAuth('/requests', employee, true);

    expect(screen.getByLabelText('Sidebar navigation')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /report a fault/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /my requests/i })).toBeInTheDocument();
    expect(screen.getAllByText('Fatima Bello').length).toBeGreaterThan(0);
    expect(screen.getAllByText('EMPLOYEE').length).toBeGreaterThan(0);
  });

  it('renders navigation links for MANAGER', () => {
    const manager: User = {
      id: 'm1',
      displayName: 'Amina Manager',
      email: 'manager@genie.test',
      role: 'MANAGER',
    };
    renderWithAuth('/requests', manager, true);

    expect(screen.getByRole('link', { name: /all requests/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /report a fault/i })).toBeInTheDocument();
  });

  it('renders navigation links for TECHNICIAN', () => {
    const tech: User = {
      id: 't1',
      displayName: 'Tunde Repair',
      email: 'tech@genie.test',
      role: 'TECHNICIAN',
    };
    renderWithAuth('/my-jobs', tech, true);

    expect(screen.getByRole('link', { name: /my jobs/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /all requests/i })).toBeInTheDocument();
  });

  it('renders navigation links for FINANCE', () => {
    const finance: User = {
      id: 'f1',
      displayName: 'Chioma Finance',
      email: 'finance@genie.test',
      role: 'FINANCE',
    };
    renderWithAuth('/approvals', finance, true);

    expect(screen.getByRole('link', { name: /approvals/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /all requests/i })).toBeInTheDocument();
  });

  it('opens and closes the mobile drawer', () => {
    const manager: User = {
      id: 'm1',
      displayName: 'Amina Manager',
      email: 'manager@genie.test',
      role: 'MANAGER',
    };
    renderWithAuth('/requests', manager, true);

    const openButton = screen.getByRole('button', { name: /open navigation menu/i });
    fireEvent.click(openButton);

    expect(screen.getByRole('dialog', { name: /navigation drawer/i })).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /close menu/i });
    fireEvent.click(closeButton);

    expect(screen.queryByRole('dialog', { name: /navigation drawer/i })).not.toBeInTheDocument();
  });

  it('closes mobile drawer on Escape key press', () => {
    const manager: User = {
      id: 'm1',
      displayName: 'Amina Manager',
      email: 'manager@genie.test',
      role: 'MANAGER',
    };
    renderWithAuth('/requests', manager, true);

    const openButton = screen.getByRole('button', { name: /open navigation menu/i });
    fireEvent.click(openButton);
    expect(screen.getByRole('dialog', { name: /navigation drawer/i })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: /navigation drawer/i })).not.toBeInTheDocument();
  });

  it('calls logout when Log out button is clicked', () => {
    const manager: User = {
      id: 'm1',
      displayName: 'Amina Manager',
      email: 'manager@genie.test',
      role: 'MANAGER',
    };
    renderWithAuth('/requests', manager, true);

    const logoutButtons = screen.getAllByRole('button', { name: /log out/i });
    fireEvent.click(logoutButtons[0]);
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
