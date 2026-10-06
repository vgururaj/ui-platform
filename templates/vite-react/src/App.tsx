import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { AuthProvider, MockAuthAdapter, useAuth } from '@vgururaj/auth';
import { Toaster, TooltipProvider } from '@vgururaj/ui';
import { queryClient } from '@/lib/query-client';
import { router } from '@/routes/router';

const authAdapter = new MockAuthAdapter();

function AuthedRouter() {
  const auth = useAuth();

  useEffect(() => {
    router.update({
      context: {
        auth: {
          user: auth.user,
          isAuthenticated: auth.isAuthenticated,
          isLoading: auth.isLoading,
        },
      },
    });
    void router.invalidate();
  }, [auth.isAuthenticated, auth.isLoading, auth.user]);

  if (auth.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading session…
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider adapter={authAdapter}>
        <TooltipProvider>
          <AuthedRouter />
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
