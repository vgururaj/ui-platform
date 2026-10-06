import base from './base.js';

/** Rules for shared libraries under packages/* — must not depend on apps or templates. */
export default [
  ...base,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@vgururaj/demo',
              message: 'Shared packages must not import from apps.',
            },
            {
              name: '@vgururaj/vite-react-template',
              message: 'Shared packages must not import from templates.',
            },
          ],
          patterns: [
            {
              regex: '(^|[\\\\/])(apps|templates)([\\\\/]|$)',
              message: 'Shared packages must not import from apps/ or templates/.',
            },
          ],
        },
      ],
    },
  },
];
