const prettierConfig = require('./prettier.config');

module.exports = {
  parser: '@babel/eslint-parser',
  plugins: ['prettier', 'import'],
  extends: ['eslint:recommended', 'prettier', 'plugin:prettier/recommended'],
  env: { browser: true, node: true, es6: true },
  parserOptions: { ecmaVersion: 6 },
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
    'spaced-comment': 'warn',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint', 'prettier', 'import'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'plugin:prettier/recommended',
      ],
      parserOptions: { ecmaVersion: 6, sourceType: 'module' },
      rules: {
        'prettier/prettier': ['warn', prettierConfig],
        '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      },
    },
  ],
};
