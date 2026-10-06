#!/usr/bin/env node
/**
 * Write config.js (window.__ENV__) from dynamic sources — no hardcoded app keys.
 *
 * Merge order (later wins):
 *   1. Process env vars matching CONFIG_PREFIX (default: VITE_)
 *   2. All parameters under AWS_SSM_PATH (leaf name = key), if set
 *
 * If AWS_SSM_PATH is set and yields no parameters, exits 1 (never leave stale local defaults).
 * If neither source yields keys and CONFIG_OUT already exists, leaves it unchanged (exit 0) — local defaults.
 *
 * Examples:
 *   VITE_API_BASE_URL=https://api.example.com pnpm config:generate
 *   AWS_SSM_PATH=/ui-platform/staging pnpm config:generate
 *   CONFIG_PREFIX=APP_ AWS_SSM_PATH=/myapp/production pnpm config:generate
 *   CONFIG_OUT=apps/demo/dist/config.js pnpm config:generate
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outRel = process.env.CONFIG_OUT || 'apps/demo/public/config.js';
const outPath = join(root, outRel);
const prefix = process.env.CONFIG_PREFIX || 'VITE_';

function jsEscape(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

/** @returns {Record<string, string>} */
function loadFromProcessEnv(keyPrefix) {
  /** @type {Record<string, string>} */
  const map = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith(keyPrefix)) continue;
    if (value === undefined) continue;
    map[key] = value;
  }
  return map;
}

/** @returns {Record<string, string>} */
function loadFromSsm(pathPrefix) {
  const result = spawnSync(
    'aws',
    [
      'ssm',
      'get-parameters-by-path',
      '--path',
      pathPrefix,
      '--recursive',
      '--with-decryption',
      '--query',
      'Parameters[*].[Name,Value]',
      '--output',
      'json',
    ],
    { encoding: 'utf8' },
  );

  if (result.status !== 0) {
    console.error(result.stderr || result.stdout || 'aws ssm get-parameters-by-path failed');
    process.exit(result.status || 1);
  }

  /** @type {string[][]} */
  const rows = JSON.parse(result.stdout || '[]');
  /** @type {Record<string, string>} */
  const map = {};
  for (const [name, value] of rows) {
    const key = name.split('/').filter(Boolean).pop();
    if (key) map[key] = value ?? '';
  }
  return map;
}

/** @type {Record<string, string>} */
const values = {
  ...loadFromProcessEnv(prefix),
  ...(process.env.AWS_SSM_PATH ? loadFromSsm(process.env.AWS_SSM_PATH) : {}),
};

const keys = Object.keys(values);
if (keys.length === 0) {
  if (process.env.AWS_SSM_PATH) {
    console.error(
      `AWS_SSM_PATH=${process.env.AWS_SSM_PATH} returned no parameters. ` +
        `Refusing to leave a stale ${outRel} (would risk shipping local/demo defaults).`,
    );
    process.exit(1);
  }
  if (existsSync(outPath)) {
    console.log(`No ${prefix}* env — left existing ${outRel} unchanged`);
    process.exit(0);
  }
  console.error(
    `No config keys found. Export ${prefix}* variables and/or set AWS_SSM_PATH, ` +
      `or keep a committed ${outRel} for local defaults.`,
  );
  process.exit(1);
}

const entries = keys
  .sort()
  .map((key) => `  ${key}: "${jsEscape(values[key])}"`)
  .join(',\n');

const body = `window.__ENV__ = {\n${entries}\n};\n`;

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, body, 'utf8');
console.log(`Wrote ${outRel} (${keys.length} keys, prefix=${prefix})`);
for (const key of keys.sort()) {
  const sensitive = /SECRET|TOKEN|PASSWORD|DSN|KEY/i.test(key);
  console.log(`  ${key}=${sensitive && values[key] ? '(set)' : values[key]}`);
}
