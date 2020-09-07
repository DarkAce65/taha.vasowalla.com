export type Selector<E extends HTMLElement = HTMLElement> = string | E;

const isNode = (obj: unknown): obj is Node =>
  obj !== null && typeof obj === 'object' && obj instanceof Node && obj.nodeType >= 1;

const getEl = <E extends HTMLElement = HTMLElement>(
  selector: Selector<E>,
  parent?: Selector
): E | null => {
  if (typeof selector !== 'string' && parent) {
    console.warn(
      'Passing an element as a selector will not select from the supplied parent. Remove the parent from this call'
    );
  }

  const parentEl = parent ? getEl(parent) : document;
  return typeof selector === 'string'
    ? parentEl?.querySelector<E>(selector) ?? null
    : isNode(selector)
    ? selector
    : null;
};

export const getElOrThrow = <E extends HTMLElement = HTMLElement>(
  selector: Selector<E>,
  parent?: Selector
): E => {
  let el: E | null;
  if (parent) {
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
