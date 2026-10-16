import { useEffect } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { LoginForm, useAuth } from '@vgururaj/auth';
import { Button } from '@vgururaj/ui';

export function LoginPage() {
  const { t } = useTranslation();
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
        data-testid="login-page"
        title={t('login.title')}
        description={t('login.help')}
        emailLabel={t('login.email')}
        passwordLabel={t('login.password')}
        submitLabel={t('login.submit')}
        defaultValues={{ email: 'admin@demo.local', password: 'password' }}
        onSubmit={async (values) => {
          await login(values.email, values.password);
          await navigate({ to: redirect || '/' });
        }}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled
              title={t('login.googleHint')}
            >
              {t('login.google')}
            </Button>
            <p className="text-xs text-muted-foreground">{t('login.googleHint')}</p>
          </>
        }
      />
    </div>
  );
}
