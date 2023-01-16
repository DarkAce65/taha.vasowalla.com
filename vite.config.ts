import path from 'path';

import { Plugin, defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import handlebarsPlugin from 'vite-plugin-handlebars';

import { helpers } from './utils/hbs-helpers';

const srcDir = path.resolve(__dirname, 'src');

const pages = {
  index: { dir: '.', entry: './script.ts' },
  about: { dir: 'about', entry: './script.ts' },
  // animation: { dir: 'random/animation', entry: './script.js' },
  // cards: { dir: 'visual/cards', entry: './script.ts' },
  // chemistry: { dir: 'projects/chemistry', entry: './script.js' },
  // driving: { dir: 'projects/driving', entry: './script.ts' },
  // fireball: { dir: 'random/fireball', entry: './script.js' },
  // hangman: { dir: 'games/hangman', entry: './script.ts' },
  // minesweeper: { dir: 'games/minesweeper', entry: './script.ts' },
  // shaders: { dir: 'random/shaders', entry: './script.js' },
  // testing: { dir: 'random/testing', entry: './script.ts' },
  // ultimatettt: { dir: 'games/ultimatettt', entry: './script.js' },
  webaudio2d: { dir: 'visual/webaudio2d', entry: './script.ts' },
  // webaudio3d: { dir: 'visual/webaudio3d', entry: './script.ts' },
  // wordsearch: { dir: 'projects/wordsearch', entry: './script.ts' },
};

const entrypoints = Object.entries(pages).reduce(
  (acc, [entryName, { dir, entry }]) => ({
    ...acc,
    [entryName]: path.join(srcDir, dir, entry),
    [dir]: path.join(srcDir, dir, 'index.html'),
  }),
  {}
);

export default defineConfig(({ mode }) => ({
  appType: 'mpa',
  root: srcDir,
  publicDir: path.resolve(__dirname, 'public'),
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: { input: entrypoints },
    sourcemap: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      define: { global: 'globalThis' },
    },
  },
  resolve: { alias: { '~': srcDir } },
  plugins: [
    handlebarsPlugin({
      partialDirectory: path.resolve(srcDir, 'partials'),
      helpers,
    }) as Plugin,
    checker({
      overlay: { initialIsOpen: false },
      terminal: mode !== 'test',
      typescript: true,
      eslint: { lintCommand: "eslint './**/*.{ts,tsx}'" },
    }),
  ],
}));
