# Maintenance

## Day-2 dependency updates

1. Change versions in the relevant `package.json`.
2. `pnpm install`
3. `pnpm verify` (or at least `pnpm check` + `pnpm test:e2e`)
4. Fix breakages in packages first, then demo/template

Prefer Renovate or Dependabot when a GitHub remote exists (see [`.github/dependabot.yml`](../.github/dependabot.yml)).

## Quality gates

See [ENG_STANDARDS.md](ENG_STANDARDS.md). Shortcuts:

```bash
pnpm verify           # pre-push bar (secrets + scaffold parity + quality + size)
pnpm verify:all       # + audit, e2e, docker smoke
pnpm config:generate  # refresh config.js from env or SSM
```

## Semver for packages in this monorepo

Published names use the `@vgururaj/…` npm scope (`@vgururaj/ui`, `@vgururaj/auth`, …) on **GitHub Packages**.

- **patch** — bugfixes, no API change
- **minor** — additive API
- **major** — breaking peers (e.g. React major) or removed exports

Bump the version in each package’s `package.json` before publishing again. Apps upgrade via dependency bumps + their own CI.

## Publishing packages (GitHub Packages)

Publishable packages under `packages/`: `@vgururaj/tsconfig`, `@vgururaj/eslint-config`, `@vgururaj/http`, `@vgururaj/auth`, `@vgururaj/ui`. Registry: `https://npm.pkg.github.com`. Scope owner must match the GitHub user/org (`vgururaj`).

### Auth (local)

Create a classic PAT with `read:packages` + `write:packages` (and `repo` if the source repo is private). Then either:

```bash
export NODE_AUTH_TOKEN=<PAT>
# one-time or per shell — do not commit tokens
npm login --scope=@vgururaj --auth-type=legacy --registry=https://npm.pkg.github.com
# Username: your GitHub username
# Password: the PAT (not your GitHub password)
```

Or write to `~/.npmrc` (machine-local):

```ini
@vgururaj:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

### Publish

From the ui-platform root (clean tree preferred):

```bash
pnpm publish:packages
```

That builds `ui` / `auth` / `http`, then runs `pnpm publish` for every package under `packages/*`.

**CI:** GitHub → Actions → **Publish packages** → Run workflow (uses `GITHUB_TOKEN` with `packages: write`). Workflow file: [`.github/workflows/publish-packages.yml`](../.github/workflows/publish-packages.yml).

After a successful publish, packages appear under the repo’s **Packages** tab (e.g. `https://github.com/vgururaj/ui-platform/packages`).

### Re-publish

1. Bump `"version"` in the package(s) you changed.
2. `pnpm verify` (or at least build + tests for those packages).
3. `pnpm publish:packages` or re-run the workflow.

npm/GitHub Packages reject re-uploading the same version.

## Consuming packages in a separate app repo

In the app repo root, add `.npmrc` (safe to commit — token stays in env):

```ini
@vgururaj:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Set `NODE_AUTH_TOKEN` to a PAT with at least `read:packages` before `pnpm install` (CI: repository secret).

Replace `workspace:*` / `link:` with semver, e.g. `"@vgururaj/ui": "^0.1.0"`. Remove Vite/tsconfig aliases that pointed at a local ui-platform checkout; resolve from `node_modules`. See [CREATING_AN_APP.md](CREATING_AN_APP.md).

## React / major upgrades

1. Widen or bump `peerDependencies` in `ui`, `auth`, and `http` as needed.
2. Upgrade demo and template; run `pnpm verify:all`.
3. Note breaking changes in [DECISIONS.md](DECISIONS.md) or a changelog.
4. Bump package versions and publish.

## Deploy / config ops

- **App settings (public):** add/change SSM parameters under the env path; redeploy (CI regenerates `config.js`). No generator script edits for new keys.
- **AWS plumbing:** bucket, CloudFront, OIDC role, GitHub Environment vars — see [DEPLOY.md](DEPLOY.md).
- **Local Docker:** optional; `pnpm docker:run` with `.env` — not used for AWS SPA hosting.

## Keeping demo and template aligned

- New **required** wiring → update the template + [CREATING_AN_APP.md](CREATING_AN_APP.md) **and** extend `scripts/audit-scaffold-parity.mjs` so `pnpm audit:scaffold` catches future drift
- Exhaustive examples stay in the demo only (see the file ownership table in [ARCHITECTURE.md](ARCHITECTURE.md))
- Shared Vite chunk splitting lives in `scripts/vite-manual-chunks.mjs` (both apps import it). Out-of-monorepo copies must vendor or inline that file — see [CREATING_AN_APP.md](CREATING_AN_APP.md#separate-repo-vite-manualchunks-and-other-relative-paths)
- Update the root README scripts table when scripts change
