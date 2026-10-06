import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from './auth-context';
import { Can } from './can';
import { MockAuthAdapter } from './mock-adapter';
import type { User } from './types';

const adminUser: User = {
  id: 'user-admin',
  email: 'admin@demo.local',
  name: 'Demo Admin',
  roles: ['admin'],
  permissions: [
    'items:read',
    'items:write',
    'items:delete',
    'files:write',
    'posts:write',
    'settings:write',
    'admin:access',
  ],
};

const viewerUser: User = {
  id: 'user-viewer',
  email: 'viewer@demo.local',
  name: 'Demo Viewer',
  roles: ['viewer'],
  permissions: ['items:read'],
};

function renderWithAuth(ui: ReactElement, user: User | null) {
  const adapter = new MockAuthAdapter(user);
  return render(<AuthProvider adapter={adapter}>{ui}</AuthProvider>);
}

describe('Can', () => {
  it('renders children when permission is granted', async () => {
    renderWithAuth(
      <Can permission="admin:access">
        <button type="button">Admin</button>
      </Can>,
      adminUser,
    );

    expect(await screen.findByRole('button', { name: 'Admin' })).toBeInTheDocument();
  });

  it('hides children when permission is denied (default mode)', async () => {
    renderWithAuth(
      <Can permission="admin:access" fallback={<span>denied</span>}>
        <button type="button">Admin</button>
      </Can>,
      viewerUser,
    );

    expect(await screen.findByText('denied')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Admin' })).not.toBeInTheDocument();
  });

  it('disables children when mode is disable', async () => {
    renderWithAuth(
      <Can permission="admin:access" mode="disable">
        <button type="button">Admin</button>
      </Can>,
      viewerUser,
    );

    const button = await screen.findByRole('button', { name: 'Admin' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });
});
