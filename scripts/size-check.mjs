#!/usr/bin/env node
/**
 * Fail if package dist JS bundles grow past budgets (packages only — not demo/MSW).
 */
import { readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Soft budgets for initial scaffold; tighten over time. */
const budgets = [
  { name: '@vgururaj/ui', dir: 'packages/ui/dist', maxBytes: 250_000 },
  { name: '@vgururaj/auth', dir: 'packages/auth/dist', maxBytes: 80_000 },
  { name: '@vgururaj/http', dir: 'packages/http/dist', maxBytes: 20_000 },
];

function totalJsBytes(dir) {
  if (!existsSync(dir)) return null;
  let total = 0;
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.js') && !name.endsWith('.mjs')) continue;
    total += statSync(join(dir, name)).size;
  }
  return total;
}

let failed = false;
for (const b of budgets) {
  const dir = join(root, b.dir);
  const size = totalJsBytes(dir);
  if (size === null) {
    console.error(`${b.name}: missing ${b.dir} — run pnpm build first`);
    failed = true;
    continue;
  }
  const kb = (size / 1024).toFixed(1);
  const maxKb = (b.maxBytes / 1024).toFixed(1);
  if (size > b.maxBytes) {
    console.error(`${b.name}: ${kb} KiB > budget ${maxKb} KiB`);
    failed = true;
  } else {
    console.log(`${b.name}: ${kb} KiB (budget ${maxKb} KiB)`);
  }
}

process.exit(failed ? 1 : 0);
