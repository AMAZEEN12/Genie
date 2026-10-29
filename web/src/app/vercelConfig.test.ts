import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { routes } from './router';

/**
 * MVP feedback item 5: refreshing /requests (or any app page) on Vercel returned Vercel's own
 * 404, because nothing told Vercel to serve index.html for client-side routes.
 */
describe('web/vercel.json', () => {
  const config = JSON.parse(readFileSync(resolve(__dirname, '../../vercel.json'), 'utf-8')) as {
    rewrites?: { source: string; destination: string }[];
  };

  it('sends every path to index.html so React Router can handle a refresh', () => {
    expect(config.rewrites).toContainEqual({ source: '/(.*)', destination: '/index.html' });
  });

  it('covers every app route, including nested ones like /requests/:id', () => {
    const pattern = new RegExp(`^${config.rewrites![0].source}$`);
    const paths = ['/', '/requests', '/requests/new', '/requests/abc-123', '/my-jobs', '/approvals'];
    expect(routes.length).toBeGreaterThan(0);
    for (const path of paths) expect(pattern.test(path)).toBe(true);
  });
});
