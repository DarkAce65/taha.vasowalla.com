import path from 'path';

import { Plugin, defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import handlebarsPlugin from 'vite-plugin-handlebars';

import { helpers } from './utils/hbs-helpers';

const srcDir = path.resolve(__dirname, 'src');

export default defineConfig(({ mode }) => ({
  appType: 'mpa',
  root: srcDir,
  publicDir: path.resolve(__dirname, 'public'),
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: path.join(srcDir, 'index.html'),
        about: path.join(srcDir, 'about/index.html'),
        animation: path.join(srcDir, 'random/animation/index.html'),
        cards: path.join(srcDir, 'visual/cards/index.html'),
        chemistry: path.join(srcDir, 'projects/chemistry/index.html'),
        driving: path.join(srcDir, 'projects/driving/index.html'),
        fireball: path.join(srcDir, 'random/fireball/index.html'),
        hangman: path.join(srcDir, 'games/hangman/index.html'),
        minesweeper: path.join(srcDir, 'games/minesweeper/index.html'),
        shaders: path.join(srcDir, 'random/shaders/index.html'),
        testing: path.join(srcDir, 'random/testing/index.html'),
        ultimatettt: path.join(srcDir, 'games/ultimatettt/index.html'),
        webaudio2d: path.join(srcDir, 'visual/webaudio2d/index.html'),
        webaudio3d: path.join(srcDir, 'visual/webaudio3d/index.html'),
        wordsearch: path.join(srcDir, 'projects/wordsearch/index.html'),
      },
    },
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
