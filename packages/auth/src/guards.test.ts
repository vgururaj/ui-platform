import { describe, expect, it } from 'vitest';
import { isAuthRedirect, requireAuth, requirePermission } from './guards';
import type { User } from './types';

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: '1',
    email: 'a@demo.local',
    name: 'A',
    roles: ['user'],
    permissions: ['items:read', 'posts:write'],
    ...overrides,
  };
}

describe('requireAuth', () => {
  it('returns true when user present', () => {
    expect(requireAuth(makeUser())).toBe(true);
  });

  it('throws AuthRedirect when missing', () => {
    expect(() => requireAuth(null)).toThrow();
    try {
      requireAuth(null, { redirectTo: '/login' });
    } catch (e) {
      expect(isAuthRedirect(e)).toBe(true);
      if (isAuthRedirect(e)) {
        expect(e.reason).toBe('unauthenticated');
        expect(e.redirect.to).toBe('/login');
      }
    }
  });

  it('returns false when throwOnFail is false', () => {
    expect(requireAuth(null, { throwOnFail: false })).toBe(false);
  });
});

describe('requirePermission', () => {
  it('allows when permission present', () => {
    expect(requirePermission(makeUser(), 'posts:write')).toBe(true);
  });

  it('throws forbidden when authenticated without permission', () => {
    try {
      requirePermission(makeUser(), 'admin:access', { forbiddenRedirectTo: '/access' });
      expect.unreachable();
    } catch (e) {
      expect(isAuthRedirect(e)).toBe(true);
      if (isAuthRedirect(e)) {
        expect(e.reason).toBe('forbidden');
        expect(e.redirect.to).toBe('/access');
      }
    }
  });

  it('throws unauthenticated when no user', () => {
    try {
      requirePermission(null, 'admin:access');
      expect.unreachable();
    } catch (e) {
      expect(isAuthRedirect(e)).toBe(true);
      if (isAuthRedirect(e)) expect(e.reason).toBe('unauthenticated');
    }
  });
});
