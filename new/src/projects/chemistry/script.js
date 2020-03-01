import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';
import katex from 'katex';

import renderLaTeX from '../../lib/renderLaTeX';
import makeToggleWrapper from '../../lib/makeToggleWrapper';
import debounce from '../../lib/debounce';
import { formulaToLatex, parseFormula } from './molarMass';
import { compute, getComputeTarget } from './dilution';

const initMolarMass = () => {
  const formulaAndError = makeToggleWrapper('#molarMassFormulaContainer', {
    target: '#molarMassFormulaContainer > *',
    animation: 'uk-animation-fade',
    mode: null,
    queued: true,
  });
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

const initDilution = () => {
  const m1 = document.querySelector('#dilutionM1');
  const v1 = document.querySelector('#dilutionV1');
  const m2 = document.querySelector('#dilutionM2');
  const v2 = document.querySelector('#dilutionV2');
  const m1Units = document.querySelector('#dilutionM1Units');
  const v1Units = document.querySelector('#dilutionV1Units');
  const m2Units = document.querySelector('#dilutionM2Units');
  const v2Units = document.querySelector('#dilutionV2Units');
  const inputs = [m1, v1, m2, v2];

  let computeTarget = v2;
  const recomputeTarget = debounce(() => {
    const newComputeTarget = getComputeTarget(inputs);
    if (newComputeTarget !== null) {
      computeTarget.parentElement.classList.remove('uk-form-highlight');
      newComputeTarget.parentElement.classList.add('uk-form-highlight');
      computeTarget = newComputeTarget;
    }
  });

  inputs.forEach(input => {
    input.addEventListener('input', () => {
      recomputeTarget();
    });

    input.addEventListener('blur', () => {
      if (input.checkValidity && !input.checkValidity()) {
        input.reportValidity();
      } else {
        input.value = input.value; // eslint-disable-line no-self-assign
      }
    });
  });

  document.querySelector('#dilutionCalculate').addEventListener('click', () => {
    recomputeTarget.now();

    try {
      const computed = compute(
        {
          m1,
          v1,
          m2,
          v2,
          m1Units: m1Units.value,
          v1Units: v1Units.value,
          m2Units: m2Units.value,
          v2Units: v2Units.value,
        },
        computeTarget
      );
      computeTarget.value = computed;
    } catch (ex) {
      UIkit.notification(ex.message, { status: 'danger' });
    }
  });
};

document.addEventListener('DOMContentLoaded', () => {
  UIkit.use(Icons);
  renderLaTeX();

  initMolarMass();
  initDilution();
});
