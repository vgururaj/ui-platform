import { env } from '@/config/env';

/** Initialize Sentry only when VITE_SENTRY_DSN is set. */
export async function initSentry(): Promise<void> {
  if (!env.VITE_SENTRY_DSN) return;
  const Sentry = await import('@sentry/react');
  Sentry.init({
    dsn: env.VITE_SENTRY_DSN,
    integrations: [],
    tracesSampleRate: 0.1,
  });
}
