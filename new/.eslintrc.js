const prettierConfig = require('./prettier.config');

module.exports = {
  parser: 'babel-eslint',
  plugins: ['prettier'],
  extends: ['eslint:recommended', 'prettier', 'plugin:prettier/recommended'],
  env: { browser: true, node: true, es6: true },
  parserOptions: { ecmaVersion: 6 },
  rules: {
    'prettier/prettier': ['warn', prettierConfig],
    eqeqeq: 'warn',
    'no-console': 'off',
    'no-duplicate-imports': 'warn',
    'no-shadow': 'error',
    'no-unused-vars': 'warn',
    'no-var': 'error',
    'object-shorthand': 'warn',
    'one-var': ['warn', 'never'],
    'prefer-const': 'warn',
    'prefer-template': 'warn',
  },
};
