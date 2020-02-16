export default (func, { delay = 500 } = {}) => {
  let timeout = null;

  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.call(this, ...args), delay);
  };
};
