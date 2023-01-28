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
  index: '.',
  about: 'about',
};
// {
//   index: path.join(srcDir, 'index.html'),
//   about: path.join(srcDir, 'about/index.html'),
//   animation: path.join(srcDir, 'random/animation/index.html'),
//   cards: path.join(srcDir, 'visual/cards/index.html'),
//   chemistry: path.join(srcDir, 'projects/chemistry/index.html'),
//   driving: path.join(srcDir, 'projects/driving/index.html'),
//   fireball: path.join(srcDir, 'random/fireball/index.html'),
//   hangman: path.join(srcDir, 'games/hangman/index.html'),
//   minesweeper: path.join(srcDir, 'games/minesweeper/index.html'),
//   shaders: path.join(srcDir, 'random/shaders/index.html'),
//   testing: path.join(srcDir, 'random/testing/index.html'),
//   ultimatettt: path.join(srcDir, 'games/ultimatettt/index.html'),
//   webaudio2d: path.join(srcDir, 'visual/webaudio2d/index.html'),
//   webaudio3d: path.join(srcDir, 'visual/webaudio3d/index.html'),
//   wordsearch: path.join(srcDir, 'projects/wordsearch/index.html'),
// }

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
      eslint: { lintCommand: "eslint './**/*.{ts,tsx}'" },
    }),
    {
      enforce: 'post',
      ...inject({
        global: [require.resolve('node-stdlib-browser/helpers/esbuild/shim'), 'global'],
        process: [require.resolve('node-stdlib-browser/helpers/esbuild/shim'), 'process'],
        Buffer: [require.resolve('node-stdlib-browser/helpers/esbuild/shim'), 'Buffer'],
      }),
    },
  ],
}));
