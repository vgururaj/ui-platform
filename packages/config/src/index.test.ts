import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createRuntimeEnv } from './index';

const schema = z.object({
  VITE_APP_NAME: z.string().default('App'),
  VITE_API_BASE_URL: z.string().default('/api'),
});

describe('createRuntimeEnv', () => {
  it('merges allowlisted build values and parses', () => {
    const { env, runtimeEnv, getRuntimeEnv } = createRuntimeEnv({
      schema,
      buildValues: {
        VITE_APP_NAME: 'Ops',
        VITE_API_BASE_URL: 'http://localhost:8080',
        VITE_SECRET: 'leak',
      },
      runtimeValues: {},
    });
    expect(env.VITE_APP_NAME).toBe('Ops');
    expect(runtimeEnv.VITE_SECRET).toBeUndefined();
    expect(getRuntimeEnv('VITE_API_BASE_URL')).toBe('http://localhost:8080');
  });

  it('lets runtime overlay win over build values', () => {
    const { env } = createRuntimeEnv({
      schema,
      buildValues: { VITE_APP_NAME: 'Build' },
      runtimeValues: { VITE_APP_NAME: 'Runtime' },
    });
    expect(env.VITE_APP_NAME).toBe('Runtime');
  });
});
