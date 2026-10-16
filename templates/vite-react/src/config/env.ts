import { z } from 'zod';
import { createRuntimeEnv } from '@vgururaj/config';

/** Allowlisted public configuration; backend and build secrets are never runtime values. */
const knownSchema = z.object({
  VITE_APP_ENV: z.enum(['local', 'dev', 'staging', 'production']).default('local'),
  VITE_APP_NAME: z.string().default('vite-react template'),
  VITE_API_BASE_URL: z.string().default('/api'),
  VITE_SENTRY_DSN: z.string().optional().default(''),
  VITE_ENABLE_MOCKS: z
    .enum(['true', 'false', ''])
    .optional()
    .default('false')
    .transform((v) => v !== 'false' && v !== ''),
});

const { runtimeEnv, env, getRuntimeEnv } = createRuntimeEnv({
  schema: knownSchema,
  // Static references keep unrelated VITE_ variables out of the compiled bundle.
  buildValues: {
    VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
    VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
    VITE_ENABLE_MOCKS: import.meta.env.VITE_ENABLE_MOCKS,
  },
});

export { runtimeEnv, env, getRuntimeEnv };
