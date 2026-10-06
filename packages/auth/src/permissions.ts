import type { Permission, User } from './types';

export const ALL_PERMISSIONS = [
  'items:read',
  'items:write',
  'items:delete',
  'files:write',
  'posts:write',
  'settings:write',
  'admin:access',
] as const satisfies readonly Permission[];

export type KnownPermission = (typeof ALL_PERMISSIONS)[number];

export const roleToPermissions: Record<string, Permission[]> = {
  admin: [...ALL_PERMISSIONS],
  user: ['posts:write', 'files:write', 'items:read'],
  viewer: ['items:read'],
};

export function can(user: User | null | undefined, permission: Permission): boolean {
  if (!user) return false;
  return user.permissions.includes(permission);
}

export function canAny(user: User | null | undefined, permissions: Permission[]): boolean {
  return permissions.some((permission) => can(user, permission));
}

export function canAll(user: User | null | undefined, permissions: Permission[]): boolean {
  return permissions.every((permission) => can(user, permission));
}

export function permissionsForRoles(roles: string[]): Permission[] {
  const set = new Set<Permission>();
  for (const role of roles) {
    const perms = roleToPermissions[role] ?? [];
    for (const perm of perms) set.add(perm);
  }
  return [...set];
}
