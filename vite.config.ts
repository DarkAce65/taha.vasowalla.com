import { resolve } from 'path';

import { SafeString, escapeExpression } from 'handlebars';
import { Plugin, defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import handlebarsPlugin from 'vite-plugin-handlebars';

const srcDir = resolve(__dirname, 'src');

export default defineConfig(({ mode }) => ({
  root: srcDir,
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        '403': resolve(srcDir, '403.html'),
        '404': resolve(srcDir, '404.html'),
        index: resolve(srcDir, 'index.html'),
        webaudio2d: resolve(srcDir, 'visual/webaudio2d/index.html'),
        about: resolve(srcDir, 'about/index.html'),
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
      partialDirectory: resolve(srcDir, 'partials'),
      helpers: {
        toObject: ({ hash }: { hash: Record<string, unknown> }): Record<string, unknown> => hash,
        toAttributes: (attributes?: Record<string, unknown>): SafeString | string =>
          attributes
            ? new SafeString(
                Object.entries(attributes)
                  .map(
                    ([attribute, value]) =>
                      `${escapeExpression(attribute)}="${escapeExpression(`${value}`)}"`
                  )
                  .join(' ')
              )
            : '',
        split: (str: string): string[] => str.split(','),
        googleFontLink: ({ hash }: { hash: Record<string, unknown> }): string => {
          const fonts = 'fonts' in hash && typeof hash.fonts === 'string' ? hash.fonts : 'Share';
          const fontParams = fonts
            .split(',')
            .map((font) => `family=${font.replace(' ', '+')}`)
            .join('&');
          return `https://fonts.googleapis.com/css2?${fontParams}&display=swap`;
        },
      },
    }) as Plugin,
    checker({
      overlay: { initialIsOpen: false },
      terminal: mode !== 'test',
      typescript: true,
      eslint: { lintCommand: "eslint './**/*.{ts,tsx}'" },
    }),
  ],
}));
