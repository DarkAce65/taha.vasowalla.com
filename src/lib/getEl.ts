type Selector = string | Document | Element;

const isNode = (obj: unknown): obj is Node =>
  obj !== null && typeof obj === 'object' && obj instanceof Node && obj.nodeType >= 1;

const getEl = (selector: Selector, parent?: Selector): Document | Element =>
  typeof selector === 'string'
    ? getEl(parent ?? document).querySelector(selector)
    : isNode(selector)
    ? selector
    : null;

export const getElOrThrow = (selector: Selector, parent?: Selector): Document | Element => {
  let el: string | Document | Element;
  if (parent && typeof selector === 'string') {
    const parentEl = getElOrThrow(parent);
    el = getEl(selector, parentEl);
  } else {
    el = getEl(selector);
  }

  if (el === null) {
    if (parent) {
      throw new Error(
        `Selector "${selector}" matched no element for parent${
          typeof parent === 'string' ? ` "${parent}"` : ''
        }`
      );
    } else {
      throw new Error(`Selector "${selector}" matched no element`);
    }
  }

  return el;
};

export default getEl;
