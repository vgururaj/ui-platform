# Architecture

## What this repo is

**`ui-platform`** is the git/monorepo root (the directory you clone). It is a **pnpm + Turborepo** workspace with a demo app, a runnable template, and shared libraries.

Package **names** use the npm scope `@vgururaj/…` (e.g. `@vgururaj/ui` lives at `packages/ui` in this repo). That scope is not a sibling directory of your other projects.

```text
ui-platform/                      ← repo root (this project)
  packages/tsconfig, eslint-config  → shared tooling
  packages/ui                       → design system (@vgururaj/ui)
  packages/auth                     → AuthN/AuthZ (@vgururaj/auth)
  packages/http                     → Zod-validated HTTP client (@vgururaj/http)
  apps/demo                         → full UX harness (MSW, e2e, i18n, …)
  templates/vite-react              → minimal runnable starter
  deploy/                           → nginx + Docker entrypoint (local containers)
  scripts/                          → config generate, secrets, audit, docker helpers
```

**What belongs where**

| Layer               | Belongs in scaffold (`packages/*`, template, eslint presets)                                   | Belongs in demo only                                              |
| ------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| HTTP + Zod boundary | `@vgururaj/http`, app `src/lib/api.ts` wiring, `eslint-config/vite-app`                        | Concrete feature `api/*` + schemas for demo APIs                  |
| Auth primitives     | `@vgururaj/auth`                                                                               | `PersistentMockAuthAdapter`, login UX polish, MSW auth            |
| UI kit              | `@vgururaj/ui` (+ `ErrorBoundary`) + Storybook                                                 | Exhaustive pages exercising every primitive                       |
| App day-1 wiring    | Template: Query/Toaster/Tooltip, Zod `env`, Sentry stub, theme store, Vitest, RHF login schema | i18n, Motion shell, MSW, Playwright, chart/table/upload inventory |
| Gates               | `eslint-config/package-lib` + `vite-app`, `scripts/vite-manual-chunks.mjs`                     | Playwright matrix, MSW fixtures                                   |

### Demo file ownership (audit)

Every path under `apps/demo` is either **scaffold pattern** (must also exist in template / packages) or **demo-only harness**.

| Path                                                            | Owner                     | Notes                                                                                  |
| --------------------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------- |
| `package.json` / Vite / TS / ESLint                             | Scaffold pattern          | Template mirrors day-1 deps; demo adds MSW, Playwright, i18n, Motion, Table            |
| `public/config.js`, `.env.example`, `.gitignore`                | Scaffold pattern          | Template has the same shape (`VITE_ENABLE_MOCKS=false`)                                |
| `src/config/env.ts`                                             | Scaffold pattern          | Zod-known keys + `runtimeEnv` / `getRuntimeEnv`                                        |
| `src/lib/api.ts`, `query-client.ts`, `sentry.ts`                | Scaffold pattern          | Thin wires; HTTP logic in `@vgururaj/http`                                             |
| `src/App.tsx` / `main.tsx`                                      | Scaffold pattern          | Query + Auth + Tooltip + Toaster; Sentry boot                                          |
| `src/stores/theme-store.ts`                                     | Scaffold pattern          | Template uses `app-theme` key; demo may keep `demo-theme`                              |
| `src/routes/router.tsx`                                         | Split                     | Guards + shell composition = scaffold; lazy matrix + items/forms/uploads routes = demo |
| `src/components/app-layout.tsx`                                 | Split                     | Minimal shell = template; i18n / Motion / mobile Sheet / full nav = demo               |
| `src/components/not-found-page.tsx`                             | Scaffold pattern          | Template has equivalent                                                                |
| `ErrorBoundary`                                                 | Scaffold (`@vgururaj/ui`) | Demo imports from package — not a local component                                      |
| `features/auth/login-page` + `schemas/login`                    | Scaffold pattern          | Template uses RHF + Zod schema (no i18n)                                               |
| `features/auth/persistent-adapter.ts`                           | Demo only                 | Template keeps plain `MockAuthAdapter`                                                 |
| `features/{home,admin,access}/*`                                | Scaffold seed             | Minimal pages; demo home may add charts/stats API                                      |
| `features/{items,forms,uploads,tabs,profile,settings,errors}/*` | Demo only                 | Copy patterns into product apps as needed                                              |
| `features/*/api/*` + `schemas/*` (non-login)                    | Demo only                 | Product apps add their own                                                             |
| `src/mocks/**`, `public/mockServiceWorker.js`                   | Demo only                 | Enable mocks in a product app only when you need them                                  |
| `src/i18n/**`                                                   | Demo only                 | Optional product concern                                                               |
| `e2e/**`, `playwright.config.ts`                                | Demo only                 | Product apps add their own e2e                                                         |
| `vitest.config.ts`, `src/test/setup.ts`, `src/lib/api.test.ts`  | Scaffold pattern          | Template has the same smoke setup                                                      |
| `lazyRouteComponent` in router                                  | Scaffold pattern          | Template + demo; enforced by `pnpm audit:scaffold`                                     |
| `scripts/vite-manual-chunks.mjs` (repo root)                    | Scaffold                  | Shared by demo + template Vite configs                                                 |

