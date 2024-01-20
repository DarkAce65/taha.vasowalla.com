import katex from 'katex';

export default (): void =>
  document
    .querySelectorAll<HTMLElement>('[data-katex-expr]')
    .forEach(
      (element) => element.dataset.katexExpr && katex.render(element.dataset.katexExpr, element),
    );
