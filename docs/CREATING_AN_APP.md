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
   - **Separate repo:** after packages are published, use semver ranges + registry auth — see [MAINTENANCE.md](MAINTENANCE.md).
4. Adjust Vite aliases / `tsconfig` paths if the relative location of `packages/ui` and `packages/auth` changes.
5. Keep runtime config: `/config.js` → `window.__ENV__` (see demo or template `src/config/env.ts`). Deploy with `pnpm config:generate` from SSM or env — [DEPLOY.md](DEPLOY.md).
6. Use `@vgururaj/http` via `src/lib/api.ts` (`createHttpClient`) and feature `api/*` + Zod schemas — ESLint preset `@vgururaj/eslint-config/vite-app` enforces this.
7. Replace `MockAuthAdapter` with your adapter when ready; keep `Can` / `requireAuth` / `requirePermission`.
8. Point upload helpers at your API when you add uploads.
9. Host on **S3 + CloudFront** for static SPA hosting. Docker is optional for local containers only.
10. Run `pnpm install && pnpm --filter <your-package> dev` and `pnpm verify` before push.

## Do not

- Copy `apps/demo` wholesale as a product (harness-only code: MSW matrix, Storybook demos, exhaustive pages). **Do** copy individual patterns from the demo.
- Fork design-system components into the app — extend `@vgururaj/ui`.
- Ship with mocks enabled in real environments (`VITE_ENABLE_MOCKS` must be `false` or omitted).
- Put private secrets in `config.js` / browser-facing SSM parameters.
- Invent deploy env aliases (`stg`, `prod`, …) — deployed names are only `dev` | `staging` | `production`. Use `local` for workstation runs only.
