# vite-react template

Runnable Vite + React 19 starter for apps built on `@vgururaj/ui`, `@vgururaj/auth`, and `@vgururaj/http`.

Use it in this monorepo, or copy the folder out as the seed for a new app.

## Run in the monorepo

```bash
pnpm install
pnpm --filter @vgururaj/vite-react-template dev
```

Other scripts: `build`, `lint`, `typecheck`, `test`, `preview`.

Dev server defaults to port **5174** so it does not collide with `apps/demo` (5173).

## What you get (day-1 scaffold)

- TanStack Router with `/login`, authenticated shell (`/`, `/admin`, `/access`)
- TanStack Query + TooltipProvider + Toaster
- `MockAuthAdapter` (seed users: `admin@demo.local` / `user@demo.local` / `viewer@demo.local`, password `password`)
- `requireAuth` / `requirePermission(..., 'admin:access')` → forbidden redirects to `/access`
- RHF + Zod login schema under `features/auth/schemas/`
- Runtime config via `/config.js` → Zod `env` (`src/config/env.ts`)
- `@vgururaj/http` wired in `src/lib/api.ts`
- Sentry stub (`VITE_SENTRY_DSN`), theme store (`app-theme`), `ErrorBoundary` on home
- Shared Vite `manualChunks` via `scripts/vite-manual-chunks.mjs`
- ESLint app preset: `@vgururaj/eslint-config/vite-app`
- Vitest smoke test for API wiring

## Intentionally not included (see `apps/demo`)

MSW, Playwright, i18n, Motion shell polish, items/forms/uploads/tabs inventory, persistent mock session.

## Copy out for a new app

1. Copy `templates/vite-react` to your target (`apps/<name>` or a separate repo).
2. Rename `name` in `package.json`.
3. Adjust Vite aliases / `tsconfig` paths if the relative location of `packages/*` changes.
4. Replace `MockAuthAdapter` with your real `AuthAdapter` when ready.
5. When packages are published, swap `workspace:*` for semver ranges.

Do not copy `apps/demo` wholesale — that harness is exhaustive. Use this template as the starting tree and pull individual patterns from the demo when needed.

## Runtime config

`index.html` loads `/config.js` before the module. Local defaults live in `public/config.js`. Deploy tooling can overwrite that file so the browser reads env at runtime without rebuilding.
