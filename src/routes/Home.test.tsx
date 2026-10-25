import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { routes } from '../app/router';

function renderAt(path: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={createMemoryRouter(routes, { initialEntries: [path] })} />
    </QueryClientProvider>,
  );
}

function respondWith(status: number, body: unknown) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(body), {
    status, headers: { 'Content-Type': status >= 400 ? 'application/problem+json' : 'application/json' },
  })));
}

afterEach(() => vi.unstubAllGlobals());

describe('Home', () => {
  it('shows the service as up', async () => {
    respondWith(200, { status: 'UP', database: 'UP' });
    renderAt('/');
    expect(screen.getByRole('heading', { name: 'Report a fault, follow the repair' })).toBeInTheDocument();
    expect(await screen.findByText('Service is up')).toBeInTheDocument();
  });

  it('sends an X-Request-Id', async () => {
    respondWith(200, { status: 'UP' });
    renderAt('/');
    await screen.findByText('Service is up');
    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['X-Request-Id']).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('shows the error state when the service is down', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    renderAt('/');
    expect(await screen.findByText(/Service unreachable/)).toBeInTheDocument();
  });

  it('shows a not-found page for unknown addresses', () => {
    respondWith(200, { status: 'UP' });
    renderAt('/no-such-page');
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });
});
