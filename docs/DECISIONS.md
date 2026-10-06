# Decisions (ADRs)

## ADR-001: pnpm workspaces + Turborepo

Standard JS monorepo linking and cached task graph. Workspace packages are linked locally until a registry publish is needed.

## ADR-002: TanStack Router + Query + Table

Type-safe routing, server-state cache, headless tables. Demo table uses URL-synced server-style search/pagination against MSW.

## ADR-003: Zustand for client chrome only

Theme/sidebar UI state in Zustand; server data in Query.

## ADR-004: Tailwind v4 + shadcn-style Radix in `@vgururaj/ui`

Owned source components + CSS variables; not a black-box component SaaS.

## ADR-005: Auth package with mock adapter

Cross-app AuthN/AuthZ patterns without locking an IdP. Optional OIDC UI can be added later without changing `Can` / guards.

## ADR-006: Capability permissions + Can hide/disable

String permissions; UI gating for UX; backend remains source of truth. Route guards: `requireAuth` / `requirePermission`.

## ADR-007: Thin XHR upload + progress

`fetch` lacks solid upload progress; XHR helper + MSW delay in demo.

## ADR-008: Recharts + light Motion

Charts via Recharts wrappers; Motion limited to demo shell polish; Tailwind for baseline transitions.

## ADR-009: Local verification before remote CI

Validate with `pnpm verify` / `pnpm verify:all` on disk; hosted CI should mirror the same gates after the repository is published.

## ADR-010: Workspace-first packages

Publish packages from **ui-platform** (`@vgururaj/ui`, `@vgururaj/auth`, …) when a separate app repo must consume them. Until then, `workspace:*` inside this monorepo is enough.

## ADR-011: Hardened gates + escape hatches

Merge-blocking CI: frozen lockfile, scaffold parity, format, lint, typecheck, test, build, size, e2e, gitleaks, high/critical audit (or allowlist), Docker image smoke. Local: husky pre-commit + pre-push (`pnpm verify`); `pnpm verify:all` mirrors full required CI. Escape hatches: [ENG_STANDARDS.md](ENG_STANDARDS.md).

## ADR-012: Docker/nginx for local container runs

Demo SPA can run in Docker locally (multi-stage Node build → nginx-unprivileged). Entrypoint script `10-runtime-env.sh` (`10-` = nginx `docker-entrypoint.d` sort order) writes all prefixed env vars into `config.js`. Not the primary AWS hosting path.

## ADR-013: No Helm/Kubernetes for this SPA

Static SPA hosting does not use Helm. Prefer S3 + CloudFront (ADR-014).

## ADR-014: AWS S3 + CloudFront + SSM for SPA deploy

Static `dist/` on S3, CDN via CloudFront. Public per-env config in SSM; CI uses OIDC, runs `config:generate` (generic keys), builds, syncs, invalidates. Same `window.__ENV__` contract as local/Docker. See [DEPLOY.md](DEPLOY.md).
