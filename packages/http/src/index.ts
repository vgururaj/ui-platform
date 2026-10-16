export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type ParseSchema<T> = { parse: (data: unknown) => T };

export type TokenStorage = {
  get: () => string | null;
  set: (token: string) => void;
  clear: () => void;
};

export type HttpClientOptions = {
  /** Base URL for relative paths (e.g. from runtime config). */
  getBaseUrl: () => string;
  /** Optional bearer token storage — attaches `Authorization: Bearer …` when present. */
  getToken?: () => string | null;
  /** Called on HTTP 401 before the error is thrown (e.g. clear session + redirect). */
  onUnauthorized?: (info: { hadToken: boolean }) => void;
  /** Extract a user-facing message from an error JSON body. */
  getErrorMessage?: (body: unknown, status: number) => string;
};

export type HttpClient = {
  apiFetchParsed: <T>(path: string, schema: ParseSchema<T>, init?: RequestInit) => Promise<T>;
};

/** sessionStorage-backed opaque token helpers for bearer auth. */
export function createTokenStorage(storageKey: string): TokenStorage {
  return {
    get: () => sessionStorage.getItem(storageKey),
    set: (token) => sessionStorage.setItem(storageKey, token),
    clear: () => sessionStorage.removeItem(storageKey),
  };
}

export function defaultErrorMessage(body: unknown, _status: number): string {
  if (
    typeof body === 'object' &&
    body &&
    'error' in body &&
    typeof (body as { error: unknown }).error === 'object' &&
    (body as { error: object }).error &&
    'message' in (body as { error: object }).error &&
    typeof (body as { error: { message: unknown } }).error.message === 'string'
  ) {
    return (body as { error: { message: string } }).error.message;
  }
  return 'The request failed.';
}

function resolveUrl(path: string, getBaseUrl: () => string): string {
  if (path.startsWith('http')) return path;
  if (path.startsWith('/api')) return path;
  const base = getBaseUrl().replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Browser HTTP client that requires a Zod-compatible schema on every JSON call.
 * Wire once in the app (`src/lib/api.ts`) with runtime base URL; feature `api/*` modules use it.
 */
export function createHttpClient(options: HttpClientOptions): HttpClient {
  const { getBaseUrl, getToken, onUnauthorized, getErrorMessage = defaultErrorMessage } = options;

  return {
    async apiFetchParsed<T>(
      path: string,
      schema: ParseSchema<T>,
      init: RequestInit = {},
    ): Promise<T> {
      const headers = new Headers(init.headers);
      const token = getToken?.() ?? null;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      if (typeof init.body === 'string' && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }

      const response = await fetch(resolveUrl(path, getBaseUrl), { ...init, headers });

      if (init.signal?.aborted) {
        throw new DOMException('The operation was aborted.', 'AbortError');
      }

      const body: unknown =
        response.status === 204 ? undefined : await response.json().catch(() => undefined);

      if (!response.ok) {
        if (response.status === 401) {
          onUnauthorized?.({ hadToken: Boolean(token) });
        }
        throw new ApiError(getErrorMessage(body, response.status), response.status, body);
      }

      try {
        return schema.parse(body);
      } catch {
        throw new ApiError(
          'The service response could not be verified. Please try again.',
          502,
          undefined,
        );
      }
    },
  };
}
