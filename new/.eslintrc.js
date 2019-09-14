const prettierConfig = require('./prettier.config');

module.exports = {
  parser: 'babel-eslint',
  plugins: ['prettier'],
  extends: ['eslint:recommended', 'prettier', 'plugin:prettier/recommended'],
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 6,
  },
  rules: {
    'prettier/prettier': ['warn', prettierConfig],
    eqeqeq: 'warn',
    'no-console': 'off',
    'no-shadow': 'warn',
    'no-unused-vars': 'warn',
    'no-var': 'warn',
    'prefer-const': 'warn',
    'prefer-template': 'warn',
  },
};
