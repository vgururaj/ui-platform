#!/usr/bin/env node
/**
 * Fails if pnpm audit reports high/critical findings not in security/audit-allowlist.json.
 * Also fails if any allowlist entry has an expired `expires` date (YYYY-MM-DD).
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const allowlistPath = join(root, 'security/audit-allowlist.json');

const allowlist = JSON.parse(readFileSync(allowlistPath, 'utf8'));
const exceptions = Array.isArray(allowlist.exceptions) ? allowlist.exceptions : [];
const today = new Date().toISOString().slice(0, 10);

const expired = exceptions.filter((e) => e.expires && e.expires < today);
if (expired.length) {
  console.error('Expired audit allowlist entries (remove or extend expires):');
  for (const e of expired) {
    console.error(`  - ${e.id} (${e.package}) expired ${e.expires} owner=${e.owner}`);
  }
  process.exit(1);
}

const allowedIds = new Set(exceptions.map((e) => String(e.id)));

const result = spawnSync('pnpm', ['audit', '--json'], {
  cwd: root,
  encoding: 'utf8',
  maxBuffer: 20 * 1024 * 1024,
  shell: process.platform === 'win32',
});

let report;
try {
  const stdout = result.stdout?.trim() || '';
  // pnpm may print non-JSON warnings; take the last JSON object
  const start = stdout.indexOf('{');
  if (start === -1) {
    if (result.status === 0) {
      console.log('pnpm audit: no findings (or empty report).');
      process.exit(0);
    }
    console.error('pnpm audit failed and produced no JSON.');
    console.error(result.stderr || stdout);
    process.exit(result.status || 1);
  }
  report = JSON.parse(stdout.slice(start));
} catch (err) {
  console.error('Failed to parse pnpm audit JSON:', err.message);
  console.error(result.stderr || result.stdout);
  process.exit(1);
}

/** @type {{ id: string, severity: string, package: string, title: string }[]} */
const findings = [];

const advisories = report.advisories ?? report.vulnerabilities ?? null;

if (advisories && typeof advisories === 'object' && !Array.isArray(advisories)) {
  for (const [key, adv] of Object.entries(advisories)) {
    const severity = String(adv.severity ?? adv.severityLabel ?? '').toLowerCase();
    if (severity !== 'high' && severity !== 'critical') continue;
    findings.push({
      id: String(adv.id ?? adv.github_advisory_id ?? key),
      severity,
      package: String(adv.module_name ?? adv.name ?? adv.package ?? 'unknown'),
      title: String(adv.title ?? adv.overview ?? ''),
    });
  }
}

// pnpm 9+ sometimes uses metadata.vulnerabilities counts only; also walk "actions"
if (!findings.length && Array.isArray(report.actions)) {
  for (const action of report.actions) {
    for (const resolve of action.resolves ?? []) {
      const severity = String(resolve.severity ?? '').toLowerCase();
      if (severity !== 'high' && severity !== 'critical') continue;
      findings.push({
        id: String(resolve.id ?? resolve.advisory ?? 'unknown'),
        severity,
        package: String(resolve.path?.split('>')?.pop() ?? 'unknown'),
        title: '',
      });
    }
  }
}

// Fallback: pnpm audit --json nested under "advisories" missing — use top-level severity map from newer formats
if (!findings.length && report.metadata?.vulnerabilities) {
  const counts = report.metadata.vulnerabilities;
  const high = (counts.high ?? 0) + (counts.critical ?? 0);
  if (high > 0 && Object.keys(advisories ?? {}).length === 0) {
    // Re-run human-readable audit to help the developer; still fail closed if counts say high/critical
    console.error(
      `pnpm audit reports ${counts.critical ?? 0} critical and ${counts.high ?? 0} high, but advisory details were not in JSON.`,
    );
    console.error(
      'Run `pnpm audit` for details, then fix or add security/audit-allowlist.json entries.',
    );
    process.exit(1);
  }
}

const blocking = findings.filter((f) => !allowedIds.has(String(f.id)));

if (blocking.length) {
  console.error('High/critical vulnerabilities must be fixed or allowlisted:\n');
  for (const f of blocking) {
    console.error(`  [${f.severity}] ${f.package} id=${f.id} ${f.title}`.trim());
  }
  console.error(
    '\nFix via upgrade, or add an entry to security/audit-allowlist.json (CODEOWNERS review).',
  );
  process.exit(1);
}

if (findings.length) {
  console.log(`OK: ${findings.length} high/critical finding(s) covered by allowlist.`);
} else {
  console.log('OK: no high/critical vulnerabilities.');
}
process.exit(0);
