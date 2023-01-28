import fs from 'fs';
import path from 'path';

import colors from 'picocolors';
import { Options, compileClientWithDependenciesTracked, render } from 'pug';
import { Plugin, normalizePath } from 'vite';

const normalizeHTMLPath = (pathname: string): string =>
  pathname.endsWith('.html')
    ? pathname
    : pathname.endsWith('/')
    ? `${pathname}index.html`
    : `${pathname}/index.html`;

const virtualMPAPlugin = (cwd: string, srcDir: string, pages: Record<string, string>): Plugin => {
  const rollupInputs: Record<string, string> = {};
  const htmlToPugPaths: Record<string, string> = {};

  for (const [name, page] of Object.entries(pages)) {
    const indexHTMLPath = path.join(srcDir, normalizeHTMLPath(page));
    const indexPugPath = indexHTMLPath.replace(/\.html$/, '.pug');

    rollupInputs[name] = indexHTMLPath;

    if (!fs.existsSync(indexHTMLPath) && fs.existsSync(indexPugPath)) {
      htmlToPugPaths[indexHTMLPath] = indexPugPath;
    }
  }

  const indexDependencies: Record<string, Set<string>> = {};

  return {
    name: 'virtual-mpa-plugin',
    config() {
      return {
        appType: 'mpa',
        build: { rollupOptions: { input: rollupInputs } },
      };
    },
    resolveId(id, _, options) {
      if (options.isEntry && id in htmlToPugPaths) {
        return id;
      }
    },
    load(id) {
      if (id in htmlToPugPaths) {
        const pugFileContents = fs.readFileSync(htmlToPugPaths[id], { encoding: 'utf8' });
        const pugOptions: Options = { filename: path.relative(cwd, htmlToPugPaths[id]) };

        try {
          const template = compileClientWithDependenciesTracked(pugFileContents, pugOptions);

          indexDependencies[htmlToPugPaths[id]] = new Set();
          this.addWatchFile(htmlToPugPaths[id]);

          for (const dep of template.dependencies) {
            const depPath = path.join(cwd, dep);
            indexDependencies[htmlToPugPaths[id]].add(depPath);
            this.addWatchFile(depPath);
          }

          return render(pugFileContents, pugOptions);
        } catch (error) {
          return `<!DOCTYPE html><html><pre>${error.message}</pre></html>`;
        }
      }
    },
    handleHotUpdate({ file, modules, server }) {
      if (
        modules.length === 0 &&
        Object.entries(indexDependencies).some(
          ([indexFile, depFile]) => indexFile === file || depFile.has(file)
        )
      ) {
        server.config.logger.info(
          `${colors.green('page reload ')}${colors.dim(path.relative(srcDir, file))}`,
          { clear: true, timestamp: true }
        );
        server.ws.send({
          type: 'full-reload',
          path: server.config.server.middlewareMode
            ? '*'
            : `/${normalizePath(path.relative(srcDir, file))}`,
        });
      }
    },
    configureServer(server) {
      const base = normalizePath(`/${server.config.base || '/'}/`);
      server.middlewares.use(async (req, res, next) => {
        const accept = req.headers.accept;

        if (!res.writableEnded && accept !== '*/*' && accept?.includes('text/html')) {
          const url = new URL(req.url!, `http://${req.headers.host}`);
          const htmlFilePath = path.join(
            srcDir,
            normalizePath(normalizeHTMLPath(url.pathname).replace(base, ''))
          );

          if (htmlFilePath in htmlToPugPaths) {
            const loadedHTML = await server.pluginContainer.load(htmlFilePath);
            if (loadedHTML && typeof loadedHTML === 'string') {
              res.setHeader('Content-Type', 'text/html');
              res.statusCode = 200;
              res.end(await server.transformIndexHtml(req.url!, loadedHTML, req.originalUrl));
              return;
            }
          }
        }

        next();
      });
    },
  };
};

export default virtualMPAPlugin;
