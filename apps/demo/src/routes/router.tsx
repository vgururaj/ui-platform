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
import { type ItemsSearch } from '@/features/items/schemas/item';

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

/** Login stays eager — first paint / auth entry should not wait on a chunk. */
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

const ErrorsWithBoundary = lazyRouteComponent(async () => {
  const { ErrorsPage } = await import('@/features/errors/errors-page');
  return {
    default: function ErrorsRoute() {
      return (
        <ErrorBoundary>
          <ErrorsPage />
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

const itemsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/items',
  validateSearch: (search: Record<string, unknown>): ItemsSearch => ({
    q: typeof search.q === 'string' ? search.q : undefined,
    page: search.page ? Number(search.page) : undefined,
    pageSize: search.pageSize ? Number(search.pageSize) : undefined,
    sort: typeof search.sort === 'string' ? search.sort : undefined,
    order: search.order === 'desc' ? 'desc' : search.order === 'asc' ? 'asc' : undefined,
  }),
  component: lazyRouteComponent(() => import('@/features/items/items-page'), 'ItemsPage'),
});

const itemDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/items/$id',
  component: lazyRouteComponent(
    () => import('@/features/items/item-detail-page'),
    'ItemDetailPage',
  ),
});

const formsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/forms',
  component: lazyRouteComponent(() => import('@/features/items/forms-page'), 'FormsPage'),
});

const uploadsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/uploads',
  component: lazyRouteComponent(() => import('@/features/uploads/uploads-page'), 'UploadsPage'),
});

const tabsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/tabs-demo',
  component: lazyRouteComponent(() => import('@/features/tabs/tabs-demo-page'), 'TabsDemoPage'),
});

const profileRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/profile',
  component: lazyRouteComponent(() => import('@/features/profile/profile-page'), 'ProfilePage'),
});

const settingsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/settings',
  component: lazyRouteComponent(() => import('@/features/settings/settings-page'), 'SettingsPage'),
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
        throw redirect({
          to: error.redirect.to,
          search: error.reason === 'unauthenticated' ? { redirect: '/admin' } : undefined,
        });
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

const errorsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/errors',
  component: ErrorsWithBoundary,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  appRoute.addChildren([
    indexRoute,
    itemsRoute,
    itemDetailRoute,
    formsRoute,
    uploadsRoute,
    tabsRoute,
    profileRoute,
    settingsRoute,
    adminRoute,
    accessRoute,
    errorsRoute,
  ]),
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