**Regression gate:** `pnpm audit:scaffold` (`scripts/audit-scaffold-parity.mjs`) fails `pnpm verify` if day-1 files or capabilities drift out of the template.

**Dependency rule (enforced by ESLint):**

- Shared packages (`packages/*`) use `@vgururaj/eslint-config/package-lib` — must not import from `apps/` or `templates/`.
- Vite apps use `@vgururaj/eslint-config/vite-app` — inside a feature folder, relative imports only; compose across features in `routes/` or `App`.

`App`, `routes/`, `mocks/`, and `components/` may import from features (that is composition).

## How a request flows

```text
Browser
  ├─ GET /config.js     → window.__ENV__ (public runtime settings)
  ├─ GET /index.html + hashed /assets/*
  └─ App boot
       ├─ AuthProvider (adapter: mock or real)
       ├─ Router beforeLoad: requireAuth / requirePermission
       ├─ Feature pages → api/* → apiFetchParsed + Zod  [demo: MSW when mocks enabled]
       └─ UI primitives from @vgururaj/ui
```

| Mode                                 | Static assets   | Config                                               | API                                  |
| ------------------------------------ | --------------- | ---------------------------------------------------- | ------------------------------------ |
| **`local`** — `pnpm dev`             | Vite            | Committed `public/config.js` (`VITE_APP_ENV=local`)  | MSW when `VITE_ENABLE_MOCKS` is true |
| **`local`** — Docker                 | nginx image     | Entrypoint writes `config.js` (`VITE_APP_ENV=local`) | Same as baked config / mocks flag    |
| **`dev` / `staging` / `production`** | S3 + CloudFront | CI: SSM → `config:generate` → upload                 | Your real backends                   |

## Runtime configuration

Deployed builds use **one static bundle** plus a **public** `/config.js` that sets `window.__ENV__`. Apps read it through a small env module (demo: [`apps/demo/src/config/env.ts`](../apps/demo/src/config/env.ts)).

- Prefer runtime config for per-environment URLs and flags.
- `import.meta.env.VITE_*` is only a fallback when `__ENV__` is absent (local tooling).
- Generation is generic: every SSM leaf under `AWS_SSM_PATH`, or every process env matching `CONFIG_PREFIX` (default `VITE_`). See [DEPLOY.md](DEPLOY.md).

## AuthN / AuthZ

See [AUTH.md](AUTH.md).

- **AuthN:** swap `AuthAdapter` implementations (demo uses a localStorage-persisted mock for reload/e2e).
- **AuthZ:** string permissions; `Can` for UI; `requireAuth` / `requirePermission` in route `beforeLoad`.
- Frontend checks are **UX only** — APIs must enforce authorization.

## Schemas & types (forms + API)

Keep Zod contracts **out of page/component files**. Colocate per feature:

```text
features/<name>/
  schemas/     # form input + API response Zod schemas, z.infer types
  api/         # apiFetchParsed(path, schema) — only HTTP entry for the feature
  *-page.tsx   # imports schemas/api only (no fetch, no zod, no @/lib/api)
```

Rules:

1. Form schemas and API response schemas may differ.
2. Infer types with `z.infer<>`; do not duplicate hand-written interfaces.
3. Validate request/response bodies with Zod in `api/*` (or form resolvers via `schemas/`).
4. MSW fixtures should satisfy the same response schemas.

**Enforced by ESLint (`@vgururaj/eslint-config/vite-app`) and `@vgururaj/http`:**

- Raw `fetch` only inside `@vgururaj/http` (apps wire `createHttpClient` in `src/lib/api.ts`).
- UI (`*-page.tsx`, `components/`) cannot import `apiFetchParsed` or `zod`.
- Feature `api/*` must use `apiFetchParsed` from the app’s `@/lib/api`.
- Uploads use `uploadWithProgress` + `schema.parse` on the response in `features/*/api`.

## Performance / bundle size

1. Route-level code splitting (`lazyRouteComponent` + dynamic `import()`).
2. Vendor `manualChunks` for heavy libs in Vite config.
3. Prefer importing charts only from routes that need them.
4. Package size budgets via `pnpm size:check` (included in `pnpm verify`).

## Uploads / charts / tables

- `uploadWithProgress` (XHR) for progress; swap transport for your API or presigned URL.
- Recharts wrappers in `@vgururaj/ui`.
- Demo items table: server-style query params synced to the URL (Query + Table).

## Creating new apps

Use [`templates/vite-react`](../templates/vite-react) — see [CREATING_AN_APP.md](CREATING_AN_APP.md). Do not fork the demo wholesale; copy patterns as needed.

## Related

- [DEPLOY.md](DEPLOY.md) — config, Docker, S3 + CloudFront
- [ENG_STANDARDS.md](ENG_STANDARDS.md) — quality gates
- [DECISIONS.md](DECISIONS.md) — ADRs
