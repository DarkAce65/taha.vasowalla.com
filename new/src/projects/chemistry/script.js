import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';
import katex from 'katex';

import renderLaTeX from '../../lib/renderLaTeX';
import wrapToggle from '../../lib/wrapToggle';
import { formulaToLatex, parseFormula } from './molarMass';

const initMolarMass = () => {
  const formulaAndError = wrapToggle(
    UIkit.toggle('#molarMassFormulaContainer', {
      target: '#molarMassFormulaContainer > *',
      animation: 'uk-animation-fade',
      mode: null,
      queued: true,
    })
  );
  const input = document.querySelector('#molarMassInput input');
  const formulaEl = document.querySelector('#molarMassFormula');
  const tableOutput = document.querySelector('#molarMassTable tbody');

  const reset = () => {
    input.value = '';
    input.classList.remove('uk-form-danger');
    formulaEl.innerHTML = '';
    tableOutput.innerHTML = '';
    document.querySelector('#molarMassTotalAtomCount').textContent = '0';
    document.querySelector('#molarMassTotalMass').textContent = '0';
    formulaAndError.show();
  };

  input.addEventListener('input', function() {
    const formula = this.value.replace(/\s+/g, '');
    if (formula.length === 0) {
      reset();
      return;
    }

    let parsedFormula;
    try {
      parsedFormula = parseFormula(formula);
    } catch (error) {
      document.querySelector('#molarMassInputError').textContent = error.message;
      this.classList.add('uk-form-danger');
      formulaAndError.hide();
      return;
    }

    this.classList.remove('uk-form-danger');
    formulaAndError.show();
    katex.render(formulaToLatex(formula), formulaEl, { displayMode: true });

    const { elements, totalAtoms, totalMass } = parsedFormula;

    tableOutput.innerHTML = '';
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
      tableOutput.appendChild(row);
    }

    document.querySelector('#molarMassTotalAtomCount').textContent = totalAtoms;
    document.querySelector('#molarMassTotalMass').textContent = totalMass.toFixed(4);
  });

  document.querySelector('#molarMassInput a').addEventListener('click', reset);
};

document.addEventListener('DOMContentLoaded', () => {
  UIkit.use(Icons);
  renderLaTeX();

  initMolarMass();
});
