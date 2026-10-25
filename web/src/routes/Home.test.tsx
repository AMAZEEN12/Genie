import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { routes } from '../app/router';
import { AuthProvider } from '../app/auth';

function renderAt(path: string) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={client}>
      <AuthProvider>
        <RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

function respondWith(status: number, body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation((url: string) => {
      if (url.includes('/health')) {
        return Promise.resolve(
          new Response(JSON.stringify({ status: 'UP', database: 'UP' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify(body), {
          status,
          headers: { 'Content-Type': status >= 400 ? 'application/problem+json' : 'application/json' },
        }),
      );
    }),
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe('Home & Login', () => {
  it('renders brand wordmark, tagline, and navigation buttons', async () => {
    respondWith(200, { status: 'UP' });
    renderAt('/');

    expect(screen.getByLabelText('Genie')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Close the loop on every repair/i);
    expect(screen.getByRole('button', { name: /^login$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^get started$/i })).toBeInTheDocument();
  });

  it('shows the service status as operational when health check passes', async () => {
    respondWith(200, { status: 'UP', database: 'UP' });
    renderAt('/');

    expect(await screen.findByText(/Service operational/i)).toBeInTheDocument();
  });

  it('sends an X-Request-Id header with every API request', async () => {
    respondWith(200, { status: 'UP' });
    renderAt('/');

    await screen.findByText(/Service operational/i);
    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['X-Request-Id']).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('shows the error state when the service is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    renderAt('/');

    expect(await screen.findByText(/Service offline/i)).toBeInTheDocument();
  });

  it('opens and closes the login modal overlay via Login and close buttons', async () => {
    respondWith(200, { status: 'UP' });
    renderAt('/');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const topLoginBtn = screen.getByRole('button', { name: /^login$/i });
    fireEvent.click(topLoginBtn);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole('heading', { name: /Welcome back/i })).toBeInTheDocument();

    const closeBtn = within(dialog).getByRole('button', { name: /close/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the login modal when Get started button is clicked', () => {
    respondWith(200, { status: 'UP' });
    renderAt('/');

    fireEvent.click(screen.getByRole('button', { name: /^get started$/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('pre-fills credentials when a demo role button is clicked', () => {
    respondWith(200, { status: 'UP' });
    renderAt('/');

    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));
    const dialog = screen.getByRole('dialog');

    const employeeDemoBtn = within(dialog).getByRole('button', { name: /^employee$/i });
    fireEvent.click(employeeDemoBtn);

    const emailInput = within(dialog).getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = within(dialog).getByLabelText(/^password/i) as HTMLInputElement;

    expect(emailInput.value).toBe('employee@genie.test');
    expect(passwordInput.value).toBe('Genie-Demo-2026');
  });

  it('toggles password visibility between text and password', () => {
    respondWith(200, { status: 'UP' });
    renderAt('/');

    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));
    const dialog = screen.getByRole('dialog');

    const passwordInput = within(dialog).getByLabelText(/^password/i) as HTMLInputElement;
    const toggleBtn = within(dialog).getByRole('button', { name: /^show$/i });

    expect(passwordInput.type).toBe('password');
    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe('text');
    expect(within(dialog).getByRole('button', { name: /^hide$/i })).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: /^hide$/i }));
    expect(passwordInput.type).toBe('password');
  });

  it('displays an error alert on invalid credentials', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('/health')) {
          return Promise.resolve(new Response(JSON.stringify({ status: 'UP' }), { status: 200 }));
        }
        return Promise.resolve(
          new Response(
            JSON.stringify({
              status: 401,
              title: 'Unauthorized',
              detail: 'Invalid credentials',
            }),
            {
              status: 401,
              headers: { 'Content-Type': 'application/problem+json' },
            },
          ),
        );
      }),
    );

    renderAt('/');
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));
    const dialog = screen.getByRole('dialog');

    fireEvent.change(within(dialog).getByLabelText(/email/i), { target: { value: 'wrong@genie.test' } });
    fireEvent.change(within(dialog).getByLabelText(/^password/i), { target: { value: 'wrongpass' } });

    const submitBtn = within(dialog).getByRole('button', { name: /^login$/i });
    fireEvent.click(submitBtn);

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(/Wrong email or password\. Try again\./i);
  });

  it('successfully logs in and stores token in localStorage', async () => {
    const mockSession = {
      token: 'mock-jwt-token-xyz',
      expiresAt: '2026-10-26T08:00:00Z',
      user: {
        id: '20f89bc1-9ac5-5637-8cf7-90d23a80f420',
        email: 'employee@genie.test',
        displayName: 'Tunde Balogun (Employee)',
        role: 'EMPLOYEE',
      },
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('/health')) {
          return Promise.resolve(new Response(JSON.stringify({ status: 'UP' }), { status: 200 }));
        }
        if (url.includes('/auth/sessions')) {
          return Promise.resolve(
            new Response(JSON.stringify(mockSession), {
              status: 201,
              headers: { 'Content-Type': 'application/json' },
            }),
          );
        }
        return Promise.resolve(new Response('{}', { status: 200 }));
      }),
    );

    renderAt('/');
    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));
    const dialog = screen.getByRole('dialog');

    fireEvent.click(within(dialog).getByRole('button', { name: /^employee$/i }));
    const submitBtn = within(dialog).getByRole('button', { name: /^login$/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(localStorage.getItem('genie_token')).toBe('mock-jwt-token-xyz');
    });
  });

  it('shows a not-found page for unknown addresses', () => {
    respondWith(200, { status: 'UP' });
    renderAt('/no-such-page');
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });
});
