import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { routes } from '../../app/router';
import { AuthProvider } from '../../app/auth';

/**
 * MVP feedback items 2 and 4 (small screens). jsdom has no layout engine, so these check the
 * Tailwind classes that decide alignment below and above the `sm` breakpoint.
 */
function renderHome() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: 'UP', database: 'UP' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  );
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AuthProvider>
        <RouterProvider router={createMemoryRouter(routes, { initialEntries: ['/'] })} />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe('Home page layout on small screens', () => {
  it('right-aligns the Login and Get started buttons at every width (item 2)', () => {
    renderHome();
    const header = screen.getByRole('navigation', { name: 'Main Navigation' }).parentElement!;

    expect(header.className).toContain('justify-end');
    expect(header.className).not.toMatch(/(^|\s)justify-center(\s|$)/);
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Get started' })).toBeInTheDocument();
  });

  it('centres the hero text and the Report a fault button on small screens, left-aligned from sm up (item 4)', () => {
    renderHome();
    const hero = screen.getByRole('main');
    const cta = screen.getByRole('button', { name: /report or manage a fault/i });

    expect(hero.className).toContain('items-center');
    expect(hero.className).toContain('text-center');
    expect(hero.className).toContain('sm:items-start');
    expect(hero.className).toContain('sm:text-left');
    expect(cta.parentElement!.className).toContain('justify-center');
    expect(cta.parentElement!.className).toContain('sm:justify-start');
    expect(screen.getByRole('heading', { level: 1 }).className).not.toContain('text-left');
  });
});
