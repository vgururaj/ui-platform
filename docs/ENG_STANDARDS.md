# Engineering standards

Quality, security, and escape-hatch policy for `ui-platform`.

## Gate matrix

| Gate                                             | Local pre-commit | Local pre-push (`pnpm verify`) | `pnpm verify:all` | CI (merge-blocking)       |
| ------------------------------------------------ | ---------------- | ------------------------------ | ----------------- | ------------------------- |
| Prettier / ESLint (staged)                       | Yes              | —                              | —                 | —                         |
| Scaffold parity (`audit:scaffold`)               | —                | Yes                            | Yes               | Yes (`quality`)           |
| format:check, lint, typecheck, test, build, size | —                | Yes                            | Yes               | Yes (`quality` + size)    |
| Secrets (gitleaks)                               | —                | Yes                            | Yes               | Yes (`secrets`)           |
| High/critical `pnpm audit` (or allowlist)        | —                | —                              | Yes               | Yes (`audit`)             |
| Playwright e2e                                   | —                | —                              | Yes               | Yes (`e2e`)               |
| Docker image build (local smoke)                 | —                | —                              | Yes               | Yes (`docker`)            |
| Low/moderate audit, coverage                     | —                | —                              | —                 | Advisory only             |
| AWS S3 deploy                                    | —                | —                              | —                 | Manual (`deploy-aws.yml`) |

## Local commands

```bash
pnpm verify           # secrets + scaffold parity + quality + size (also husky pre-push)
pnpm verify:all       # full merge-blocking suite (includes audit, e2e, docker)
pnpm audit:scaffold   # demo↔template day-1 parity (also inside verify)
pnpm audit:check      # high/critical vulns must be fixed or allowlisted
pnpm secrets:check    # gitleaks
pnpm size:check       # package bundle budgets
pnpm config:generate  # write config.js from env or AWS SSM
```

## Escape hatch ladder

Prefer the smallest bypass that unblocks genuine edge cases:

1. **Fix** the underlying issue.
2. **Line-level** `eslint-disable-next-line` / `@ts-expect-error` with a reason comment.
3. **Allowlist** entry under [`security/`](../security/) (CODEOWNERS-reviewed) with owner + expiry.
4. **Advisory** jobs — low/moderate audit and coverage warn but do not block.
5. **Local hook skip** — `HUSKY=0` or `git push --no-verify` (emergency only). **CI still enforces** secrets, quality, high/critical audit, e2e, and docker.
6. **Break-glass merge** — admin override on GitHub with a PR note + follow-up issue within 48h.

Never: permanent “skip CI” labels, deleting gitleaks, or removing `--frozen-lockfile` from CI.

## Secrets

Do not skip secret scanning without a security owner. Local skip does **not** waive CI.

Frontend `config.js` / SSM params used for the SPA are **visible in the browser** — never put private API keys or credentials there.

## Dependency vulnerabilities

- **High / critical:** must be fixed **or** listed in [`security/audit-allowlist.json`](../security/audit-allowlist.json) (reason, owner, `expires`). CI fails otherwise.
- **Low / moderate:** advisory; fix when practical.

Allowlist changes require CODEOWNERS review once branch protection is enabled.

## Deploy hygiene

- **AWS (primary):** S3 + CloudFront; public config from SSM via `pnpm config:generate` (dynamic keys — no script allowlist). See [DEPLOY.md](DEPLOY.md).
- **Docker (local only):** multi-stage image; `10-runtime-env.sh` writes all prefixed env vars into `config.js`; `/healthz` for probes.
- Do not maintain a second copy of app config in GitHub Variables when SSM is the source of truth (GitHub holds OIDC/AWS plumbing vars only).
- Helm/Kubernetes is not part of this scaffold.

## CODEOWNERS (light touch)

Only high-risk paths are owned (CI, security allowlists, Docker/deploy, shared ESLint, this doc). Day-to-day work in `apps/demo` and most of `packages/ui` / `packages/auth` is not gated by code owners. See [`.github/CODEOWNERS`](../.github/CODEOWNERS).
