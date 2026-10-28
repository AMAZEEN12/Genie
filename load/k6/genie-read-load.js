// OPTIONAL for Genie (the side-project standard does not require a load test).
// Light read load against the deployed service. Run on a schedule you can afford:
//   k6 run -e BASE=https://genie-t2s5.onrender.com/api/v1 load/k6/genie-read-load.js
// Each step runs for 45 s at a fixed arrival rate. Saturation point = first step whose p95 passes the target
// or whose error rate passes 1% (read it from the per-step lines in the end-of-test summary).
import http from 'k6/http';
import { check } from 'k6';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const BASE = (__ENV.BASE || 'http://localhost:8080/api/v1').replace(/\/$/, '');
const PASSWORD = __ENV.DEMO_PASSWORD || 'Genie-Demo-2026';
const TARGET_P95_MS = Number(__ENV.TARGET_P95 || 800);
const RATES = (__ENV.RATES || '2,5,10,20,40').split(',').map(Number);
const STEP = '45s';

const scenarios = {};
const thresholds = { 'http_req_failed': ['rate<0.01'] };
RATES.forEach((rate, i) => {
  const name = `rate_${rate}`;
  scenarios[name] = { executor: 'constant-arrival-rate', rate, timeUnit: '1s', duration: STEP, preAllocatedVUs: Math.max(10, rate * 2), maxVUs: rate * 10, startTime: `${i * 50}s`, exec: 'list' };
  thresholds[`http_req_duration{scenario:${name}}`] = [{ threshold: `p(95)<${TARGET_P95_MS}`, abortOnFail: false }];
});

export const options = {
  scenarios,
  thresholds,
  summaryTrendStats: ['avg', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
};

export function setup() {
  const r = http.post(`${BASE}/auth/sessions`, JSON.stringify({ email: 'manager@genie.test', password: PASSWORD }), { headers: { 'Content-Type': 'application/json' } });
  check(r, { 'login 201': (x) => x.status === 201 });
  return { token: r.json('token') };
}

export function list(data) {
  const r = http.get(`${BASE}/requests`, { headers: { Authorization: `Bearer ${data.token}`, 'X-Request-Id': uuidv4() } });
  check(r, { '200': (x) => x.status === 200 });
}
