# ui-platform

This **repository** (`ui-platform`) is a reusable React frontend platform: shared packages, an exhaustive **demo** app, and a runnable **app template**.

The strings `@vgururaj/ui`, `@vgururaj/auth`, etc. are **npm package names** (the `@vgururaj` scope) used inside this monorepo — **not** a folder on your machine next to your other repos. On disk everything lives under this repo’s root (e.g. `…/ui-platform/packages/ui`).

## What is in this repo

| Path                     | Role                                                                 |
| ------------------------ | -------------------------------------------------------------------- |
| `apps/demo`              | Living test harness — auth, tables, charts, uploads, i18n, e2e, etc. |
| `packages/ui`            | `@vgururaj/ui` — design tokens, primitives, charts, upload helper    |
| `packages/auth`          | `@vgururaj/auth` — AuthN adapter + permission AuthZ (`Can`, guards)  |
| `packages/http`          | `@vgururaj/http` — Zod-validated `apiFetchParsed` HTTP client        |
| `packages/tsconfig`      | Shared TypeScript configs                                            |
| `packages/eslint-config` | Shared ESLint presets (`base`, `package-lib`, `vite-app`)            |
| `templates/vite-react`   | Runnable starter (`@vgururaj/vite-react-template`) for new apps      |
| `docs/`                  | Architecture, maintenance, auth, deploy, engineering standards       |
| `deploy/`                | nginx + Docker runtime-env script (local containers)                 |
| `security/`              | Audit / gitleaks allowlists                                          |
| `LICENSE`                | MIT                                                                  |

## Prerequisites

### Required (install on the machine first)

