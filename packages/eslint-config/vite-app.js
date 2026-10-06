import base from './base.js';

/**
 * Rules for Vite apps (demo, template, product apps).
 * - No cross-feature imports via @/features/*
 * - No raw fetch outside the http package / app lib wiring
 * - UI pages cannot call apiFetchParsed or import zod
 */
export default [
  ...base,
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*', '@/features/*/*', '@/features/*/**'],
              message:
                'Inside a feature, use relative imports (./ or ../). Do not import other features — compose in routes or App.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/**/*-page.tsx', 'src/components/**/*.{ts,tsx}', 'src/App.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/lib/api',
              importNames: ['apiFetchParsed'],
              message:
                'Do not call HTTP from UI. Use a feature api/* helper that validates with Zod.',
            },
            {
              name: '@vgururaj/http',
              importNames: ['apiFetchParsed', 'createHttpClient'],
              message:
                'Do not call HTTP from UI. Wire createHttpClient in src/lib/api.ts; use feature api/* helpers.',
            },
            {
              name: 'zod',
              message:
                'Keep Zod in features/*/schemas (and api/*). Pages import schemas/types only.',
            },
          ],
        },
      ],
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message:
            'Do not call fetch from UI. Use features/*/api helpers (apiFetchParsed + Zod) or the upload helper.',
        },
      ],
    },
  },
  {
    files: ['src/features/*/api/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message: 'Use apiFetchParsed from @/lib/api so responses are Zod-validated.',
        },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/lib/api.ts', 'src/mocks/**'],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message:
            'Raw fetch belongs in @vgururaj/http. App code must use apiFetchParsed via features/*/api.',
        },
      ],
    },
  },
];
