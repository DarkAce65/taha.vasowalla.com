export type Selector<E extends HTMLElement = HTMLElement> = string | E;

const isNode = (obj: unknown): obj is Node =>
  obj !== null && typeof obj === 'object' && obj instanceof Node && obj.nodeType >= 1;

function getEl<E extends HTMLElement = HTMLElement>(
  selector: Selector<E>,
  parent?: Selector
): E | null {
  if (typeof selector === 'string') {
    const parentEl = parent ? getElOrThrow(parent) : document;
    return parentEl?.querySelector<E>(selector) ?? null;
  }

  return isNode(selector) ? selector : null;
}

function getElOrThrow<E extends HTMLElement = HTMLElement>(
  selector: Selector<E>,
  parent?: Selector
): E {
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
}

export { getElOrThrow };
export default getEl;
