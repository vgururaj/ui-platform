import viteApp from '@vgururaj/eslint-config/vite-app';

/** @type {import('eslint').Linter.Config[]} */
export default [{ ignores: ['dist', 'coverage'] }, ...viteApp];
