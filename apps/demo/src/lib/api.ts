import { ApiError, createHttpClient } from '@vgururaj/http';
import { env } from '@/config/env';

export { ApiError };

/** App-wired HTTP client (base URL from runtime config). Feature api/* modules import from here. */
export const { apiFetchParsed } = createHttpClient({
  getBaseUrl: () => env.VITE_API_BASE_URL,
});
