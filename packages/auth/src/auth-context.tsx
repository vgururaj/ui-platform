import * as React from 'react';
import { can as canPermission } from './permissions';
import type { AuthAdapter, Permission, User } from './types';

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  can: (permission: Permission) => boolean;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export interface AuthProviderProps {
  adapter: AuthAdapter;
  children: React.ReactNode;
}

export function AuthProvider({ adapter, children }: AuthProviderProps) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    const session = await adapter.getSession();
    setUser(session.user);
  }, [adapter]);

  React.useEffect(() => {
    let active = true;
    setIsLoading(true);
    adapter
      .getSession()
      .then((session) => {
        if (active) setUser(session.user);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [adapter]);

  const login = React.useCallback(
    async (email: string, password: string) => {
      const nextUser = await adapter.login(email, password);
      setUser(nextUser);
      return nextUser;
    },
    [adapter],
  );

  const logout = React.useCallback(async () => {
    await adapter.logout();
    setUser(null);
  }, [adapter]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
      refresh,
      can: (permission: Permission) => canPermission(user, permission),
    }),
    [user, isLoading, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function usePermission(permission: Permission): boolean {
  const { can } = useAuth();
  return can(permission);
}
