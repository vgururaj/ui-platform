# Creating an app from the template

## Starter in this monorepo

```bash
pnpm install
pnpm --filter @vgururaj/vite-react-template dev
```

Package path: [`templates/vite-react`](../templates/vite-react). It is a **runnable** Vite + React 19 app with day-1 scaffold wiring: Query + Toaster, Zod `env`, `@vgururaj/http`, RHF login schema, theme store, Sentry stub, `ErrorBoundary`, Vitest, login/home/`requirePermission` admin/`Can` on `/access`, runtime `config.js`.

## New product app

1. Copy `templates/vite-react` to `apps/<name>` (same monorepo) or to a new git repo.
2. Rename `name` in `package.json`. For a separate repo, also set `"packageManager": "pnpm@9.15.9"`, `"engines": { "node": ">=20" }`, and add a root `.nvmrc` with `20` (matches this scaffold; helps CI).
3. Dependencies:
   - **Monorepo:** keep `workspace:*` (ensure the path is under `apps/*` or `templates/*` in `pnpm-workspace.yaml`).
   - **Separate repo:** prefer GitHub Packages — `"@vgururaj/ui": "^0.1.0"` (same for `auth`, `http`, `eslint-config`, `tsconfig`) + app `.npmrc` for `@vgururaj` → `https://npm.pkg.github.com` and `NODE_AUTH_TOKEN` — see [MAINTENANCE.md](MAINTENANCE.md#consuming-packages-in-a-separate-app-repo). Until publish, use `link:` / `file:` to a local ui-platform checkout — `workspace:*` only works inside this monorepo.
4. **Separate repo — strip monorepo path aliases** in **`vite.config.ts`**, **`vitest.config.ts`**, and **`tsconfig.json`**. The template aliases `@vgururaj/*` into `../../packages/...`. Those paths do not exist outside this monorepo. Keep only the `@` → `./src` alias and resolve packages from `node_modules`. Leaving Vitest aliases in place is a common failure: `pnpm dev` works, but `pnpm test` / CI cannot resolve `@vgururaj/http`.
5. **Fix monorepo-only Vite imports** — copy or inline `scripts/vite-manual-chunks.mjs` (see below).
6. **Fix Tailwind `@source`** in `src/styles.css` for published packages (see below).
7. Keep runtime config: `/config.js` → `window.__ENV__` (see demo or template `src/config/env.ts`). Deploy with `pnpm config:generate` from SSM or env — [DEPLOY.md](DEPLOY.md).
8. Use `@vgururaj/http` via `src/lib/api.ts` (`createHttpClient`) and feature `api/*` + Zod schemas — ESLint preset `@vgururaj/eslint-config/vite-app` enforces this.
9. Replace `MockAuthAdapter` with your adapter when ready; keep `Can` / `requireAuth` / `requirePermission`.
10. Point upload helpers at your API when you add uploads.
11. Host on **S3 + CloudFront** for static SPA hosting. Docker is optional for local containers only.
12. Run `pnpm install && pnpm --filter <your-package> dev` (or `pnpm dev` in a single-package repo). In a separate repo, `export NODE_AUTH_TOKEN=<PAT with read:packages>` before install.
13. Optional but recommended for a separate repo: add minimal CI (lint → typecheck → test → build) with repo secret `NODE_AUTH_TOKEN` — see below.

## Separate repo: Vite `manualChunks` and other relative paths

The template’s `vite.config.ts` imports shared chunk splitting from the **ui-platform** repo root:

```ts
import { platformManualChunks } from '../../scripts/vite-manual-chunks.mjs';
```

That path exists only inside this monorepo (`templates/vite-react` → `scripts/`). After you copy the template to another git repo, the import **fails** until you do one of:

1. **Copy the helper:**

```bash
mkdir -p scripts
cp /path/to/ui-platform/scripts/vite-manual-chunks.mjs ./scripts/vite-manual-chunks.mjs
```

Then update the import to `./scripts/vite-manual-chunks.mjs`.

2. **Inline** — paste the `platformManualChunks` function into `vite.config.ts` (or a local `manualChunks.ts`) and drop the cross-repo import.

Source of truth: [`scripts/vite-manual-chunks.mjs`](../scripts/vite-manual-chunks.mjs). When chunking changes in ui-platform, re-copy or re-sync into out-of-monorepo apps.

## Separate repo: Tailwind `@source`

The template’s `src/styles.css` scans monorepo sources:

```css
@source "../../../packages/ui/src/**/*.{ts,tsx}";
@source "../../../packages/auth/src/**/*.{ts,tsx}";
```

Outside the monorepo those paths are missing — utility classes from `@vgururaj/ui` / `@vgururaj/auth` will not generate. Replace with scans of the installed packages (and keep app sources):

```css
@import '@vgururaj/ui/styles.css';

@source "../node_modules/@vgururaj/ui/dist/**/*.{js,mjs}";
@source "../node_modules/@vgururaj/auth/dist/**/*.{js,mjs}";
@source "./**/*.{ts,tsx}";
```

## Separate repo: minimal CI

Add a GitHub Actions workflow that installs with GitHub Packages auth, then runs quality gates. Example shape:

1. Repo **Settings → Secrets and variables → Actions** → secret `NODE_AUTH_TOKEN` (classic PAT with `read:packages`).
2. Workflow Install step:

```yaml
- name: Install
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NODE_AUTH_TOKEN }}
  run: pnpm install --frozen-lockfile
- run: pnpm lint
- run: pnpm typecheck
- run: pnpm test
- run: pnpm build
```

Use `pnpm/action-setup` + `actions/setup-node` with `node-version-file: .nvmrc` and `cache: pnpm`. Optional: `registry-url: https://npm.pkg.github.com` and `scope: '@vgururaj'` on `setup-node`.

Do **not** commit a literal token in `.npmrc` — keep `${NODE_AUTH_TOKEN}` only.

## Separate repo: checklist / pitfalls

| Symptom                                                       | Fix                                                                                                                |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Vite fails on `vite-manual-chunks`                            | Copy/inline helper (above)                                                                                         |
| `workspace:*` install fails                                   | Semver + `.npmrc` + `NODE_AUTH_TOKEN` ([MAINTENANCE.md](MAINTENANCE.md#consuming-packages-in-a-separate-app-repo)) |
| UI missing Tailwind utilities                                 | Fix `@source` to `node_modules/@vgururaj/*/dist`                                                                   |
| `pnpm test` / CI cannot resolve `@vgururaj/*` but `dev` works | Remove `../../packages/...` aliases from **vitest.config.ts** (and Vite/tsconfig)                                  |
| CI install 401 on `@vgururaj/*`                               | Actions secret `NODE_AUTH_TOKEN` + `env` on Install                                                                |

## Do not

- Copy `apps/demo` wholesale as a product (harness-only code: MSW matrix, Storybook demos, exhaustive pages). **Do** copy individual patterns from the demo.
- Fork design-system components into the app — extend `@vgururaj/ui`.
- Ship with mocks enabled in real environments (`VITE_ENABLE_MOCKS` must be `false` or omitted).
- Put private secrets in `config.js` / browser-facing SSM parameters.
- Invent deploy env aliases (`stg`, `prod`, …) — deployed names are only `dev` | `staging` | `production`. Use `local` for workstation runs only.
