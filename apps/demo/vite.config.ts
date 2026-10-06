import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { platformManualChunks } from '../../scripts/vite-manual-chunks.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: '@vgururaj/ui/styles.css',
        replacement: path.resolve(__dirname, '../../packages/ui/src/styles/globals.css'),
      },
      {
        find: '@vgururaj/ui',
        replacement: path.resolve(__dirname, '../../packages/ui/src/index.ts'),
      },
      {
        find: '@vgururaj/auth',
        replacement: path.resolve(__dirname, '../../packages/auth/src/index.ts'),
      },
      {
        find: '@vgururaj/http',
        replacement: path.resolve(__dirname, '../../packages/http/src/index.ts'),
      },
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
      },
    ],
  },
  server: {
    port: 5173,
  },
  optimizeDeps: {
    exclude: ['@vgururaj/ui', '@vgururaj/auth', '@vgururaj/http'],
  },
  build: {
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: platformManualChunks,
      },
    },
  },
});
