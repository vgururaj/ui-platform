import { ApiError, createHttpClient } from '@vgururaj/http';
import { env } from '@/config/env';

export { ApiError };

export const { apiFetchParsed } = createHttpClient({
  getBaseUrl: () => env.VITE_API_BASE_URL,
});
