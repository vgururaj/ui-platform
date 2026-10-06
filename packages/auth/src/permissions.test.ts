import { describe, expect, it } from 'vitest';
import { can, canAll, canAny, permissionsForRoles, roleToPermissions } from './permissions';
import type { User } from './types';

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: '1',
    email: 'a@demo.local',
    name: 'A',
    roles: ['user'],
    permissions: ['items:read', 'files:write'],
    ...overrides,
  };
}

describe('can', () => {
  it('returns false for null/undefined user', () => {
    expect(can(null, 'items:read')).toBe(false);
    expect(can(undefined, 'items:read')).toBe(false);
  });

  it('returns true when permission is present', () => {
    expect(can(makeUser(), 'items:read')).toBe(true);
  });

  it('returns false when permission is missing', () => {
    expect(can(makeUser(), 'admin:access')).toBe(false);
  });
});

describe('roleToPermissions', () => {
  it('maps admin to all permissions', () => {
    expect(roleToPermissions.admin).toContain('admin:access');
    expect(roleToPermissions.admin).toContain('items:delete');
  });

  it('maps user and viewer as documented', () => {
    expect(roleToPermissions.user).toEqual(
      expect.arrayContaining(['posts:write', 'files:write', 'items:read']),
    );
    expect(roleToPermissions.viewer).toEqual(['items:read']);
  });
});

describe('permissionsForRoles / canAny / canAll', () => {
  it('unions permissions across roles', () => {
    const perms = permissionsForRoles(['viewer', 'user']);
    expect(perms).toEqual(expect.arrayContaining(['items:read', 'files:write', 'posts:write']));
  });

  it('canAny / canAll work', () => {
    const user = makeUser();
    expect(canAny(user, ['admin:access', 'items:read'])).toBe(true);
    expect(canAll(user, ['items:read', 'files:write'])).toBe(true);
    expect(canAll(user, ['items:read', 'admin:access'])).toBe(false);
  });
});
