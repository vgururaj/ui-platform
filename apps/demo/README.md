# `@vgururaj/demo`

Exhaustive harness for `@vgururaj/ui` + `@vgururaj/auth`.

## Scripts

| Script           | Description                  |
| ---------------- | ---------------------------- |
| `pnpm dev`       | Vite dev server (`:5173`)    |
| `pnpm build`     | Typecheck + production build |
| `pnpm preview`   | Preview production build     |
| `pnpm lint`      | ESLint                       |
| `pnpm typecheck` | `tsc -b`                     |
| `pnpm test`      | Vitest unit tests            |
| `pnpm test:e2e`  | Playwright                   |

From monorepo root: `pnpm --filter @vgururaj/demo <script>` or `pnpm dev`.

## Seed logins

| Email               | Password   | Notes                                      |
| ------------------- | ---------- | ------------------------------------------ |
| `admin@demo.local`  | `password` | Full permissions                           |
| `user@demo.local`   | `password` | `posts:write`, `files:write`, `items:read` |
| `viewer@demo.local` | `password` | `items:read` only                          |

## Routes

`/login`, `/`, `/items`, `/items/$id`, `/forms`, `/uploads`, `/tabs-demo`, `/profile`, `/settings`, `/admin`, `/access`, `/errors`, 404
