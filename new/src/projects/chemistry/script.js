import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';

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
  molarMassInput.querySelector('input').addEventListener('input', ev => {
    console.log('change', ev.target.value);
    const row = document.createElement('tr');
    for (let i = 0; i < 4; i++) {
      const cell = document.createElement('td');
      cell.textContent = `test${i}`;
      row.appendChild(cell);
    }
    document.querySelector('#molarMassTable tbody').appendChild(row);
    const error = getFormulaErrors(ev.target.value);
    if (error) {
      document.querySelector('#molarMassInputError').innerHTML = error;
      molarMassError.show();
    } else {
      molarMassError.hide();
    }
  });

  molarMassInput.querySelector('a').addEventListener('click', () => {
    molarMassInput.querySelector('input').value = '';
    document.querySelector('#molarMassTable tbody').innerHTML = '';
    molarMassError.hide();
  });
});
