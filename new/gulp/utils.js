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

module.exports = {
  endStream,
  flattenObject,
};
