#!/usr/bin/env node
/**
 * Fail if day-1 scaffold wiring exists in apps/demo but is missing from
 * templates/vite-react (or required packages). Run via `pnpm audit:scaffold`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const demo = path.join(root, 'apps/demo');
const tmpl = path.join(root, 'templates/vite-react');

const errors = [];

function exists(p) {
  return fs.existsSync(p);
}

function read(p) {
  return exists(p) ? fs.readFileSync(p, 'utf8') : '';
}

function mustExist(rel, base = tmpl) {
  if (!exists(path.join(base, rel)))
    errors.push(`missing file: ${path.relative(root, path.join(base, rel))}`);
}

function mustContain(rel, needle, base = tmpl) {
  const full = path.join(base, rel);
  if (!exists(full)) {
    errors.push(`missing file for content check: ${path.relative(root, full)}`);
    return;
  }
  if (!read(full).includes(needle)) {
    errors.push(`missing content "${needle}" in ${path.relative(root, full)}`);
  }
}

/** Paths that must exist in the template (day-1 scaffold). */
const DAY1_FILES = [
  'src/App.tsx',
  'src/main.tsx',
  'src/config/env.ts',
  'src/lib/api.ts',
  'src/lib/query-client.ts',
  'src/lib/sentry.ts',
  'src/stores/theme-store.ts',
  'src/routes/router.tsx',
  'src/components/app-layout.tsx',
  'src/components/not-found-page.tsx',
  'src/features/auth/login-page.tsx',
  'src/features/auth/schemas/login.ts',
  'src/features/home/home-page.tsx',
  'src/features/admin/admin-page.tsx',
  'src/features/access/access-page.tsx',
  'src/test/setup.ts',
  'src/lib/api.test.ts',
  'vite.config.ts',
  'vitest.config.ts',
  'eslint.config.js',
  'public/config.js',
  '.env.example',
  '.gitignore',
];

for (const f of DAY1_FILES) mustExist(f);

/** Capabilities that must appear in template source (parity with demo day-1). */
const CAPABILITIES = [
  ['src/App.tsx', 'QueryClientProvider'],
  ['src/App.tsx', 'Toaster'],
  ['src/App.tsx', 'TooltipProvider'],
  ['src/main.tsx', 'initSentry'],
  ['src/config/env.ts', 'z.object'],
  ['src/config/env.ts', 'VITE_SENTRY_DSN'],
  ['src/lib/api.ts', 'createHttpClient'],
  ['src/stores/theme-store.ts', 'useThemeStore'],
  ['src/routes/router.tsx', 'requirePermission'],
  ['src/routes/router.tsx', 'ErrorBoundary'],
  ['src/routes/router.tsx', 'lazyRouteComponent'],
  ['src/features/auth/login-page.tsx', 'zodResolver'],
  ['vite.config.ts', 'platformManualChunks'],
  ['vite.config.ts', '@vgururaj/http'],
  ['package.json', '"@tanstack/react-query"'],
  ['package.json', '"@sentry/react"'],
  ['package.json', '"zustand"'],
  ['package.json', '"vitest"'],
  ['package.json', '"react-hook-form"'],
  ['public/config.js', 'VITE_SENTRY_DSN'],
];

for (const [rel, needle] of CAPABILITIES) mustContain(rel, needle);

/** Shared packages / scripts the scaffold owns. */
const PACKAGE_FILES = [
  'packages/ui/src/components/error-boundary.tsx',
  'packages/http/src/index.ts',
  'packages/eslint-config/vite-app.js',
  'packages/eslint-config/package-lib.js',
  'scripts/vite-manual-chunks.mjs',
];

for (const rel of PACKAGE_FILES) {
  if (!exists(path.join(root, rel))) errors.push(`missing scaffold asset: ${rel}`);
}

mustContain('packages/ui/src/index.ts', 'ErrorBoundary', root);
mustContain('packages/http/src/index.ts', 'createHttpClient', root);
mustContain('.gitignore', '*.tsbuildinfo', root);

/** Docker build stage must include anything Vite configs import from repo root. */
const dockerfile = read(path.join(root, 'Dockerfile'));
if (!dockerfile.includes('COPY scripts')) {
  errors.push(
    'Dockerfile must COPY scripts/ (demo vite.config imports scripts/vite-manual-chunks.mjs)',
  );
}
mustContain('apps/demo/vite.config.ts', 'vite-manual-chunks', root);

/** Demo must not keep a local ErrorBoundary implementation. */
const demoBoundary = path.join(demo, 'src/components/error-boundary.tsx');
if (exists(demoBoundary)) {
  const body = read(demoBoundary);
  if (!body.includes("from '@vgururaj/ui'") || body.includes('getDerivedStateFromError')) {
    errors.push('apps/demo must use ErrorBoundary from @vgururaj/ui (no local implementation)');
  }
}

if (errors.length) {
  console.error('Scaffold parity audit failed:\n');
  for (const e of errors) console.error(`  - ${e}`);
  console.error(`\n${errors.length} issue(s). See docs/ARCHITECTURE.md (Demo file ownership).`);
  process.exit(1);
}

console.log('Scaffold parity audit OK (template day-1 + shared packages).');
