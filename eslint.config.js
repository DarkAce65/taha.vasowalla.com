import js from '@eslint/js';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';

import prettierConfig from './prettier.config.js';

export default [
  js.configs['recommended'],
  {
    plugins: {
      import: importPlugin,
      prettier: prettierPlugin,
    },
    languageOptions: { globals: { ...globals.browser } },
    rules: {
      'prettier/prettier': ['warn', prettierConfig],
      eqeqeq: 'warn',
      'guard-for-in': 'error',
      'import/first': 'warn',
      'import/newline-after-import': 'warn',
      'import/order': [
        'warn',
        {
          'newlines-between': 'always',
          groups: ['builtin', 'external', ['internal', 'parent'], 'sibling', 'index'],
          pathGroups: [
            { pattern: '{uikit,uikit/**}', group: 'external', position: 'before' },
            { pattern: '~/**', group: 'internal' },
          ],
          pathGroupsExcludedImportTypes: ['uikit'],
          alphabetize: { order: 'asc', caseInsensitive: false },
        },
      ],
      'no-console': 'off',
      'no-duplicate-imports': 'warn',
      'no-multiple-empty-lines': ['warn', { max: 1 }],
      'no-shadow': 'error',
      'no-unused-vars': 'warn',
      'no-use-before-define': ['error', 'nofunc'],
      'no-var': 'error',
      'object-shorthand': 'warn',
      'one-var': ['warn', 'never'],
      'prefer-const': 'warn',
      'prefer-template': 'warn',
      'sort-imports': ['warn', { ignoreDeclarationSort: true }],
      'spaced-comment': ['warn', 'always', { markers: ['/'] }],
    },
  },
  { files: ['**/*.{ts,tsx}'], rules: typescriptPlugin.configs['recommended'].rules },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { parser: typescriptParser },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
];
