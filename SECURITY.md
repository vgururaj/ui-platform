# Security

## Reporting a vulnerability

If you discover a security issue in this repository:

1. **Do not** open a public GitHub issue for sensitive details.
2. Contact the maintainer privately (GitHub security advisory once the repo is published, or email the repo owner).
3. Include steps to reproduce, impact, and affected versions/paths when possible.

We will acknowledge the report and work on a fix or mitigation timeline.

## In-repo controls

- Secret scanning via gitleaks (`pnpm secrets:check`, CI `secrets` job)
- Dependency audit for high/critical findings (`pnpm audit:check`, CI `audit` job)
- Allowlists under [`security/`](security/) are review-gated (see CODEOWNERS)

See [docs/ENG_STANDARDS.md](docs/ENG_STANDARDS.md) for the full gate and escape-hatch policy.

## Runtime config (public by design)

The SPA loads `/config.js` → `window.__ENV__`. That file is **visible to every browser** (local `public/config.js`, Docker entrypoint output, or CI-generated from SSM).

- Put only **non-secret** settings there (API base URLs, feature flags, public client IDs, etc.).
- **Never** put private API keys, passwords, signing secrets, or service credentials in SSM params (or env vars) that feed `config.js`.
- Generator is generic (`pnpm config:generate`): every SSM leaf / prefixed env var is emitted — treat the SSM path as a public config surface.

Details: [docs/DEPLOY.md](docs/DEPLOY.md).

## AWS deploy credentials

Preferred path: **S3 + CloudFront** with GitHub Actions **OIDC** (no long-lived IAM user keys in GitHub).

- Store `AWS_ROLE_ARN` as a GitHub Environment **secret**.
- Keep app settings in SSM; GitHub vars hold plumbing only (`AWS_REGION`, `AWS_SSM_PATH`, bucket, CloudFront id).
- Allowed names: **`local`** (workstation only); deployed **`dev`**, **`staging`**, **`production`** (see [README.md](README.md#environment-names)).
- AuthZ in `@vgururaj/auth` is **client-side UX only** — real authorization belongs on the API/BFF.

## Related

- [docs/ENG_STANDARDS.md](docs/ENG_STANDARDS.md) — CI gates / escape hatches
- [docs/DEPLOY.md](docs/DEPLOY.md) — config + S3/CloudFront + local Docker
- [docs/AUTH.md](docs/AUTH.md) — mock AuthN / permission AuthZ
