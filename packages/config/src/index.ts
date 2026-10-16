import type { z } from 'zod';

export type CreateRuntimeEnvOptions<T extends z.ZodTypeAny> = {
  schema: T;
  /**
   * Allowlisted build-time values. Pass explicit `import.meta.env.KEY` refs so
   * unrelated `VITE_*` keys are not pulled into the bundle.
   */
  buildValues: Record<string, string | undefined>;
  /** Runtime overlay (e.g. `window.__ENV__`). Defaults to browser `__ENV__` when present. */
  runtimeValues?: Record<string, string | undefined | null>;
};

export type RuntimeEnvApi<T extends z.ZodTypeAny> = {
  runtimeEnv: Readonly<Record<string, string>>;
  env: z.infer<T>;
  getRuntimeEnv: (key: string, fallback?: string) => string;
};

function readWindowEnv(): Record<string, string | undefined | null> | undefined {
  if (typeof window === 'undefined') return undefined;
  const env = (window as Window & { __ENV__?: unknown }).__ENV__;
  if (!env || typeof env !== 'object') return undefined;
  return env as Record<string, string | undefined | null>;
}

/**
 * Merge allowlisted build values with a runtime overlay, then parse with Zod.
 * Only keys present on `schema.shape` are kept (when the schema is a ZodObject).
 */
export function createRuntimeEnv<T extends z.ZodTypeAny>(
  options: CreateRuntimeEnvOptions<T>,
): RuntimeEnvApi<T> {
  const shape =
    options.schema &&
    typeof options.schema === 'object' &&
    'shape' in options.schema &&
    options.schema.shape &&
    typeof options.schema.shape === 'object'
      ? (options.schema.shape as Record<string, unknown>)
      : null;
  const allow = shape ? new Set(Object.keys(shape)) : null;

  const runtime = options.runtimeValues ?? readWindowEnv();
  const out: Record<string, string> = {};

  for (const [k, v] of Object.entries(options.buildValues)) {
    if (allow && !allow.has(k)) continue;
    if (v !== undefined) out[k] = String(v);
  }
  for (const [k, v] of Object.entries(runtime ?? {})) {
    if (allow && !allow.has(k)) continue;
    if (v !== undefined && v !== null) out[k] = String(v);
  }

  const runtimeEnv = Object.freeze({ ...out });
  const env = options.schema.parse(runtimeEnv) as z.infer<T>;

  return {
    runtimeEnv,
    env,
    getRuntimeEnv: (key: string, fallback = '') => runtimeEnv[key] ?? fallback,
  };
}
