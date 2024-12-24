import path from 'path';
import { fileURLToPath } from 'url';

import inject from '@rollup/plugin-inject';
import stdLibBrowser from 'node-stdlib-browser';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';

import virtualMPAPlugin from './utils/virtual-mpa-plugin';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const srcDir = path.join(rootDir, 'src');

const pages: Record<string, string> = {
  '403': '403.html',
  '404': '404.html',
  index: '.',
  about: 'about',
  hangman: 'games/hangman',
  minesweeper: 'games/minesweeper',
  ultimatettt: 'games/ultimatettt',
  chemistry: 'projects/chemistry',
  driving: 'projects/driving',
  wordsearch: 'projects/wordsearch',
  animation: 'random/animation',
  fireball: 'random/fireball',
  shaders: 'random/shaders',
  testing: 'random/testing',
  cards: 'visual/cards',
  webaudio2d: 'visual/webaudio2d',
  webaudio3d: 'visual/webaudio3d',
};

export default defineConfig(({ mode }) => ({
  root: srcDir,
  publicDir: fileURLToPath(new URL('public', import.meta.url)),
  build: {
    outDir: fileURLToPath(new URL('dist', import.meta.url)),
    emptyOutDir: true,
    sourcemap: true,
  },
  optimizeDeps: {
    include: ['buffer', 'process'],
  },
  css: {
    preprocessorOptions: {
      scss: { quietDeps: true },
    },
  },
  resolve: {
    alias: {
      ...stdLibBrowser,
      '~': srcDir,
    },
  },
  plugins: [
    virtualMPAPlugin(rootDir, srcDir, pages),
    checker({
      overlay: { initialIsOpen: false },
      terminal: mode !== 'test',
      typescript: true,
      eslint: { lintCommand: 'eslint "./**/*.{ts,tsx}"', useFlatConfig: true },
    }),
    {
      enforce: 'post',
      ...inject({
        global: [
          fileURLToPath(import.meta.resolve('node-stdlib-browser/helpers/esbuild/shim')),
          'global',
        ],
        process: [
          fileURLToPath(import.meta.resolve('node-stdlib-browser/helpers/esbuild/shim')),
          'process',
        ],
        Buffer: [
          fileURLToPath(import.meta.resolve('node-stdlib-browser/helpers/esbuild/shim')),
          'Buffer',
        ],
      }),
    },
  ],
}));
