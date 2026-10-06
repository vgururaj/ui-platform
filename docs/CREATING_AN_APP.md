# Creating an app from the template

## Starter in this monorepo

```bash
pnpm install
pnpm --filter @vgururaj/vite-react-template dev
```

Package path: [`templates/vite-react`](../templates/vite-react). It is a **runnable** Vite + React 19 app with day-1 scaffold wiring: Query + Toaster, Zod `env`, `@vgururaj/http`, RHF login schema, theme store, Sentry stub, `ErrorBoundary`, Vitest, login/home/`requirePermission` admin/`Can` on `/access`, runtime `config.js`.

## New product app

1. Copy `templates/vite-react` to `apps/<name>` (same monorepo) or to a new git repo.
2. Rename `name` in `package.json`.
3. Dependencies:
   - **Monorepo:** keep `workspace:*` (ensure the path is under `apps/*` or `templates/*` in `pnpm-workspace.yaml`).
   - **Separate repo:** after packages are published, use semver ranges + registry auth — see [MAINTENANCE.md](MAINTENANCE.md). Until publish, use `link:` / `file:` to a local ui-platform checkout (or clone packages into the app) — `workspace:*` only works inside this monorepo.
4. Adjust Vite aliases / `tsconfig` paths if the relative location of `packages/ui` and `packages/auth` changes.
5. **Fix monorepo-only Vite imports** (required for a separate repo — see below).
6. Keep runtime config: `/config.js` → `window.__ENV__` (see demo or template `src/config/env.ts`). Deploy with `pnpm config:generate` from SSM or env — [DEPLOY.md](DEPLOY.md).
7. Use `@vgururaj/http` via `src/lib/api.ts` (`createHttpClient`) and feature `api/*` + Zod schemas — ESLint preset `@vgururaj/eslint-config/vite-app` enforces this.
8. Replace `MockAuthAdapter` with your adapter when ready; keep `Can` / `requireAuth` / `requirePermission`.
9. Point upload helpers at your API when you add uploads.
10. Host on **S3 + CloudFront** for static SPA hosting. Docker is optional for local containers only.
11. Run `pnpm install && pnpm --filter <your-package> dev` (or `pnpm dev` in a single-package repo) and `pnpm verify` before push.

## Separate repo: Vite `manualChunks` and other relative paths

The template’s `vite.config.ts` imports shared chunk splitting from the **ui-platform** repo root:

```ts
import { platformManualChunks } from '../../scripts/vite-manual-chunks.mjs';
```

That path exists only inside this monorepo (`templates/vite-react` → `scripts/`). After you copy the template to another git repo, the import **fails** until you do one of:

1. **Copy the helper** — place `scripts/vite-manual-chunks.mjs` from ui-platform into your app repo (e.g. `scripts/vite-manual-chunks.mjs`) and update the import to match (e.g. `./scripts/vite-manual-chunks.mjs` or `../scripts/...` from `vite.config.ts`).
2. **Inline** — paste the `platformManualChunks` function into `vite.config.ts` (or a local `manualChunks.ts`) and drop the cross-repo import.

Also check for any other `../../packages/...` or `../../scripts/...` aliases in Vite/tsconfig; they will break the same way. Prefer package names (`@vgururaj/ui`, …) once dependencies resolve from the registry or `link:`/`file:`.

Source of truth for the helper: [`scripts/vite-manual-chunks.mjs`](../scripts/vite-manual-chunks.mjs). When you change chunking in ui-platform, re-copy or re-sync into out-of-monorepo apps.

## Do not

- Copy `apps/demo` wholesale as a product (harness-only code: MSW matrix, Storybook demos, exhaustive pages). **Do** copy individual patterns from the demo.
- Fork design-system components into the app — extend `@vgururaj/ui`.
- Ship with mocks enabled in real environments (`VITE_ENABLE_MOCKS` must be `false` or omitted).
- Put private secrets in `config.js` / browser-facing SSM parameters.
- Invent deploy env aliases (`stg`, `prod`, …) — deployed names are only `dev` | `staging` | `production`. Use `local` for workstation runs only.
