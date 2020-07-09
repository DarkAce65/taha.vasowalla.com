const fs = require('fs');
const path = require('path');
const { Duplex } = require('stream');

const chalk = require('chalk');
const log = require('fancy-log');
const sassGraph = require('sass-graph');
const Vinyl = require('vinyl');

const endStream = function () {
  this.emit('end');
};

// Flattens an object into filesystem paths collecting values for duplicate paths as arrays
const flattenPaths = (object, root = '') => {
  const base = root.length === 0 ? '/' : `${root}/`;

  return Object.entries(object).reduce((obj, [key, value]) => {
    key = path.posix.normalize(key);
    if (key.indexOf('..') !== -1) {
      throw new Error(
        `Key "${key}" under "${path.posix.normalize(
          base
        )}" is attempting to access a parent directory`
      );
    }

    const currentPath = path.posix.join(base, key, path.posix.sep); // Ensure trailing separator to bundle paths

    if (!Array.isArray(value) && typeof value === 'object') {
      const subObject = flattenPaths(value, currentPath);
      for (const subObjectPath in subObject) {
        if (
          Object.prototype.hasOwnProperty.call(subObject, subObjectPath) &&
          Object.prototype.hasOwnProperty.call(obj, subObjectPath)
        ) {
          obj[subObjectPath] = obj[subObjectPath].push(...subObject[subObjectPath]);
          delete subObject[subObjectPath];
        }
      }

      return { ...obj, ...subObject };
    }

    if (!Object.prototype.hasOwnProperty.call(obj, currentPath)) {
      obj[currentPath] = [];
    }

    if (Array.isArray(value)) {
      obj[currentPath].push(...value);
    } else {
      obj[currentPath].push(value);
    }

    return obj;
  }, {});
};

const addSassDependents = ({ skipDependents } = {}) => {
  const delay = 200;
  let graph = null;
  let cache = {};

  return new Duplex({
    objectMode: true,
    read() {},
    write(file, _, done) {
      // Skip dependency traversal for first run
      if (skipDependents) {
        // Skip partials
        if (!/^_/.test(file.basename)) {
          this.push(file);
        }

        done();
        return;
      }

      if (!graph) {
        graph = sassGraph.parseDir('src');
      }

      const { cwd, base } = file;

      const workingPaths = [file.path];
      const processedPaths = new Set();
      while (workingPaths.length > 0) {
        const currentPath = workingPaths.shift();
        if (processedPaths.has(currentPath)) {
          continue;
        }

        const imports = graph.index[currentPath].importedBy;
        if (currentPath === file.path && imports.length > 0) {
          log(`Compiling dependents of ${chalk.magenta(path.relative(cwd, file.path))}`);
        }

        if (!/^_/.test(path.basename(currentPath))) {
          const cacheKey = currentPath;
          if (Object.prototype.hasOwnProperty.call(cache, cacheKey)) {
            clearTimeout(cache[cacheKey].timeout);
          } else {
            cache[cacheKey] = {};
          }

          const stat = fs.statSync(currentPath);
          const contents = fs.readFileSync(currentPath);
          const currentFile = new Vinyl({ cwd, base, path: currentPath, stat, contents });

          cache[cacheKey].file = currentFile;
          cache[cacheKey].timeout = setTimeout(() => {
            this.push(cache[cacheKey].file);
            delete cache[cacheKey];
          }, delay);
        }

        workingPaths.push(...imports.filter((p) => !processedPaths.has(p)));
        processedPaths.add(currentPath);
      }

      done();
    },
    final(done) {
      Object.values(cache).forEach(({ file, timeout }) => {
        clearTimeout(timeout);
        this.push(file);
      });
      this.push(null);

      graph = null;
      cache = {};

      done();
    },
  });
};

module.exports = { endStream, flattenPaths, addSassDependents };
