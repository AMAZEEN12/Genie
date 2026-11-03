// Runs before each Lighthouse page load: signs in through the API and stores the session where the app looks for it.
// The app keeps its session in localStorage under genie_token and genie_user (web/src/service/httpclient/client.ts).
module.exports = async (browser, context) => {
  const web = (process.env.WEB_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
  const api = (process.env.API_URL || 'http://127.0.0.1:8080/api/v1').replace(/\/$/, '');
  const email = process.env.LH_EMAIL || 'manager@genie.test';
  const password = process.env.DEMO_PASSWORD || 'Genie-Demo-2026';

  const res = await fetch(`${api}/auth/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (res.status !== 201) throw new Error(`Lighthouse login failed: ${res.status} ${await res.text()}`);
  const session = await res.json();

  const page = await browser.newPage();
  await page.goto(web, { waitUntil: 'domcontentloaded' });
  await page.evaluate((s) => {
    localStorage.setItem('genie_token', s.token);
    localStorage.setItem('genie_user', JSON.stringify(s.user));
  }, session);
  await page.close();
};
