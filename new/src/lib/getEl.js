const isString = value => typeof value === 'string';

const isNode = obj => obj !== null && typeof obj === 'object' && obj.nodeType >= 1;

export default selector =>
  isString(selector) ? document.querySelector(selector) : isNode(selector) ? selector : null;
