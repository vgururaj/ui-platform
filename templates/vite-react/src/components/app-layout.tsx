import { Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { useAuth } from '@vgururaj/auth';
import { AppShell, Button } from '@vgururaj/ui';
import { Monitor, Moon, Sun } from 'lucide-react';
import { env } from '@/config/env';
import { useThemeStore, type ThemeMode } from '@/stores/theme-store';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/admin', label: 'Admin' },
  { to: '/access', label: 'Access' },
] as const;

function ThemeToggle() {
  const { mode, cycle } = useThemeStore();
  const Icon = mode === 'dark' ? Moon : mode === 'light' ? Sun : Monitor;
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycle}
      aria-label={`Theme: ${mode}`}
      title={`Theme: ${mode as ThemeMode}`}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <AppShell
      sidebar={
        <div className="flex h-full flex-col">
          <div className="border-b px-4 py-4 text-sm font-semibold">{env.VITE_APP_NAME}</div>
          <nav className="flex flex-col gap-1 p-3">
            {navItems.map((item) => {
              const active = item.to === '/' ? pathname === '/' : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-md px-3 py-2 text-sm transition-colors ${
                    active
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      }
      header={
        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
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
