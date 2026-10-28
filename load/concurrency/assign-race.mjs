#!/usr/bin/env node
// Deployed concurrency check for Genie rule R4 (one assignment wins, the rest get 409).
// Needs Node 18+ (built-in fetch). No dependencies.
//
//   node load/concurrency/assign-race.mjs --base https://genie-t2s5.onrender.com/api/v1 --n 10
//
// Env (defaults are the public demo accounts from the README):
//   EMPLOYEE_EMAIL  employee@genie.test     MANAGER_EMAIL  manager@genie.test
//   DEMO_PASSWORD   Genie-Demo-2026
// It creates ONE new fault, then fires N parallel PUT /requests/{id}/assignment.
// Exit 0 only if exactly one request returned 200 and every other returned 409.
import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > -1 ? process.argv[i + 1] : d; };
const BASE = (arg('base', process.env.SERVICE_URL || 'http://localhost:8080/api/v1')).replace(/\/$/, '');
const N = Number(arg('n', 10));
const PASSWORD = process.env.DEMO_PASSWORD || 'Genie-Demo-2026';
const EMPLOYEE = process.env.EMPLOYEE_EMAIL || 'employee@genie.test';
const MANAGER = process.env.MANAGER_EMAIL || 'manager@genie.test';

async function call(method, path, { token, body, headers = {} } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': randomUUID(),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = null;
  try { json = await res.json(); } catch { /* empty or non-JSON body */ }
  return { status: res.status, json };
}

async function waitForService() {
  for (let i = 0; i < 18; i++) { // Render free tier can take about a minute to wake
    try { const r = await fetch(BASE + '/health'); if (r.ok) return; } catch { /* retry */ }
    console.log(`waiting for service to wake (${i + 1}/18)...`);
    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error('service did not answer /health in 90 s');
}

async function login(email) {
  const r = await call('POST', '/auth/sessions', { body: { email, password: PASSWORD } });
  if (r.status !== 201) throw new Error(`login ${email} -> ${r.status}`);
  return r.json.token;
}

await waitForService();
const [emp, mgr] = [await login(EMPLOYEE), await login(MANAGER)];

const created = await call('POST', '/requests', {
  token: emp,
  headers: { 'Idempotency-Key': randomUUID() },
  body: { title: `Race test ${new Date().toISOString()}`, description: 'Created by assign-race.mjs (fictional)', building: 'Main Tower', location: 'Floor 2', equipment: 'AC-201', category: 'HVAC', priority: 'MEDIUM' },
});
if (created.status !== 201) throw new Error(`create request -> ${created.status} ${JSON.stringify(created.json)}`);
const reqId = created.json.id;
const version = created.json.version ?? 1;

const users = await call('GET', '/users?role=TECHNICIAN', { token: mgr });
const list = Array.isArray(users.json) ? users.json : users.json?.items ?? [];
if (!list.length) throw new Error('no technicians returned by GET /users?role=TECHNICIAN');

// Fire all N at once. Each tries a different technician so a wrong winner is detectable.
const deadline = new Date(Date.now() + 3 * 86400_000).toISOString();
const results = await Promise.all(Array.from({ length: N }, (_, i) =>
  call('PUT', `/requests/${reqId}/assignment`, { token: mgr, body: { technicianId: list[i % list.length].id, deadline, version } })
));

const tally = {};
for (const r of results) tally[r.status] = (tally[r.status] || 0) + 1;
const summary = Object.entries(tally).sort().map(([s, c]) => `${s} x${c}`).join(', ');

const after = await call('GET', `/requests/${reqId}`, { token: mgr });
const ok = tally[200] === 1 && tally[409] === N - 1;
console.log(`results: ${summary}`);
console.log(`request ${reqId} final status: ${after.json?.status}, technician: ${after.json?.technician?.id ?? after.json?.technicianId ?? 'n/a'}`);
console.log(ok ? 'PASS: exactly one assignment succeeded' : 'FAIL: expected one 200 and the rest 409');

mkdirSync(new URL('../results/', import.meta.url), { recursive: true });
const out = new URL(`../results/assign-race-${Date.now()}.json`, import.meta.url);
writeFileSync(out, JSON.stringify({ at: new Date().toISOString(), base: BASE, n: N, tally, ok, requestId: reqId, finalStatus: after.json?.status }, null, 2));
console.log(`saved ${out.pathname}`);
process.exit(ok ? 0 : 1);
