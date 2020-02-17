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
  const molarMassInput = document.querySelector('#molarMassInput input');

  const resetMolarMass = () => {
    molarMassInput.value = '';
    molarMassInput.classList.remove('uk-form-danger');
    document.querySelector('#molarMassFormula').innerHTML = '';
    document.querySelector('#molarMassTable tbody').innerHTML = '';
    molarMassFormulaAndError.show();
  };

  molarMassInput.addEventListener('input', function() {
    const formula = this.value.replace(/\s+/g, '');
    if (formula.length === 0) {
      resetMolarMass();
      return;
    }

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

  document.querySelector('#molarMassInput a').addEventListener('click', resetMolarMass);
});
