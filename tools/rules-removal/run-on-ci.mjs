// Rule-removal runner for GitHub Actions (same job as run-rule-removal.ps1, no Docker needed on your machine).
// For each rule in rules.json: remove the protection, run its test, restore the code, re-run the test (green).
// Nothing is ever committed: the edits live only in the throwaway CI checkout.
//
//   node tools/rules-removal/run-on-ci.mjs                 all rules
//   node tools/rules-removal/run-on-ci.mjs --only 02,05    rules whose id starts with 02 or 05
//   node tools/rules-removal/run-on-ci.mjs --dry           only check that every edit still applies (no Maven, no Docker)
//
// Logs and entries.md go to ./rule-removal-out/ (uploaded as an artifact by the workflow).
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, appendFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: here }).toString().trim();
const args = process.argv.slice(2);
const dry = args.includes('--dry');
const onlyIdx = args.indexOf('--only');
const only = onlyIdx >= 0 ? args[onlyIdx + 1].split(',').map((s) => s.trim()).filter(Boolean) : [];

let rules = JSON.parse(readFileSync(join(here, 'rules.json'), 'utf8'));
if (only.length) rules = rules.filter((r) => only.some((p) => r.id.startsWith(p)));
if (!rules.length) { console.error(`No rule matched --only ${only.join(',')}`); process.exit(2); }

const dirty = execFileSync('git', ['status', '--porcelain', '--', 'service'], { cwd: root }).toString().trim();
if (dirty) { console.error('service/ has uncommitted changes; refusing to run.\n' + dirty); process.exit(2); }

const outDir = resolve(root, 'rule-removal-out');
mkdirSync(outDir, { recursive: true });
const entries = join(outDir, 'entries.md');
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root }).toString().trim();
const today = new Date().toISOString().slice(0, 10);
writeFileSync(entries, `# Rule-removal entries\nCommit under test: ${sha}\nRun: ${today} on GitHub Actions${process.env.GITHUB_RUN_ID ? ` (run ${process.env.GITHUB_RUN_ID})` : ''}\n`);

function editFile(path, find, replace) {
  const full = join(root, path);
  const text = readFileSync(full, 'utf8');
  const crlf = text.includes('\r\n');
  let norm = text.replaceAll('\r\n', '\n');
  const i = norm.indexOf(find);
  if (i < 0) throw new Error(`Text to remove was not found in ${path}. The code changed since rules.json was written:\n${find}`);
  norm = norm.slice(0, i) + replace + norm.slice(i + find.length);
  writeFileSync(full, crlf ? norm.replaceAll('\n', '\r\n') : norm);
}

function restore() { execFileSync('git', ['checkout', '--', 'service'], { cwd: root }); }

function runTest(test, logPath) {
  const r = spawnSync('./mvnw',
    ['-B', 'clean', 'verify', `-Dit.test=${test}`, '-Dtest=NoUnitTests', '-Dsurefire.failIfNoSpecifiedTests=false'],
    { cwd: join(root, 'service'), encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  const text = (r.stdout ?? '') + (r.stderr ?? '');
  writeFileSync(logPath, text);
  return { code: r.status ?? 1, text };
}

// Anything that means "the test never really ran" is NOT evidence.
const SETUP_ERROR = /COMPILATION ERROR|Could not resolve|Cannot connect to the Docker|Could not find a valid Docker environment|ExceptionInInitializerError|NoClassDefFoundError|ApplicationContext failure threshold/;

function classify(code, text, test) {
  if (SETUP_ERROR.test(text)) return 'INVALID';
  if (code === 0) return 'STILL PASSES';
  if (/BUILD FAILURE/.test(text) && text.includes(test) && /Tests run:.*(Failures: [1-9]|Errors: [1-9])/.test(text)) return 'FAILS AS EXPECTED';
  return 'UNCLEAR';
}

const keyLines = (text) => text.split('\n')
  .filter((l) => /Tests run:|FAIL|Expecting|expected|but was|Status expected|AssertionFailedError/.test(l))
  .slice(0, 20).join('\n');

const summary = [];
for (const r of rules) {
  console.log(`\n=== ${r.id}: ${r.rule} (test: ${r.test}) ===`);
  let verdict = '', output = '', changed = '', green = 'not run';
  try {
    for (const e of r.edits) editFile(e.file, e.find, e.replace);
    changed = execFileSync('git', ['diff', '--name-only'], { cwd: root }).toString().trim().split('\n').join(', ');
    if (dry) { verdict = 'EDITS APPLY (dry run)'; }
    else {
      const { code, text } = runTest(r.test, join(outDir, `${r.id}-FAILS.log`));
      verdict = classify(code, text, r.test);
      output = keyLines(text);
    }
  } catch (err) {
    verdict = 'INVALID';
    output = String(err.message);
  } finally {
    restore();
  }
  if (!dry && verdict === 'FAILS AS EXPECTED') {
    const { code } = runTest(r.test, join(outDir, `${r.id}-PASSES.log`));
    green = code === 0 ? 'BUILD SUCCESS' : 'FAILED (investigate)';
  }
  appendFileSync(entries, `
### ${r.id}: ${r.rule}
- Date / by: ${today} / <your name> (GitHub Actions)
- Files changed: ${changed}
- Command: \`cd service && ./mvnw -B clean verify -Dit.test=${r.test} -Dtest=NoUnitTests -Dsurefire.failIfNoSpecifiedTests=false\`
- Result: ${verdict}
- Output:
\`\`\`
${output}
\`\`\`
- Restored, green re-run: ${green} (${today})
`);
  summary.push({ id: r.id, test: r.test, verdict, green });
}

const rows = summary.map((s) => `| ${s.id} | ${s.test} | ${s.verdict} | ${s.green} |`).join('\n');
const table = `| Rule | Test | Result with protection removed | Green after restore |\n|---|---|---|---|\n${rows}\n`;
console.log('\n' + table);
writeFileSync(join(outDir, 'summary.md'), table);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Rule-removal evidence\nCommit \`${sha}\`\n\n${table}`);

const bad = summary.some((s) => (dry ? s.verdict !== 'EDITS APPLY (dry run)' : s.verdict !== 'FAILS AS EXPECTED' || s.green !== 'BUILD SUCCESS'));
process.exit(bad ? 1 : 0);
