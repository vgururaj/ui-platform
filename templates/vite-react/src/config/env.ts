import { z } from 'zod';

/** Known keys (typed). Extra keys from config.js / SSM are available via `runtimeEnv` / `getRuntimeEnv`. */
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

/**
 * Full runtime map: every key from `window.__ENV__` (SSM / config:generate / Docker).
 * Prefer this when adding new settings — no code change required beyond reading the key.
 */
function readAllRaw(): Record<string, string> {
  const runtime =
    typeof window !== 'undefined' && window.__ENV__ && typeof window.__ENV__ === 'object'
      ? window.__ENV__
      : undefined;

  if (runtime) {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(runtime)) {
      if (v !== undefined && v !== null) out[k] = String(v);
    }
    return out;
  }

  const out: Record<string, string> = {};
  const meta = import.meta.env as Record<string, string | undefined>;
  for (const [k, v] of Object.entries(meta)) {
    if (k.startsWith('VITE_') && v !== undefined) out[k] = String(v);
  }
  return out;
}

export const runtimeEnv: Readonly<Record<string, string>> = readAllRaw();

/** Typed accessors for built-in settings. */
export const env = knownSchema.parse(runtimeEnv);

/** Read any runtime key (from SSM / config.js) with optional default. */
export function getRuntimeEnv(key: string, fallback = ''): string {
  return runtimeEnv[key] ?? fallback;
}
