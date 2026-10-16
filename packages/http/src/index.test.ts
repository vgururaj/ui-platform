import { describe, expect, it, vi } from 'vitest';
import { ApiError, createHttpClient, createTokenStorage, defaultErrorMessage } from './index';

describe('ApiError', () => {
  it('stores status and body', () => {
    const err = new ApiError('nope', 404, { message: 'missing' });
    expect(err.status).toBe(404);
    expect(err.body).toEqual({ message: 'missing' });
    expect(err.message).toBe('nope');
  });
});

describe('defaultErrorMessage', () => {
  it('reads nested error.message', () => {
    expect(defaultErrorMessage({ error: { message: 'Nope' } }, 400)).toBe('Nope');
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

  it('attaches bearer token and clears on 401', async () => {
    const originalFetch = globalThis.fetch;
    const onUnauthorized = vi.fn();
    globalThis.fetch = async (_url, init) => {
      const headers = new Headers(init?.headers);
      expect(headers.get('Authorization')).toBe('Bearer tok');
      return new Response(JSON.stringify({ error: { message: 'gone' } }), { status: 401 });
    };

    try {
      const client = createHttpClient({
        getBaseUrl: () => 'http://example.test',
        getToken: () => 'tok',
        onUnauthorized,
      });
      await expect(client.apiFetchParsed('/x', { parse: (d) => d })).rejects.toMatchObject({
        status: 401,
        message: 'gone',
      });
      expect(onUnauthorized).toHaveBeenCalledWith({ hadToken: true });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe('createTokenStorage', () => {
  it('round-trips sessionStorage', () => {
    const storage = createTokenStorage('test-token-key');
    storage.clear();
    expect(storage.get()).toBeNull();
    storage.set('abc');
    expect(storage.get()).toBe('abc');
    storage.clear();
    expect(storage.get()).toBeNull();
  });
});
