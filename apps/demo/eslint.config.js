import viteApp from '@vgururaj/eslint-config/vite-app';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { ignores: ['public/mockServiceWorker.js', 'dist', 'playwright-report', 'test-results'] },
  ...viteApp,
];
