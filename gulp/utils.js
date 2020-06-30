const fs = require('fs');
const path = require('path');
const { Duplex } = require('stream');

const sassGraph = require('sass-graph');
const through2 = require('through2');
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

const debounceStream = ({ delay = 100, cacheKeyFn = (file) => file.path } = {}) => {
  const cache = {};

  return new Duplex({
    objectMode: true,
    read() {},
    write(file, _, done) {
      const cacheKey = cacheKeyFn(file);
      if (Object.prototype.hasOwnProperty.call(cache, cacheKey)) {
        clearTimeout(cache[cacheKey].timeout);
      } else {
        cache[cacheKey] = {};
      }

      cache[cacheKey].file = file;
      cache[cacheKey].timeout = setTimeout(() => {
        this.push(file);
        delete cache[cacheKey];
      }, delay);

      done();
    },
    final(done) {
      Object.values(cache).forEach(({ timeout, file }) => {
        clearTimeout(timeout);
        this.push(file);
      });
      this.push(null);

      done();
    },
  });
};

const handleSassImports = ({ firstRun } = {}) =>
  through2.obj(function (file, _, callback) {
    // Skip dependency traversal for first run
    if (firstRun) {
      if (/^_/.test(file.basename)) {
        callback(); // Skip partials
      } else {
        callback(null, file);
      }
      return;
    }

    const { cwd, base } = file;
    const graph = sassGraph.parseDir('src');

    const workingPaths = [file.path];
    const processedPaths = new Set();
    const paths = [];
    while (workingPaths.length > 0) {
      const activePath = workingPaths.shift();
      if (processedPaths.has(activePath)) {
        continue;
      }

      const imports = graph.index[activePath].importedBy;

      if (!/^_/.test(path.basename(activePath))) {
        paths.push(activePath);
      }

      workingPaths.push(...imports.filter((p) => !processedPaths.has(p)));
      processedPaths.add(activePath);
    }

    paths.forEach((p) => {
      const stat = fs.statSync(p);
      const contents = fs.readFileSync(p);

      this.push(new Vinyl({ cwd, base, path: p, stat, contents }));
    });

    callback();
  });

module.exports = { endStream, flattenPaths, debounceStream, handleSassImports };
