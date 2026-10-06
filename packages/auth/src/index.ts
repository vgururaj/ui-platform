export type { AuthAdapter, AuthSession, Permission, User } from './types';

export {
  ALL_PERMISSIONS,
  can,
  canAll,
  canAny,
  permissionsForRoles,
  roleToPermissions,
  type KnownPermission,
} from './permissions';

export { MockAuthAdapter, seedUsers } from './mock-adapter';

export {
  AuthProvider,
  useAuth,
  usePermission,
  type AuthContextValue,
  type AuthProviderProps,
} from './auth-context';

export { Can, type CanMode, type CanProps } from './can';

export {
  isAuthRedirect,
  requireAuth,
  requirePermission,
  type AuthRedirect,
  type RequireAuthOptions,
  type RequirePermissionOptions,
} from './guards';
