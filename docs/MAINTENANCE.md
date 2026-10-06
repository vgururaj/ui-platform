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

Published names use the `@vgururaj/…` npm scope (`@vgururaj/ui`, `@vgururaj/auth`, …). While packages are `private` and workspace-only inside **ui-platform**, treat versions as informational. When you publish:

- **patch** — bugfixes, no API change
- **minor** — additive API
- **major** — breaking peers (e.g. React major) or removed exports

Apps upgrade via dependency bumps + their own CI.

## Publishing packages (when needed)

Only when a **separate app repo** must `pnpm add @vgururaj/ui` (or auth).

1. Authenticate to your registry (npm or GitHub Packages).
2. Set `publishConfig` / remove `"private": true` on packages you intend to publish.
3. Publish `@vgururaj/ui`, `@vgururaj/auth`, and `@vgururaj/http` (and tooling packages if consumers need them).
4. In the app repo, configure `.npmrc` for scope `@vgururaj` and replace `workspace:*` with semver ranges.
5. Enable Dependabot/Renovate on consuming apps.

Until then, workspace linking in this monorepo is enough.

## React / major upgrades

1. Widen or bump `peerDependencies` in `ui`, `auth`, and `http` as needed.
2. Upgrade demo and template; run `pnpm verify:all`.
3. Note breaking changes in [DECISIONS.md](DECISIONS.md) or a changelog.

## Deploy / config ops

- **App settings (public):** add/change SSM parameters under the env path; redeploy (CI regenerates `config.js`). No generator script edits for new keys.
- **AWS plumbing:** bucket, CloudFront, OIDC role, GitHub Environment vars — see [DEPLOY.md](DEPLOY.md).
- **Local Docker:** optional; `pnpm docker:run` with `.env` — not used for AWS SPA hosting.

## Keeping demo and template aligned

- New **required** wiring → update the template + [CREATING_AN_APP.md](CREATING_AN_APP.md) **and** extend `scripts/audit-scaffold-parity.mjs` so `pnpm audit:scaffold` catches future drift
- Exhaustive examples stay in the demo only (see the file ownership table in [ARCHITECTURE.md](ARCHITECTURE.md))
- Shared Vite chunk splitting lives in `scripts/vite-manual-chunks.mjs` (both apps import it). Out-of-monorepo copies must vendor or inline that file — see [CREATING_AN_APP.md](CREATING_AN_APP.md#separate-repo-vite-manualchunks-and-other-relative-paths)
- Update the root README scripts table when scripts change
