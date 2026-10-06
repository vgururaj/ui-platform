import {
  Outlet,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  lazyRouteComponent,
  redirect,
} from '@tanstack/react-router';
import { isAuthRedirect, requireAuth, requirePermission, type User } from '@vgururaj/auth';
import { ErrorBoundary } from '@vgururaj/ui';
import { AppLayout } from '@/components/app-layout';
import { NotFoundPage } from '@/components/not-found-page';

export interface RouterContext {
  auth: {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  };
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
  notFoundComponent: NotFoundPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  component: lazyRouteComponent(() => import('@/features/auth/login-page'), 'LoginPage'),
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: '_app',
  component: AppLayout,
  beforeLoad: ({ context, location }) => {
    if (context.auth.isLoading) return;
    try {
      requireAuth(context.auth.user, { redirectTo: '/login' });
    } catch (error) {
      if (isAuthRedirect(error)) {
        throw redirect({
          to: '/login',
          search: { redirect: location.href },
        });
      }
      throw error;
    }
  },
});

const HomeWithBoundary = lazyRouteComponent(async () => {
  const { HomePage } = await import('@/features/home/home-page');
  return {
    default: function HomeRoute() {
      return (
        <ErrorBoundary>
          <HomePage />
        </ErrorBoundary>
      );
    },
  };
});

const indexRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/',
  component: HomeWithBoundary,
});

const adminRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/admin',
  beforeLoad: ({ context }) => {
    if (context.auth.isLoading) return;
    try {
      requirePermission(context.auth.user, 'admin:access', {
        redirectTo: '/login',
        forbiddenRedirectTo: '/access',
      });
    } catch (error) {
      if (isAuthRedirect(error)) {
        throw redirect({ to: error.redirect.to });
      }
      throw error;
    }
  },
  component: lazyRouteComponent(() => import('@/features/admin/admin-page'), 'AdminPage'),
});

const accessRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/access',
  component: lazyRouteComponent(() => import('@/features/access/access-page'), 'AccessPage'),
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  appRoute.addChildren([indexRoute, adminRoute, accessRoute]),
]);

export const router = createRouter({
  routeTree,
  context: {
    auth: {
      user: null,
      isAuthenticated: false,
      isLoading: true,
    },
  },
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
