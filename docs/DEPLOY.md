# Deploy

The demo is a **static Vite SPA**. Preferred AWS hosting: **S3 + CloudFront**. Docker remains for **local** runs only. Helm/Kubernetes is not used.

## Runtime config (`config.js`)

Build the SPA **once**. Inject **public** settings at deploy or container start via `/config.js` → `window.__ENV__`. Do not rely on build-time `import.meta.env.VITE_*` for per-env URLs/flags in deployed builds (Vite env is only a fallback when `__ENV__` is absent).

The app reads `window.__ENV__` from `/config.js` ([`apps/demo/src/config/env.ts`](../apps/demo/src/config/env.ts)).

| Context                                    | How `config.js` is produced                                                                                                               |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **`local`** — `pnpm dev`                   | Committed [`apps/demo/public/config.js`](../apps/demo/public/config.js) (`VITE_APP_ENV=local`). Optional: `pnpm config:generate` from env |
| **`local`** — Docker                       | [`deploy/10-runtime-env.sh`](../deploy/10-runtime-env.sh) — nginx entrypoint; default `VITE_APP_ENV=local`                                |
| **`dev` / `staging` / `production`** — AWS | CI: SSM → `pnpm config:generate` → build → upload `dist/` (`VITE_APP_ENV` should match the env in SSM)                                    |

```bash
# From shell env (any keys matching CONFIG_PREFIX, default VITE_)
SOME_PREFIX_OR_VITE_YOUR_KEY=value pnpm config:generate

# From AWS SSM (requires AWS CLI + credentials)
AWS_SSM_PATH=/ui-platform/staging pnpm config:generate

# After vite build, write into dist
CONFIG_OUT=apps/demo/dist/config.js AWS_SSM_PATH=/ui-platform/staging pnpm config:generate
```

If `AWS_SSM_PATH` is set and returns **no** parameters, `config:generate` **exits 1** (avoids shipping stale local/demo defaults). If neither SSM nor prefixed env vars are present and the output file already exists, it is left unchanged for local defaults.

### Generic parameters (no allowlist in the script)

| Source      | Rule                                                                |
| ----------- | ------------------------------------------------------------------- |
| SSM         | Every parameter under `AWS_SSM_PATH`; **leaf name** → `__ENV__` key |
| Process env | Every variable starting with `CONFIG_PREFIX` (default `VITE_`)      |
| Docker      | Same prefix rule at container start                                 |

Add or rename settings in SSM (or CI env) only — do **not** edit `scripts/generate-runtime-config.mjs` for new keys.

In app code:

- `getRuntimeEnv('ANY_NAME')` — any key
- `env.VITE_*` — typed helpers for a few demo builtins only

Anything in `config.js` is **public in the browser**. Do not put private secrets there.

### Environment names (canonical)

| Name         | Role                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------- |
| `local`      | Workstation only (`pnpm dev`, local Docker). Set `VITE_APP_ENV=local`. **Not** a GitHub Actions deploy choice. |
| `dev`        | First **deployed** cloud environment (GitHub Environment + SSM `/…/dev`)                                       |
| `staging`    | Deployed                                                                                                       |
| `production` | Deployed                                                                                                       |

Spell deployed names the same everywhere — **do not** invent `development`, `stg`, `stage`, `prod`, `prd`, etc. Do **not** use `local` as an SSM/deploy path.

**Where deploy names are enforced**

| Layer                                                                     | What happens                                                                   |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [`.github/workflows/deploy-aws.yml`](../.github/workflows/deploy-aws.yml) | `workflow_dispatch` choice is only `dev` \| `staging` \| `production`          |
| Deploy job step                                                           | Fails if `vars.AWS_SSM_PATH` does not end with `/{environment}`                |
| GitHub Environments                                                       | Create `dev`, `staging`, and `production`; set `AWS_SSM_PATH` per env to match |
| SSM itself                                                                | No schema — CI path check is the gate                                          |

Product apps that copy the workflow should keep the same names (or extend the choice list **and** the path check together).

### SSM naming pattern

Use a **path prefix per env**, then one parameter per setting. The generator keeps only the **last path segment** as the `window.__ENV__` key.

