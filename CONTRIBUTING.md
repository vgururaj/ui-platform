# Contributing

How to change this monorepo safely. Setup and day-to-day commands live in the [README](README.md); this file is the **contribution workflow**.

## Prerequisites

Node **20**, pnpm **9.x**, then from repo root:

```bash
pnpm install
pnpm test:e2e:install   # once per machine / after Playwright upgrades
```

Full install notes: [README — Prerequisites](README.md#prerequisites).

## Before a PR

```bash
pnpm verify             # secrets + scaffold parity + format/lint/typecheck/test/build/size
```

`pnpm verify` is also the **husky pre-push** bar.

Run the full merge-blocking suite when you change CI/Docker/security, demo e2e paths, or before a release-style merge:

```bash
pnpm verify:all         # verify + high/critical audit + e2e + Docker image build
```

| Doc                                                | Use when                                      |
| -------------------------------------------------- | --------------------------------------------- |
| [docs/ENG_STANDARDS.md](docs/ENG_STANDARDS.md)     | Gates, allowlists, escape hatches             |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)       | Demo vs scaffold ownership                    |
| [docs/MAINTENANCE.md](docs/MAINTENANCE.md)         | Dep bumps, publish, demo↔template alignment   |
| [docs/CREATING_AN_APP.md](docs/CREATING_AN_APP.md) | Minting a product app (not for scaffold PRs)  |
| [docs/DEPLOY.md](docs/DEPLOY.md)                   | Config / Docker / AWS deploy pattern          |
| [SECURITY.md](SECURITY.md)                         | Vulnerability reporting + public config rules |

## Pull requests

1. Branch from `main` (or fork if you lack push access).
2. Keep the PR focused — prefer `packages/*` for reusable behavior.
3. Open a PR against `main`. GitHub fills [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md).
4. Ensure CI is green (`quality`, `e2e`, `secrets`, `audit`, `docker`). Advisory jobs may warn without blocking.
5. Paths under [`.github/CODEOWNERS`](.github/CODEOWNERS) need owner review once branch protection / code-owner rules are enabled.

### Checklist (mirror of the PR template)

- [ ] `pnpm verify` passes locally (or note why skipped)
- [ ] No secrets committed (use `*.example` env files only)
- [ ] High/critical vulns fixed or allowlisted (`pnpm audit:check`) when deps changed
- [ ] Docs updated if behavior or gates changed
- [ ] Day-1 wiring changes: template + `scripts/audit-scaffold-parity.mjs` updated
- [ ] Demo UX/API contract changes: `pnpm test:e2e` or `pnpm verify:all` run locally

## Local hooks

| Hook       | Runs                                            |
| ---------- | ----------------------------------------------- |
| pre-commit | lint-staged (ESLint + Prettier on staged files) |
| pre-push   | `pnpm verify`                                   |

Emergency skip (CI still enforces gates):

```bash
HUSKY=0 git push
# or
git push --no-verify
```

Policy for skips and allowlists: [ENG_STANDARDS.md](docs/ENG_STANDARDS.md).

## Scope

- **Reusable behavior** → `packages/*` (`ui`, `auth`, `http`, eslint-config, tsconfig).
- **Exhaustive harness** → `apps/demo` only (MSW, Playwright, i18n, inventory pages).
- **Thin starter** → `templates/vite-react` (keep aligned with day-1 wiring — see MAINTENANCE).
- **Do not** commit secrets, `.env` with real values, or private keys in `config.js` / SSM params that feed the SPA.
- **Do not** copy the demo wholesale as a product app — use the template ([CREATING_AN_APP.md](docs/CREATING_AN_APP.md)).
- High/critical dependency vulns: fix or allowlist in [`security/audit-allowlist.json`](security/audit-allowlist.json).

## Security reports

Do not file sensitive vulnerabilities as public issues. See [SECURITY.md](SECURITY.md).
