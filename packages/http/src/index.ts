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

export type HttpClientOptions = {
  /** Base URL for relative paths (e.g. from runtime config). */
  getBaseUrl: () => string;
};

export type HttpClient = {
  apiFetchParsed: <T>(path: string, schema: ParseSchema<T>, init?: RequestInit) => Promise<T>;
};

function resolveUrl(path: string, getBaseUrl: () => string): string {
  if (path.startsWith('http')) return path;
  if (path.startsWith('/api')) return path;
  const base = getBaseUrl().replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

async function fetchJson(
  path: string,
  getBaseUrl: () => string,
  init?: RequestInit,
): Promise<unknown> {
  const response = await fetch(resolveUrl(path, getBaseUrl), {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (init?.signal?.aborted) {
    throw new DOMException('The operation was aborted.', 'AbortError');
  }

  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = undefined;
    }
    throw new ApiError(`Request failed (${response.status})`, response.status, body);
  }

  if (response.status === 204) return undefined;
  return response.json();
}

/**
 * Browser HTTP client that requires a Zod-compatible schema on every JSON call.
 * Wire once in the app (`src/lib/api.ts`) with runtime base URL; feature `api/*` modules use it.
 */
export function createHttpClient(options: HttpClientOptions): HttpClient {
  const { getBaseUrl } = options;

  return {
    async apiFetchParsed<T>(path: string, schema: ParseSchema<T>, init?: RequestInit): Promise<T> {
      const raw = await fetchJson(path, getBaseUrl, init);
      return schema.parse(raw);
    },
  };
}
