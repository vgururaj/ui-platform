import { useEffect } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { LoginForm, useAuth } from '@vgururaj/auth';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const redirect = useRouterState({
    select: (s) => (s.location.search as { redirect?: string }).redirect,
  });

  useEffect(() => {
    if (isAuthenticated) {
      void navigate({ to: redirect || '/' });
    }
  }, [isAuthenticated, navigate, redirect]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <LoginForm
        description={
          <>
            Mock auth — try <code>admin@demo.local</code>, <code>user@demo.local</code>, or{' '}
            <code>viewer@demo.local</code> (password: <code>password</code>).
          </>
        }
        defaultValues={{ email: 'admin@demo.local', password: 'password' }}
        onSubmit={async (values) => {
          await login(values.email, values.password);
          await navigate({ to: redirect || '/' });
        }}
      />
    </div>
  );
}
