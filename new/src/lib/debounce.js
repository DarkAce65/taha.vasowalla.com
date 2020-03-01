export default (func, { delay = 500 } = {}) => {
  let timeout = null;

  const debouncedFunction = function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.call(this, ...args), delay);
  };
  debouncedFunction.now = function(...args) {
    clearTimeout(timeout);
    func.call(this, ...args);
  };

  return debouncedFunction;
};
