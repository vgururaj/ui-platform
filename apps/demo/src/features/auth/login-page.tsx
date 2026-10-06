import { useEffect, useState } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@vgururaj/auth';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@vgururaj/ui';
import { loginFormSchema, type LoginFormValues } from './schemas/login';

export function LoginPage() {
  const { t } = useTranslation();
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const redirect = useRouterState({
    select: (s) => (s.location.search as { redirect?: string }).redirect,
  });
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: 'admin@demo.local', password: 'password' },
  });

  useEffect(() => {
    if (isAuthenticated) {
      void navigate({ to: redirect || '/' });
    }
  }, [isAuthenticated, navigate, redirect]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md" data-testid="login-page">
        <CardHeader>
          <CardTitle>{t('login.title')}</CardTitle>
          <CardDescription>{t('login.help')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <Alert variant="destructive" data-testid="login-error">
              <AlertTitle>Login failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              setError(null);
              try {
                await login(values.email, values.password);
                await navigate({ to: redirect || '/' });
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Login failed');
              }
            })}
          >
            <div className="space-y-2">
              <Label htmlFor="email">{t('login.email')}</Label>
              <Input id="email" type="email" autoComplete="username" {...form.register('email')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('login.password')}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...form.register('password')}
              />
            </div>
            <Button type="submit" className="w-full" data-testid="login-submit">
              {t('login.submit')}
            </Button>
          </form>
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
        </CardContent>
      </Card>
    </div>
  );
}
