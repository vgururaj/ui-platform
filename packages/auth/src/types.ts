export type Permission = string;

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
}

export interface AuthSession {
  user: User | null;
}

export interface AuthAdapter {
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  getSession(): Promise<AuthSession>;
}
