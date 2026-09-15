import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  { ignores: ['dist/**', '.astro/**', '.wrangler/**', 'node_modules/**', 'tools/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    // Pages Functions run on the Workers runtime, where these are globals.
    files: ['functions/**/*.ts', 'tests/worker/**/*.ts'],
    languageOptions: {
      globals: { Response: 'readonly', Request: 'readonly', Headers: 'readonly', crypto: 'readonly', fetch: 'readonly', atob: 'readonly', btoa: 'readonly', TextEncoder: 'readonly', URL: 'readonly', Date: 'readonly', console: 'readonly' },
    },
    rules: { 'no-undef': 'off' },
  },
  {
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        window: 'readonly', document: 'readonly', sessionStorage: 'readonly', URL: 'readonly',
        Image: 'readonly', HTMLImageElement: 'readonly', HTMLInputElement: 'readonly',
        HTMLButtonElement: 'readonly', HTMLDivElement: 'readonly', HTMLHeadingElement: 'readonly',
        ImageData: 'readonly', Uint8ClampedArray: 'readonly', File: 'readonly', fetch: 'readonly',
        crypto: 'readonly', atob: 'readonly', btoa: 'readonly', Response: 'readonly',
        Request: 'readonly', Headers: 'readonly', TextEncoder: 'readonly', queueMicrotask: 'readonly',
      },
    },
    rules: { 'no-undef': 'off' },
  },
);
