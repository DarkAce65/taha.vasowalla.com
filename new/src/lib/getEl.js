const isString = value => typeof value === 'string';

const isNode = obj => obj !== null && typeof obj === 'object' && obj.nodeType >= 1;

const getEl = (selector, parent = document) =>
  isString(selector) ? getEl(parent).querySelector(selector) : isNode(selector) ? selector : null;

export const getElOrThrow = (selector, parent) => {
  let parentEl;
  if (parent) {
    parentEl = getElOrThrow(parent);
  }

  const el = getEl(selector, parentEl);
  if (!el) {
    throw new Error(`Selector "${selector}" matched no element`);
  }

  return el;
};

export default getEl;
window.getEl = getEl;
window.getElOrThrow = getElOrThrow;
