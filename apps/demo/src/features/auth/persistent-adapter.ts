import { MockAuthAdapter, type AuthAdapter, type AuthSession, type User } from '@vgururaj/auth';

const STORAGE_KEY = 'demo-auth-user';

/**
 * Wraps MockAuthAdapter with localStorage so refresh / e2e reloads keep the session.
 */
export class PersistentMockAuthAdapter implements AuthAdapter {
  private inner = new MockAuthAdapter(readStoredUser());

  async login(email: string, password: string): Promise<User> {
    const user = await this.inner.login(email, password);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  async logout(): Promise<void> {
    await this.inner.logout();
    localStorage.removeItem(STORAGE_KEY);
  }

  async getSession(): Promise<AuthSession> {
    const stored = readStoredUser();
    if (stored) {
      this.inner = new MockAuthAdapter(stored);
      return { user: stored };
    }
    return this.inner.getSession();
  }
}

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export const authAdapter = new PersistentMockAuthAdapter();
