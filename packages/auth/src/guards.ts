import { can } from './permissions';
import type { Permission, User } from './types';

/**
 * Redirect-like object thrown/returned from route guards.
 * Compatible with TanStack Router `beforeLoad` patterns:
 *
 * ```ts
 * beforeLoad: ({ context }) => {
 *   requireAuth(context.auth.user, { redirectTo: '/login' });
 * }
 * ```
 */
export interface AuthRedirect {
  redirect: { to: string };
  reason: 'unauthenticated' | 'forbidden';
}

export function isAuthRedirect(value: unknown): value is AuthRedirect {
  return (
    typeof value === 'object' &&
    value !== null &&
    'redirect' in value &&
    'reason' in value &&
    typeof (value as AuthRedirect).redirect?.to === 'string'
  );
}

export interface RequireAuthOptions {
  /** When true (default), throws an AuthRedirect. When false, returns boolean. */
  throwOnFail?: boolean;
  redirectTo?: string;
}

/**
 * Ensure a user is authenticated.
 * @returns true when authenticated; false or throws AuthRedirect when not.
 */
export function requireAuth(
  user: User | null | undefined,
  options: RequireAuthOptions = {},
): boolean {
  const { throwOnFail = true, redirectTo = '/login' } = options;
  if (user) return true;

  if (throwOnFail) {
    const redirect: AuthRedirect = {
      redirect: { to: redirectTo },
      reason: 'unauthenticated',
    };
    throw redirect;
  }

  return false;
}

export interface RequirePermissionOptions extends RequireAuthOptions {
  forbiddenRedirectTo?: string;
}

/**
 * Ensure a user has a permission (and is authenticated).
 * @returns true when allowed; false or throws AuthRedirect when not.
 */
export function requirePermission(
  user: User | null | undefined,
  permission: Permission,
  options: RequirePermissionOptions = {},
): boolean {
  const { throwOnFail = true, redirectTo = '/login', forbiddenRedirectTo = '/access' } = options;

  if (!user) {
    if (throwOnFail) {
      const redirect: AuthRedirect = {
        redirect: { to: redirectTo },
        reason: 'unauthenticated',
      };
      throw redirect;
    }
    return false;
  }

  if (can(user, permission)) return true;

  if (throwOnFail) {
    const redirect: AuthRedirect = {
      redirect: { to: forbiddenRedirectTo },
      reason: 'forbidden',
    };
    throw redirect;
  }

  return false;
}
