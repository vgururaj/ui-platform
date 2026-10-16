import type { AuthAdapter, AuthSession, User } from './types';

export type ParseSchema<T> = { parse: (data: unknown) => T };

export type BearerAuthFetch = <T>(
  path: string,
  schema: ParseSchema<T>,
  init?: RequestInit,
) => Promise<T>;

export type BearerAuthAdapterOptions<TUser extends User = User> = {
  apiFetchParsed: BearerAuthFetch;
  setToken: (token: string) => void;
  clearToken: () => void;
  /** Called after login/logout when the app should drop cached queries. */
  onAuthChange?: () => void;
  loginPath?: string;
  mePath?: string;
  logoutPath?: string;
  /** Parse login response → token + user. */
  loginSchema: ParseSchema<{ token: string; user: TUser }>;
  /** Parse `/me` (or equivalent) → `{ user }`. */
  meSchema: ParseSchema<{ user: TUser }>;
};

/**
 * AuthAdapter over bearer-token HTTP endpoints (`/auth/login`, `/auth/me`, `/auth/logout`).
 * Session token storage and HTTP client stay in the app (`createHttpClient` + `createTokenStorage`).
 */
export function createBearerAuthAdapter<TUser extends User = User>(
  options: BearerAuthAdapterOptions<TUser>,
): AuthAdapter {
  const loginPath = options.loginPath ?? '/auth/login';
  const mePath = options.mePath ?? '/auth/me';
  const logoutPath = options.logoutPath ?? '/auth/logout';

  return {
    async login(email: string, password: string) {
      const result = await options.apiFetchParsed(loginPath, options.loginSchema, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      options.setToken(result.token);
      options.onAuthChange?.();
      return result.user;
    },

    async getSession(): Promise<AuthSession> {
      try {
        return await options.apiFetchParsed(mePath, options.meSchema);
      } catch {
        // Unavailable or 401 → unauthenticated browser session.
        return { user: null };
      }
    },

    async logout() {
      try {
        await options.apiFetchParsed(logoutPath, { parse: () => undefined }, { method: 'POST' });
      } catch {
        /* Local logout remains available offline; server sessions have a bounded expiry. */
      } finally {
        options.clearToken();
        options.onAuthChange?.();
      }
    },
  };
}

/** Class wrapper for apps that prefer `new BearerAuthAdapter(options)`. */
export class BearerAuthAdapter<TUser extends User = User> implements AuthAdapter {
  private readonly adapter: AuthAdapter;

  constructor(options: BearerAuthAdapterOptions<TUser>) {
    this.adapter = createBearerAuthAdapter(options);
  }

  login(email: string, password: string) {
    return this.adapter.login(email, password);
  }

  getSession() {
    return this.adapter.getSession();
  }

  logout() {
    return this.adapter.logout();
  }
}
