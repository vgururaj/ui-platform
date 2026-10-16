import { ApiError, createHttpClient, createTokenStorage } from '@vgururaj/http';
import { env } from '@/config/env';

export { ApiError };

const tokens = createTokenStorage('app-session');
export const setSession = tokens.set;
export const clearSession = tokens.clear;
export const getSessionToken = tokens.get;

export const { apiFetchParsed } = createHttpClient({
  getBaseUrl: () => env.VITE_API_BASE_URL,
  getToken: tokens.get,
  onUnauthorized: ({ hadToken }) => {
    tokens.clear();
    if (hadToken && window.location.pathname !== '/login') {
      window.location.assign('/login');
    }
  },
});
