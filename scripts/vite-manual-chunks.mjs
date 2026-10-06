/**
 * Shared Rollup manualChunks for Vite apps in this monorepo.
 * Import from app vite.config.ts — keep vendor splits consistent.
 */
export function platformManualChunks(id) {
  if (!id.includes('node_modules')) return;
  if (id.includes('/msw/')) return 'msw';
  if (id.includes('recharts') || id.includes('/d3-')) return 'charts';
  if (id.includes('@tanstack/')) return 'tanstack';
  if (id.includes('@radix-ui/') || id.includes('lucide-react')) return 'ui-vendor';
  if (id.includes('/node_modules/react-dom/') || id.includes('/node_modules/react/')) {
    return 'react-vendor';
  }
  if (id.includes('/zod/')) return 'zod';
}
