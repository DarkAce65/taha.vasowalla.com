const isString = value => typeof value === 'string';

const isNode = obj => obj !== null && typeof obj === 'object' && obj.nodeType >= 1;

const getEl = selector =>
  isString(selector) ? document.querySelector(selector) : isNode(selector) ? selector : null;

export const getElOrThrow = selector => {
  const el = getEl(selector);
  if (!el) {
    throw new Error(`Selector matched no element: ${selector}`);
  }

  return el;
};

export default getEl;
