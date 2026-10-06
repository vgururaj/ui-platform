#!/usr/bin/env node
/**
 * Run gitleaks against the git repo (not a raw directory walk of node_modules).
 * Order: local binary → Docker → download official release to .cache/gitleaks
 */
import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { platform, arch } from 'node:os';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const config = join(root, 'security/gitleaks.toml');
const version = '8.24.0';
const cacheDir = join(root, '.cache/gitleaks');
const binName = platform() === 'win32' ? 'gitleaks.exe' : 'gitleaks';
const cachedBin = join(cacheDir, binName);

function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: opts.stdio ?? 'inherit',
    shell: process.platform === 'win32',
    ...opts,
  });
}

function detectArgs(bin) {
  // --no-git: scan working tree; path allowlists exclude node_modules / stores / dist
  const args = ['detect', '--source', root, '--no-git', '--verbose', '--redact'];
  if (existsSync(config)) args.push('--config', config);
  return run(bin, args);
}

function assetName() {
  const p = platform();
  const a = arch();
  const osPart = p === 'darwin' ? 'darwin' : p === 'win32' ? 'windows' : 'linux';
  const archPart = a === 'arm64' ? 'arm64' : 'x64';
  const ext = p === 'win32' ? 'zip' : 'tar.gz';
  return `gitleaks_${version}_${osPart}_${archPart}.${ext}`;
}

function ensureCachedBinary() {
  if (existsSync(cachedBin)) return cachedBin;
  mkdirSync(cacheDir, { recursive: true });
  const asset = assetName();
  const url = `https://github.com/gitleaks/gitleaks/releases/download/v${version}/${asset}`;
  const archive = join(cacheDir, asset);
  console.log(`Downloading gitleaks v${version}…`);
  const dl = run('curl', ['-fsSL', '-o', archive, url], { stdio: 'inherit' });
  if (dl.status !== 0) {
    console.error(
      'Failed to download gitleaks. Install Docker or: https://github.com/gitleaks/gitleaks#installing',
    );
    process.exit(1);
  }
  if (asset.endsWith('.tar.gz')) {
    const tar = run('tar', ['-xzf', archive, '-C', cacheDir, binName], { stdio: 'inherit' });
    if (tar.status !== 0) process.exit(tar.status ?? 1);
  } else {
    console.error('Unpack zip manually or install gitleaks via package manager on Windows.');
    process.exit(1);
  }
  chmodSync(cachedBin, 0o755);
  return cachedBin;
}

const local = run('gitleaks', ['version'], { stdio: 'pipe' });
if (local.status === 0) {
  process.exit(detectArgs('gitleaks').status ?? 1);
}

const docker = run('docker', ['info'], { stdio: 'pipe' });
if (docker.status === 0) {
  const result = run('docker', [
    'run',
    '--rm',
    '-v',
    `${root}:/repo`,
    '-w',
    '/repo',
    `zricethezav/gitleaks:v${version}`,
    'detect',
    '--source=/repo',
    '--config=/repo/security/gitleaks.toml',
    '--no-git',
    '--verbose',
    '--redact',
  ]);
  process.exit(result.status ?? 1);
}

const bin = ensureCachedBinary();
process.exit(detectArgs(bin).status ?? 1);
