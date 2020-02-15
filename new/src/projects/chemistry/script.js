import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';
import katex from 'katex';

document.addEventListener('DOMContentLoaded', () => {
  UIkit.use(Icons);

  document.querySelectorAll('[data-katex-expr]').forEach(element => {
    katex.render(element.dataset.katexExpr, element);
  });
});
