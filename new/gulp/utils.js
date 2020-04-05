const fs = require('fs');
const path = require('path');
const { Duplex } = require('stream');

const sassGraph = require('sass-graph');
const through2 = require('through2');
const Vinyl = require('vinyl');

const endStream = function () {
  this.emit('end');
};

const flattenObject = (object, root = '') =>
  Object.entries(object).reduce((obj, [key, value]) => {
    const base = root === '' ? '' : `${root}/`;
    if (!Array.isArray(value) && typeof value === 'object') {
      return { ...obj, ...flattenObject(value, `${base}${key}`) };
    }

    obj[`${base}${key}`] = value;
    return obj;
  }, {});

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

module.exports = { endStream, flattenObject, debounceStream, handleSassImports };
