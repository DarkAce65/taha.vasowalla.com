import fs from 'fs';
import path from 'path';

import colors from 'picocolors';
import { compileClientWithDependenciesTracked, render } from 'pug';
import { Plugin, normalizePath } from 'vite';

const virtualMPAPlugin = (cwd: string, srcDir: string, pages: Record<string, string>): Plugin => {
  const rollupInputs: Record<string, string> = {};
  const htmlToPugPaths: Record<string, string> = {};

  for (const [name, dir] of Object.entries(pages)) {
    const indexHTMLPath = path.join(srcDir, dir, 'index.html');
    const indexPugPath = path.join(srcDir, dir, 'index.pug');

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
    resolveId(id, _, options) {
      if (options.isEntry && id in htmlToPugPaths) {
        return id;
      }
    },
    load(id) {
      if (id in htmlToPugPaths) {
        const pugFileContents = fs.readFileSync(htmlToPugPaths[id], { encoding: 'utf8' });
        const pugOptions = { filename: path.relative(cwd, htmlToPugPaths[id]) };

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
    configureServer(server) {
      const base = normalizePath(`/${server.config.base || '/'}/`);
      server.middlewares.use(async (req, res, next) => {
        const accept = req.headers.accept;

        if (!res.writableEnded && accept !== '*/*' && accept?.includes('text/html')) {
          const url = new URL(req.url!, `http://${req.headers.host}`);
          const normalizedIndexHTMLPath = url.pathname.endsWith('.html')
            ? url.pathname
            : url.pathname.endsWith('/')
            ? `${url.pathname}index.html`
            : `${url.pathname}/index.html`;
          const htmlFilePath = path.join(
            srcDir,
            normalizePath(normalizedIndexHTMLPath.replace(base, ''))
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
