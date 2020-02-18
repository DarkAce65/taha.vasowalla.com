import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';
import katex from 'katex';

import renderLaTeX from '../../lib/renderLaTeX';
import wrapToggle from '../../lib/wrapToggle';
import { formulaToLatex, parseFormula } from './molarMass';

document.addEventListener('DOMContentLoaded', () => {
  UIkit.use(Icons);
  renderLaTeX();

  const molarMassFormulaAndError = wrapToggle(
    UIkit.toggle('#molarMassFormulaContainer', {
      target: '#molarMassFormulaContainer > *',
      animation: 'uk-animation-fade',
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
    document.querySelector('#molarMassTotalAtomCount').textContent = '0';
    document.querySelector('#molarMassTotalMass').textContent = '0';
    molarMassFormulaAndError.show();
  };

  molarMassInput.addEventListener('input', function() {
    const formula = this.value.replace(/\s+/g, '');
    if (formula.length === 0) {
      resetMolarMass();
      return;
    }

    let parsedFormula;
    try {
      parsedFormula = parseFormula(formula);
    } catch (error) {
      document.querySelector('#molarMassInputError').textContent = error.message;
      this.classList.add('uk-form-danger');
      molarMassFormulaAndError.hide();
      return;
    }

    this.classList.remove('uk-form-danger');
    molarMassFormulaAndError.show();
    katex.render(formulaToLatex(formula), document.querySelector('#molarMassFormula'));

    const { elements, totalAtoms, totalMass } = parsedFormula;

    document.querySelector('#molarMassTable tbody').innerHTML = '';
    for (let r = 0; r < elements.length; r++) {
      const element = elements[r];

      const row = document.createElement('tr');
      const elementCell = document.createElement('td');
      const atomsCell = document.createElement('td');
      const massCell = document.createElement('td');
      const massPercentCell = document.createElement('td');

      elementCell.innerHTML = `${element.name}<br><small>${element.mass.toFixed(4)}</small>`;
      atomsCell.textContent = element.count;
      massCell.textContent = (element.mass * element.count).toFixed(4);
      massPercentCell.textContent = `${element.massPercent.toFixed(4)}%`;

      row.appendChild(elementCell);
      row.appendChild(atomsCell);
      row.appendChild(massCell);
      row.appendChild(massPercentCell);
      document.querySelector('#molarMassTable tbody').appendChild(row);
    }

    document.querySelector('#molarMassTotalAtomCount').textContent = totalAtoms;
    document.querySelector('#molarMassTotalMass').textContent = totalMass.toFixed(4);
  });

  document.querySelector('#molarMassInput a').addEventListener('click', resetMolarMass);
});
