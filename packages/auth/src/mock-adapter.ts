import { permissionsForRoles } from './permissions';
import type { AuthAdapter, AuthSession, User } from './types';

interface SeedAccount {
  password: string;
  user: Omit<User, 'permissions'> & { roles: string[] };
}

const SEED_ACCOUNTS: SeedAccount[] = [
  {
    password: 'password',
    user: {
      id: 'user-admin',
      email: 'admin@demo.local',
      name: 'Demo Admin',
      roles: ['admin'],
    },
  },
  {
    password: 'password',
    user: {
      id: 'user-editor',
      email: 'user@demo.local',
      name: 'Demo User',
      roles: ['user'],
    },
  },
  {
    password: 'password',
    user: {
      id: 'user-viewer',
      email: 'viewer@demo.local',
      name: 'Demo Viewer',
      roles: ['viewer'],
    },
  },
];

function toUser(account: SeedAccount): User {
  return {
    ...account.user,
    permissions: permissionsForRoles(account.user.roles),
  };
}

export class MockAuthAdapter implements AuthAdapter {
  private currentUser: User | null = null;

  constructor(initialUser: User | null = null) {
    this.currentUser = initialUser;
  }

  async login(email: string, password: string): Promise<User> {
    const account = SEED_ACCOUNTS.find(
      (entry) => entry.user.email.toLowerCase() === email.toLowerCase(),
    );

    if (!account || account.password !== password) {
      throw new Error('Invalid email or password');
    }

    this.currentUser = toUser(account);
    return this.currentUser;
  }

  async logout(): Promise<void> {
    this.currentUser = null;
  }

  async getSession(): Promise<AuthSession> {
    return { user: this.currentUser };
  }
}

export const seedUsers = SEED_ACCOUNTS.map(toUser);
