import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { env } from './config/env';
import { initSentry } from './lib/sentry';
import './i18n';
import './styles.css';

async function enableMocking() {
  if (import.meta.env.MODE === 'test') return;
  if (!env.VITE_ENABLE_MOCKS) return;
  const { worker } = await import('./mocks/browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: '/mockServiceWorker.js' },
  });
}

void (async () => {
  await initSentry();
  await enableMocking();
  const root = document.getElementById('root');
  if (!root) throw new Error('Root element #root not found');
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
})();