| Tool        | Version                      | Notes                                                                            |
| ----------- | ---------------------------- | -------------------------------------------------------------------------------- |
| **Git**     | recent                       | [git-scm.com](https://git-scm.com/) or OS package manager                        |
| **Node.js** | **20** (see `.nvmrc`)        | Prefer a version manager (nvm / fnm) or [nodejs.org](https://nodejs.org/) LTS 20 |
| **pnpm**    | **9.x** (repo pins `9.15.9`) | Must be on your PATH — see below                                                 |

**Check what you already have** (many people already have pnpm from Homebrew, a prior project, or a laptop image):

```bash
git --version
node -v    # want v20.x.x for this repo
pnpm -v    # want 9.x — if this works, you can skip pnpm install steps
```

If `pnpm -v` already prints `9.x`, you do **not** need Corepack or a fresh pnpm install.

**Node 20** (only if missing or wrong major):

```bash
# nvm — https://github.com/nvm-sh/nvm
nvm install 20 && nvm use 20

# fnm — https://github.com/Schniz/fnm
fnm install 20 && fnm use 20

# Or the Node 20 LTS installer: https://nodejs.org/
```

**pnpm 9** (only if `pnpm` is missing or not 9.x). Any one of these is fine:

```bash
# Already installed elsewhere? Common sources:
#   - Homebrew:  brew install pnpm   → often /opt/homebrew/bin/pnpm
#   - npm global: npm install -g pnpm@9
#   - Prior repo / Corepack / company image
# Skip this section if `pnpm -v` already shows 9.x.

# Option A — Corepack (ships with Node; respects package.json "packageManager")
corepack enable
corepack prepare pnpm@9.15.9 --activate

# Option B — Homebrew
brew install pnpm

# Option C — npm global
npm install -g pnpm@9
```

React, Vite, TypeScript, TanStack, Tailwind, Vitest, Storybook, etc. are **not** installed globally — they come from `pnpm install` in this repo.

### After clone (still required for full gates)

```bash
git clone <repo-url> ui-platform && cd ui-platform
pnpm install
pnpm test:e2e:install    # Playwright Chromium — once per machine / after Playwright upgrades
```

`pnpm install` alone is **not** enough for `pnpm test:e2e` or `pnpm verify:all`.

### Optional (only for specific workflows)

| Tool           | When you need it                                                 | Install                                                                                                |
| -------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Docker**     | `pnpm docker:run` / `docker:build` / Docker part of `verify:all` | [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine                     |
| **AWS CLI v2** | `pnpm config:generate` with `AWS_SSM_PATH=…`, or AWS deploy      | [AWS CLI install guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) |
| **gitleaks**   | Prefer a local binary for `pnpm secrets:check`                   | Optional — script can use Docker or download to `.cache/gitleaks`                                      |

## Local development (`local`)

Workstation runs use environment name **`local`** (`VITE_APP_ENV=local` in `public/config.js` / Docker). This is **not** a deploy target — `dev` is the first deployed environment.

```bash
pnpm dev              # demo app → http://localhost:5173  (env: local)
pnpm --filter @vgururaj/vite-react-template dev   # template → :5174  (env: local)
pnpm storybook        # UI primitives
```

### Demo login (mock)

| Email               | Password   | Role                          |
| ------------------- | ---------- | ----------------------------- |
| `admin@demo.local`  | `password` | Full permissions              |
| `user@demo.local`   | `password` | Write posts/files, read items |
| `viewer@demo.local` | `password` | Read-only                     |

See [docs/AUTH.md](docs/AUTH.md).

## Test & verify

```bash
pnpm lint
pnpm typecheck
pnpm test                 # unit (Vitest via Turbo)
pnpm test:e2e             # needs Chromium from `pnpm test:e2e:install`
pnpm check                # lint + typecheck + test + build (not e2e/size)
pnpm verify               # secrets + scaffold parity + quality + size (husky pre-push)
pnpm verify:all           # + audit, e2e, docker
```

See [docs/ENG_STANDARDS.md](docs/ENG_STANDARDS.md).

## Build & preview

```bash
pnpm build
pnpm --filter @vgururaj/demo preview
```

## Docker (demo)

```bash
pnpm docker:run             # build once + run with runtime env → http://localhost:8080
# or
docker compose up --build
```

Same image for every environment; set `VITE_*` at **container run** (see `.env.docker.example`).  
`VITE_ENABLE_MOCKS=true` is for **`local`** only — never enable mocks in `dev` / `staging` / `production`.  
**AWS hosting:** S3 + CloudFront; config from SSM via `pnpm config:generate` (see [docs/DEPLOY.md](docs/DEPLOY.md)). Docker is for local use.

### Environment names

| Name         | Where it runs              | Notes                                                                  |
| ------------ | -------------------------- | ---------------------------------------------------------------------- |
| `local`      | `pnpm dev`, local Docker   | Committed `config.js` / container env. **Not** a GitHub deploy choice. |
| `dev`        | Deployed (first cloud env) | GitHub Environment + SSM `/…/dev`                                      |
| `staging`    | Deployed                   | GitHub Environment + SSM `/…/staging`                                  |
| `production` | Deployed                   | GitHub Environment + SSM `/…/production`                               |

Do **not** use aliases (`development`, `stg`, `stage`, `prod`, …). Deploy CI fails if `AWS_SSM_PATH` does not end with `/{env}` for `dev` \| `staging` \| `production`. Details: [docs/DEPLOY.md](docs/DEPLOY.md).

## Update dependencies

1. Bump versions in the relevant `package.json` (or Dependabot/Renovate when the remote exists).
2. Run `pnpm install` then `pnpm check`.
3. For majors (React, Tailwind, Router), follow [docs/MAINTENANCE.md](docs/MAINTENANCE.md).

Workspace packages are linked locally inside **this** repo. Published packages go to **GitHub Packages** (`pnpm publish:packages` or Actions → **Publish packages**). Separate app repos: [docs/MAINTENANCE.md](docs/MAINTENANCE.md#publishing-packages-github-packages) + full copy-out checklist in [docs/CREATING_AN_APP.md](docs/CREATING_AN_APP.md).

## Creating a new app

Do **not** fork the demo. Use `templates/vite-react` — see [docs/CREATING_AN_APP.md](docs/CREATING_AN_APP.md).

## Scripts cheat sheet

| Script                         | Description                                                 |
| ------------------------------ | ----------------------------------------------------------- |
| `pnpm dev`                     | Run demo                                                    |
| `pnpm build`                   | Build all packages/apps/templates                           |
| `pnpm lint`                    | ESLint                                                      |
| `pnpm typecheck`               | `tsc` / typecheck                                           |
| `pnpm test`                    | Unit tests                                                  |
| `pnpm test:e2e:install`        | **Required once** — download Playwright Chromium            |
| `pnpm test:e2e`                | Playwright e2e (demo)                                       |
| `pnpm check`                   | lint + typecheck + unit + build (not e2e)                   |
| `pnpm verify`                  | secrets + scaffold parity + quality + size (husky pre-push) |
| `pnpm verify:all`              | verify + audit + e2e + docker build                         |
| `pnpm audit:check`             | fail on high/critical vulns unless allowlisted              |
| `pnpm audit:scaffold`          | demo↔template day-1 parity (also in `verify`)               |
| `pnpm size:check`              | package bundle budgets                                      |
| `pnpm docker:build`            | Build demo nginx image (local)                              |
| `pnpm docker:run`              | Build once + run with runtime env on :8080                  |
| `pnpm config:generate`         | Write `config.js` from env or AWS SSM                       |
| `pnpm publish:packages`        | Build + publish `packages/*` to GitHub Packages             |
| `pnpm storybook`               | UI Storybook                                                |
| `pnpm format` / `format:check` | Prettier                                                    |

## Troubleshooting

| Issue                       | Fix                                                              |
| --------------------------- | ---------------------------------------------------------------- |
| Engine / pnpm errors        | Use Node 20 (`.nvmrc`) and pnpm 9                                |
| Playwright browsers missing | `pnpm test:e2e:install`                                          |
| Port 5173 in use            | Stop other Vite processes or set `--port`                        |
| Workspace package not found | Run `pnpm install` from repo root                                |
| Preview/layout looks broken | Rebuild after CSS changes; demo CSS must `@source` `packages/ui` |

## Deeper docs

- [docs/README.md](docs/README.md) — index
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/ENG_STANDARDS.md](docs/ENG_STANDARDS.md)
- [docs/DEPLOY.md](docs/DEPLOY.md)
- [docs/MAINTENANCE.md](docs/MAINTENANCE.md)
- [docs/AUTH.md](docs/AUTH.md)
- [docs/CREATING_AN_APP.md](docs/CREATING_AN_APP.md)
- [docs/DECISIONS.md](docs/DECISIONS.md)
- [SECURITY.md](SECURITY.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [LICENSE](LICENSE)
