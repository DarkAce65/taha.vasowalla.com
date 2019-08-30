const fs = require('fs');
const path = require('path');
const Vinyl = require('vinyl');

const through2 = require('through2');
const sassGraph = require('sass-graph');

const handleSassImports = ({ firstRun } = {}) =>
  through2.obj(function(file, _, callback) {
    // Skip dependency traversal for first run
    if (firstRun) {
      if (/^_.*$/.test(file.basename)) {
        callback(); // Skip partials
      } else {
        callback(null, file);
      }
      return;
    }

    const { cwd, base } = file;
    const graph = sassGraph.parseDir('src');

    const workingPaths = [file.path];
    const paths = [];
    while (workingPaths.length > 0) {
      const activePath = workingPaths.shift();
      if (paths.indexOf(activePath) !== -1) {
        continue;
      }

      const imports = graph.index[activePath].importedBy;
      paths.push(activePath);
      workingPaths.push(
        ...imports.filter(p => paths.indexOf(p) === -1 && workingPaths.indexOf(p) === -1)
      );
    }

    paths
      .filter(p => !/^_.*$/.test(path.basename(p)))
      .forEach(p => {
        const stat = fs.statSync(p);
        const contents = fs.readFileSync(p);

        this.push(new Vinyl({ cwd, base, path: p, stat, contents }));
      });

    callback();
  });

const endStream = function() {
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

module.exports = { handleSassImports, endStream, flattenObject };
