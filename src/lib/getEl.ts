export type Selector<E extends HTMLElement = HTMLElement> = string | E;

const isNode = (obj: unknown): obj is Node =>
  obj !== null && typeof obj === 'object' && obj instanceof Node && obj.nodeType >= 1;

function getEl<E extends HTMLElement = HTMLElement>(selector: string, parent: Selector): E | null;
function getEl<E extends HTMLElement = HTMLElement>(selector: Selector<E>): E | null;
function getEl<E extends HTMLElement = HTMLElement>(
  selector: Selector<E>,
  parent?: Selector
): E | null {
  if (typeof selector === 'string') {
    const parentEl = parent ? getElOrThrow(parent) : document;
    return parentEl?.querySelector<E>(selector) ?? null;
  }

  if (parent) {
    console.warn(
      'Passing an element as a selector will not select from the supplied parent. Remove the parent from this call'
    );
  }

  return isNode(selector) ? selector : null;
}

function getElOrThrow<E extends HTMLElement = HTMLElement>(selector: string, parent: Selector): E;
function getElOrThrow<E extends HTMLElement = HTMLElement>(selector: Selector<E>): E;
function getElOrThrow<E extends HTMLElement = HTMLElement>(
  selector: Selector<E>,
  parent?: Selector
): E {
  let el: E | null;
  if (parent) {
    const parentEl = getElOrThrow(parent);
    el = getEl(selector as string, parentEl);
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
