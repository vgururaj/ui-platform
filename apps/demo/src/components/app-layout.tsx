import { Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Can, useAuth } from '@vgururaj/auth';
import {
  AppShell,
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@vgururaj/ui';
import {
  LayoutDashboard,
  List,
  FormInput,
  Upload,
  Table2,
  Shield,
  Lock,
  Bug,
  Menu,
  Moon,
  Sun,
  Monitor,
  LogOut,
  User,
  Settings,
} from 'lucide-react';
import { useState } from 'react';
import { useThemeStore, type ThemeMode } from '@/stores/theme-store';
import i18n from '@/i18n';

const navItems = [
  { to: '/', labelKey: 'nav.home', icon: LayoutDashboard },
  { to: '/items', labelKey: 'nav.items', icon: List },
  { to: '/forms', labelKey: 'nav.forms', icon: FormInput },
  { to: '/uploads', labelKey: 'nav.uploads', icon: Upload },
  { to: '/tabs-demo', labelKey: 'nav.tabs', icon: Table2 },
  { to: '/access', labelKey: 'nav.access', icon: Shield },
  { to: '/admin', labelKey: 'nav.admin', icon: Lock, permission: 'admin:access' as const },
  { to: '/errors', labelKey: 'nav.errors', icon: Bug },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-col gap-1 p-3" data-testid="sidebar-nav">
      {navItems.map((item) => {
        const active = item.to === '/' ? pathname === '/' : pathname.startsWith(item.to);
        const link = (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
              active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted'
            }`}
            data-testid={`nav-${item.to.replace(/\//g, '').replace(/^-/, '') || 'home'}`}
          >
            <item.icon className="h-4 w-4" />
            {t(item.labelKey)}
          </Link>
        );
        if (item.permission) {
          return (
            <Can key={item.to} permission={item.permission} mode="hide">
              {link}
            </Can>
          );
        }
        return link;
      })}
    </nav>
  );
}

function ThemeToggle() {
  const { mode, cycle } = useThemeStore();
  const Icon = mode === 'dark' ? Moon : mode === 'light' ? Sun : Monitor;
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycle}
      aria-label={`Theme: ${mode}`}
      data-testid="theme-toggle"
      title={`Theme: ${mode as ThemeMode}`}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}

function LocaleSwitcher() {
  const { i18n: i18next } = useTranslation();
  return (
    <Button
      variant="outline"
      size="sm"
      data-testid="locale-switcher"
      onClick={() => {
        const next = i18next.language === 'en' ? 'es' : 'en';
        void i18n.changeLanguage(next);
        localStorage.setItem('demo-locale', next);
      }}
    >
      {i18next.language.toUpperCase()}
    </Button>
  );
}

function UserMenu() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 px-2" data-testid="user-menu">
          <Avatar className="h-7 w-7">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm md:inline">{user.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{user.name}</span>
            <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void navigate({ to: '/profile' })}>
          <User className="mr-2 h-4 w-4" /> {t('nav.profile')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void navigate({ to: '/settings' })}>
          <Settings className="mr-2 h-4 w-4" /> {t('nav.settings')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          data-testid="logout-button"
          onClick={async () => {
            await logout();
            await navigate({ to: '/login' });
          }}
        >
          <LogOut className="mr-2 h-4 w-4" /> {t('nav.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppLayout() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <AppShell
      sidebar={
        <div className="flex h-full flex-col">
          <div className="border-b px-4 py-4 text-sm font-semibold">ui-platform</div>
          <NavLinks />
        </div>
      }
      header={
        <>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" data-testid="mobile-menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
                <SheetHeader className="border-b px-4 py-3 text-left">
                  <SheetTitle>{t('nav.home')}</SheetTitle>
                </SheetHeader>
                <NavLinks onNavigate={() => setOpen(false)} />
              </motion.div>
            </SheetContent>
          </Sheet>
          <div className="font-medium md:hidden">ui-platform</div>
          <div className="ml-auto flex items-center gap-2">
            <LocaleSwitcher />
            <ThemeToggle />
            <UserMenu />
          </div>
        </>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Outlet />
      </motion.div>
    </AppShell>
  );
}
