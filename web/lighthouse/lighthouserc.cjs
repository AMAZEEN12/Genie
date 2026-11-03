// Lighthouse CI for the Genie web app. Run from the web/ folder:
//   WEB_URL=https://your-genie.vercel.app API_URL=https://genie-t2s5.onrender.com/api/v1 npx @lhci/cli@0.14.0 autorun --config=lighthouse/lighthouserc.cjs
// Pages: the home page, then the request list as a signed-in manager (login handled by login.cjs).
const WEB = (process.env.WEB_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');

module.exports = {
  ci: {
    collect: {
      url: [`${WEB}/`, `${WEB}/requests`],
      numberOfRuns: 3,                       // LHCI reports the median run
      puppeteerScript: './lighthouse/login.cjs',
      puppeteerLaunchOptions: { args: ['--no-sandbox'] },
      settings: {
        preset: 'desktop',                   // delete this line for the mobile profile
        chromeFlags: '--no-sandbox',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
      },
    },
    upload: { target: 'filesystem', outputDir: './lighthouse/results' },
  },
};
