export type Permission = string;

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
  /** Optional break-glass platform principal for multi-tenant apps. */
  isPlatformAdmin?: boolean;
}

export interface AuthSession {
  user: User | null;
}

export interface AuthAdapter {
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  getSession(): Promise<AuthSession>;
}

/** True when the user carries the optional platform-admin claim. */
export function isPlatformAdmin(user: User | null | undefined): boolean {
  return Boolean(user?.isPlatformAdmin);
}
