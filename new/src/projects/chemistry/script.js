import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';

import debounce from '../../lib/debounce';
import renderLaTeX from '../../lib/renderLaTeX';
import wrapToggle from '../../lib/wrapToggle';
import { getFormulaErrors } from './molarMass';

document.addEventListener('DOMContentLoaded', () => {
  UIkit.use(Icons);
  renderLaTeX();

  const molarMassError = wrapToggle(
    UIkit.toggle('#molarMassInputError', {
      animation: 'uk-animation-slide-top-small',
      mode: null,
    })
  );

  const molarMassInput = document.querySelector('#molarMassInput');
  molarMassInput.querySelector('input').addEventListener(
    'input',
    debounce(function() {
      const formula = this.value;
      const error = getFormulaErrors(formula);
      if (error) {
        document.querySelector('#molarMassInputError').innerHTML = error;
        this.classList.add('uk-form-danger');
        molarMassError.show();
        return;
      }

      this.classList.remove('uk-form-danger');
      molarMassError.hide();

      const row = document.createElement('tr');
      for (let i = 0; i < 4; i++) {
        const cell = document.createElement('td');
        cell.textContent = `test${i}`;
        row.appendChild(cell);
      }
      document.querySelector('#molarMassTable tbody').appendChild(row);
    })
  );

  molarMassInput.querySelector('a').addEventListener('click', () => {
    molarMassInput.querySelector('input').value = '';
    document.querySelector('#molarMassTable tbody').innerHTML = '';
    molarMassError.hide();
  });
});
