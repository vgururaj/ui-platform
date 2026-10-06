import { describe, expect, it } from 'vitest';
import { ApiError, createHttpClient } from './index';

describe('ApiError', () => {
  it('stores status and body', () => {
    const err = new ApiError('nope', 404, { message: 'missing' });
    expect(err.status).toBe(404);
    expect(err.body).toEqual({ message: 'missing' });
    expect(err.message).toBe('nope');
  });
});

describe('createHttpClient', () => {
  it('parses JSON with the provided schema', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    try {
      const client = createHttpClient({ getBaseUrl: () => '/api' });
      const result = await client.apiFetchParsed('/api/ping', {
        parse: (data: unknown) => data as { ok: boolean },
      });
      expect(result).toEqual({ ok: true });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
