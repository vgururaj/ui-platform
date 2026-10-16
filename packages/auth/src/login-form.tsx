import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  FieldError,
  Input,
  Label,
} from '@vgururaj/ui';

export const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginFormValues = z.infer<typeof loginFormSchema>;

export type LoginFormProps = {
  title?: string;
  description?: ReactNode;
  defaultValues?: Partial<LoginFormValues>;
  submitLabel?: string;
  submittingLabel?: string;
  emailLabel?: string;
  passwordLabel?: string;
  errorTitle?: string;
  footer?: ReactNode;
  'data-testid'?: string;
  onSubmit: (values: LoginFormValues) => Promise<void>;
};

/** Presentational login card — routing and auth adapter stay in the app. */
export function LoginForm({
  title = 'Sign in',
  description,
  defaultValues,
  submitLabel = 'Sign in',
  submittingLabel = 'Signing in…',
  emailLabel = 'Email',
  passwordLabel = 'Password',
  errorTitle = 'Login failed',
  footer,
  'data-testid': dataTestId,
  onSubmit,
}: LoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '', ...defaultValues },
  });

  return (
    <Card className="w-full max-w-md" data-testid={dataTestId}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <Alert variant="destructive" data-testid={dataTestId ? `${dataTestId}-error` : undefined}>
            <AlertTitle>{errorTitle}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            setError(null);
            try {
              await onSubmit(values);
            } catch (err) {
              setError(err instanceof Error ? err.message : errorTitle);
            }
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="email">{emailLabel}</Label>
            <Input id="email" type="email" autoComplete="username" {...form.register('email')} />
            <FieldError>{form.formState.errors.email?.message}</FieldError>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{passwordLabel}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...form.register('password')}
            />
            <FieldError>{form.formState.errors.password?.message}</FieldError>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
            data-testid={dataTestId ? `${dataTestId}-submit` : undefined}
          >
            {form.formState.isSubmitting ? submittingLabel : submitLabel}
          </Button>
        </form>
        {footer}
      </CardContent>
    </Card>
  );
}
