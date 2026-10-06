# Authentication & authorization

## AuthN (who you are)

`@vgururaj/auth` exposes:

- `AuthAdapter` — implement against your IdP or API; swap without rewriting UI
- `AuthProvider` / `useAuth`
- `MockAuthAdapter` — in-memory seed users for local/demo

### Demo seed users

| Email               | Password   | Permissions                                |
| ------------------- | ---------- | ------------------------------------------ |
| `admin@demo.local`  | `password` | all (`ALL_PERMISSIONS`)                    |
| `user@demo.local`   | `password` | `posts:write`, `files:write`, `items:read` |
| `viewer@demo.local` | `password` | `items:read`                               |

The demo wraps the mock adapter in `PersistentMockAuthAdapter` (`apps/demo/src/features/auth/persistent-adapter.ts`) so refresh and Playwright reloads keep the session in `localStorage`. The template uses plain `MockAuthAdapter` (session resets on full reload).

“Continue with Google” on the demo login page is presentational only.

## AuthZ (what you can do)

Permissions are string capabilities (e.g. `items:delete`, `files:write`, `admin:access`).

| API                              | Role                                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------ |
| `can` / `canAny` / `canAll`      | Imperative checks                                                                                |
| `usePermission`                  | Hook                                                                                             |
| `<Can mode="hide" \| "disable">` | Declarative UI gating                                                                            |
| `requireAuth`                    | Route `beforeLoad` — must be signed in                                                           |
| `requirePermission`              | Route `beforeLoad` — must have capability (demo `/admin` redirects forbidden users to `/access`) |

| `Can` mode | Use                                            |
| ---------- | ---------------------------------------------- |
| `hide`     | Remove from UI (nav, whole sections)           |
| `disable`  | Visible but not actionable (pair with tooltip) |

### Hard rule

**Frontend AuthZ is UX only.** Backends must enforce the same checks. Hiding a button does not secure an API.

## Swapping adapters

Implement `AuthAdapter`, pass it into `AuthProvider`, keep `Can` and route guards unchanged.

## Related

- [ARCHITECTURE.md](ARCHITECTURE.md)
- [DEPLOY.md](DEPLOY.md) — public config only; never put secrets in `config.js`