```text
AWS_SSM_PATH = /ui-platform/{env}     # env ∈ {dev, staging, production}  — never local

Full parameter name                         →  window.__ENV__ key
───────────────────────────────────────────    ──────────────────
/ui-platform/dev/VITE_APP_ENV               →  VITE_APP_ENV (= "dev")
/ui-platform/dev/VITE_API_BASE_URL          →  VITE_API_BASE_URL
/ui-platform/staging/VITE_API_BASE_URL      →  VITE_API_BASE_URL
/ui-platform/staging/VITE_ENABLE_MOCKS      →  VITE_ENABLE_MOCKS
/ui-platform/production/FEATURE_X           →  FEATURE_X   (any leaf is fine)
```

**Convention:**

| Piece     | Pattern                                                       | Example                                                               |
| --------- | ------------------------------------------------------------- | --------------------------------------------------------------------- |
| Path root | `/{app}/{env}` with deployed `{env}`                          | `/ui-platform/dev`, `/ui-platform/staging`, `/ui-platform/production` |
| Leaf name | Prefer same name the app reads (`VITE_*` for demo typed keys) | `VITE_APP_ENV`, `VITE_API_BASE_URL`                                   |
| Type      | `String` (public config only — not SecureString secrets)      | —                                                                     |
| Nesting   | Avoid extra segments; if used, only the **leaf** is kept      | `/…/staging/api/BASE` → key `BASE`                                    |

```bash
# Example: create staging API URL (public)
aws ssm put-parameter \
  --name /ui-platform/staging/VITE_API_BASE_URL \
  --type String \
  --value https://api.staging.example.com \
  --overwrite

# Point CI / local generate at that path
AWS_SSM_PATH=/ui-platform/staging pnpm config:generate
```

**Env vs SSM key shape:** shell/Docker require the `CONFIG_PREFIX` (default `VITE_`). SSM does **not** strip or require that prefix — the leaf name is used as-is. For fewer surprises, name SSM leaves exactly like the keys you pass locally (`VITE_API_BASE_URL`, etc.).

Demo builtins that already have typed helpers: `VITE_APP_ENV`, `VITE_APP_NAME`, `VITE_API_BASE_URL`, `VITE_SENTRY_DSN`, `VITE_ENABLE_MOCKS`. Any other leaf is available via `getRuntimeEnv('…')`.

## AWS: S3 + CloudFront (primary)

```text
SSM (per env) → CI (OIDC) → config:generate → pnpm build
  → s3 sync dist/ → CloudFront invalidation → users
```

Workflow: [`.github/workflows/deploy-aws.yml`](../.github/workflows/deploy-aws.yml) (`workflow_dispatch`, GitHub Environments `dev` / `staging` / `production`).

### One-time AWS / GitHub setup

1. S3 bucket per env (private; CloudFront OAC).
2. CloudFront distribution (SPA: 403/404 → `/index.html`; short/no cache for `index.html` + `config.js`; long cache for hashed `/assets/*`).
3. SSM parameters under `/ui-platform/{env}/…` (any leaf names your app needs).
4. IAM role for GitHub OIDC: `ssm:GetParametersByPath`, S3 write, `cloudfront:CreateInvalidation`.
5. GitHub Environment variables (not a second copy of every app param — those live in SSM):
   - `AWS_ROLE_ARN` as **secret** (OIDC role)
   - `AWS_REGION`, `AWS_SSM_PATH`, `S3_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID` as vars

Prefer **OIDC** over long-lived IAM user access keys.

## Local Docker (optional)

Not used for AWS SPA hosting. Useful for local container smoke tests:

```bash
cp .env.docker.example .env
pnpm docker:run    # http://localhost:8080  and  /healthz
```

Pass any prefixed env vars via `.env` / `-e`; the entrypoint writes them all into `config.js`.

## Product apps (after copy)

1. Keep `config.js` + `config:generate` + S3/CloudFront deploy pattern.
2. Use your own SSM path prefix and buckets.
3. Turn mocks off in real envs (`VITE_ENABLE_MOCKS=false` or omit mocks entirely).
4. Dockerfile optional for local only.

## What this does not cover

- Publishing packages from this repo to a registry (see [MAINTENANCE.md](MAINTENANCE.md))
- ECS/Fargate for this SPA (optional later for APIs/BFF)
- Helm / Kubernetes
- Auth backend — UI AuthZ remains client-side UX only
