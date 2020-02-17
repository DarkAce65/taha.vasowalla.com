import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';
import katex from 'katex';

import renderLaTeX from '../../lib/renderLaTeX';
import wrapToggle from '../../lib/wrapToggle';
import { formulaToLatex, getFormulaErrors } from './molarMass';

document.addEventListener('DOMContentLoaded', () => {
  UIkit.use(Icons);
  renderLaTeX();

  const molarMassFormulaAndError = wrapToggle(
    UIkit.toggle('#molarMassFormulaContainer', {
      target: '#molarMassFormulaContainer > *',
      animation: 'uk-animation-slide-top-small',
      mode: null,
      queued: true,
    })
  );

  const molarMassInput = document.querySelector('#molarMassInput');
  molarMassInput.querySelector('input').addEventListener('input', function() {
    const formula = this.value.replace(/\s+/g, '');
    const error = getFormulaErrors(formula);
    if (error) {
      document.querySelector('#molarMassInputError').innerHTML = error;
      this.classList.add('uk-form-danger');
      molarMassFormulaAndError.hide();
      return;
    }

    this.classList.remove('uk-form-danger');
    molarMassFormulaAndError.show();

    katex.render(formulaToLatex(formula), document.querySelector('#molarMassFormula'));
  });

  molarMassInput.querySelector('a').addEventListener('click', () => {
    molarMassInput.querySelector('input').value = '';
    document.querySelector('#molarMassTable tbody').innerHTML = '';
    molarMassFormulaAndError.show();
  });
});
