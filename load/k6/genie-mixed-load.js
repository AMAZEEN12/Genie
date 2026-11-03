// Genie mixed workload: mostly reads (list + detail), a few writes (report a fault).
// Reads and writes run at the same time, each at a fixed arrival rate, in steps. Each step lasts 45 s.
//
//   k6 run -e BASE=https://genie-t2s5.onrender.com/api/v1 load/k6/genie-mixed-load.js
//   k6 run -e BASE=... -e RATES=2,5,10 -e WRITE_RATIO=0.1 --summary-export=load/results/mixed.json load/k6/genie-mixed-load.js
//
// Env: BASE (api url incl. /api/v1), DEMO_PASSWORD, RATES (reads per second, one step each),
//      WRITE_RATIO (writes as a share of reads, default 0.1), TARGET_P95 (ms, default 800).
// Saturation point = first step whose p95 passes the target or whose error rate passes 1%.
// It creates real (fictional) faults in the target database. Do not point it at data you care about.
import http from 'k6/http';
import { check, sleep } from 'k6';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const BASE = (__ENV.BASE || 'http://localhost:8080/api/v1').replace(/\/$/, '');
const PASSWORD = __ENV.DEMO_PASSWORD || 'Genie-Demo-2026';
const TARGET_P95_MS = Number(__ENV.TARGET_P95 || 800);
const RATES = (__ENV.RATES || '2,5,10,20').split(',').map(Number);
const WRITE_RATIO = Number(__ENV.WRITE_RATIO || 0.1);
const STEP_SECONDS = 45, GAP_SECONDS = 5;
const JSON_HEADERS = { 'Content-Type': 'application/json' };

const scenarios = {};
const thresholds = { http_req_failed: ['rate<0.01'] };
RATES.forEach((rate, i) => {
  const start = `${i * (STEP_SECONDS + GAP_SECONDS)}s`;
  const common = { executor: 'constant-arrival-rate', timeUnit: '1s', duration: `${STEP_SECONDS}s`, startTime: start };
  scenarios[`read_${rate}`] = { ...common, rate, preAllocatedVUs: Math.max(10, rate * 2), maxVUs: rate * 10, exec: 'browse' };
  const writeRate = Math.max(1, Math.round(rate * WRITE_RATIO));
  scenarios[`write_${rate}`] = { ...common, rate: writeRate, preAllocatedVUs: 5, maxVUs: 30, exec: 'report' };
  thresholds[`http_req_duration{scenario:read_${rate}}`] = [{ threshold: `p(95)<${TARGET_P95_MS}`, abortOnFail: false }];
  thresholds[`http_req_duration{scenario:write_${rate}}`] = [{ threshold: `p(95)<${TARGET_P95_MS * 2}`, abortOnFail: false }];
});

export const options = { scenarios, thresholds, summaryTrendStats: ['avg', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'] };

function login(email) {
  const r = http.post(`${BASE}/auth/sessions`, JSON.stringify({ email, password: PASSWORD }), { headers: JSON_HEADERS });
  if (r.status !== 201) throw new Error(`login ${email} -> ${r.status} ${r.body}`);
  return r.json('token');
}

export function setup() {
  // Render's free tier sleeps. Wake it first so the first step is not measuring a cold start.
  for (let i = 0; i < 18; i++) {
    const h = http.get(`${BASE}/health`, { timeout: '10s' });
    if (h.status === 200) break;
    sleep(5);
  }
  const manager = login('manager@genie.test');
  const employee = login('employee@genie.test');
  const list = http.get(`${BASE}/requests`, { headers: { Authorization: `Bearer ${manager}` } });
  const ids = (list.json() || []).slice(0, 20).map((x) => x.id);
  return { manager, employee, ids };
}

export function browse(d) {
  const auth = { headers: { Authorization: `Bearer ${d.manager}`, 'X-Request-Id': uuidv4() }, tags: { name: 'GET /requests' } };
  const l = http.get(`${BASE}/requests`, auth);
  check(l, { 'list 200': (r) => r.status === 200 });
  if (d.ids.length) {
    const id = d.ids[Math.floor(Math.random() * d.ids.length)];
    const g = http.get(`${BASE}/requests/${id}`, { ...auth, tags: { name: 'GET /requests/{id}' } });
    check(g, { 'detail 200': (r) => r.status === 200 });
  }
}

export function report(d) {
  const body = { title: `Load test ${uuidv4().slice(0, 8)}`, description: 'Created by k6 (fictional)', building: 'Main Tower', location: 'Floor 2', equipment: 'AC-201', category: 'HVAC', priority: 'MEDIUM' };
  const r = http.post(`${BASE}/requests`, JSON.stringify(body), {
    headers: { ...JSON_HEADERS, Authorization: `Bearer ${d.employee}`, 'Idempotency-Key': uuidv4(), 'X-Request-Id': uuidv4() },
    tags: { name: 'POST /requests' },
  });
  check(r, { 'create 201': (x) => x.status === 201 });
                       }
