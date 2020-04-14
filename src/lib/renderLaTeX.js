import katex from 'katex';

export default () => {
  document.querySelectorAll('[data-katex-expr]').forEach((element) => {
    katex.render(element.dataset.katexExpr, element);
  });
};
