import { Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { useAuth } from '@vgururaj/auth';
import {
  AppShell,
  Button,
  SidebarNav,
  ThemePicker,
  ThemeToggle,
  isNavPathActive,
} from '@vgururaj/ui';
import { env } from '@/config/env';
import { useThemeStore } from '@/stores/theme-store';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/admin', label: 'Admin' },
  { to: '/access', label: 'Access' },
] as const;

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <AppShell
      sidebar={
        <div className="flex h-full flex-col">
          <div className="border-b px-4 py-4 text-sm font-semibold">{env.VITE_APP_NAME}</div>
          <SidebarNav
            items={navItems.map((item) => ({
              id: item.to,
              label: item.label,
              active: isNavPathActive(pathname, item.to),
            }))}
            renderItem={(item, { className }) => (
              <Link to={item.id} className={className}>
                {item.label}
              </Link>
            )}
          />
        </div>
      }
      header={
        <div className="ml-auto flex items-center gap-3">
          <ThemePicker useThemeStore={useThemeStore} />
          <ThemeToggle useThemeStore={useThemeStore} />
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={async () => {
              await logout();
              await navigate({ to: '/login' });
            }}
          >
            Log out
          </Button>
        </div>
      }
    >
      <Outlet />
    </AppShell>
  );
}
