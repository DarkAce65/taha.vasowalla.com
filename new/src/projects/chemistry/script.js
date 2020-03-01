import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';
import katex from 'katex';

import renderLaTeX from '../../lib/renderLaTeX';
import makeToggleWrapper from '../../lib/makeToggleWrapper';
import debounce from '../../lib/debounce';
import { formulaToLatex, parseFormula } from './molarMass';
import getComputeTarget from './getComputeTarget';
import { compute as computeDilution } from './dilution';
import { compute as computeIdealGasLaw } from './idealGasLaw';
import { compute as computeSpecificHeat } from './specificHeat';

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
      const computed = computeDilution(
        { m1, v1, m2, v2 },
        {
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

const initIdealGasLaw = () => {
  const p = document.querySelector('#idealGasLawP');
  const v = document.querySelector('#idealGasLawV');
  const n = document.querySelector('#idealGasLawN');
  const t = document.querySelector('#idealGasLawT');
  const pUnits = document.querySelector('#idealGasLawPUnits');
  const vUnits = document.querySelector('#idealGasLawVUnits');
  const nUnits = document.querySelector('#idealGasLawNUnits');
  const tUnits = document.querySelector('#idealGasLawTUnits');
  const inputs = [p, v, n, t];

  let computeTarget = t;
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

  document.querySelector('#idealGasLawCalculate').addEventListener('click', () => {
    recomputeTarget.now();

    try {
      const computed = computeIdealGasLaw(
        { p, v, n, t },
        { pUnits: pUnits.value, vUnits: vUnits.value, nUnits: nUnits.value, tUnits: tUnits.value },
        computeTarget
      );
      computeTarget.value = computed;
    } catch (ex) {
      UIkit.notification(ex.message, { status: 'danger' });
    }
  });
};

const initSpecificHeat = () => {
  const q = document.querySelector('#specificHeatQ');
  const m = document.querySelector('#specificHeatM');
  const cp = document.querySelector('#specificHeatCp');
  const t = document.querySelector('#specificHeatT');
  const qUnits = document.querySelector('#specificHeatQUnits');
  const mUnits = document.querySelector('#specificHeatMUnits');
  const cpUnits = document.querySelector('#specificHeatCpUnits');
  const tUnits = document.querySelector('#specificHeatTUnits');
  const inputs = [q, m, cp, t];

  let computeTarget = t;
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

  document.querySelector('#specificHeatCalculate').addEventListener('click', () => {
    recomputeTarget.now();

    try {
      const computed = computeSpecificHeat(
        { q, m, cp, t },
        {
          qUnits: qUnits.value,
          mUnits: mUnits.value,
          cpUnits: cpUnits.value,
          tUnits: tUnits.value,
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
  initIdealGasLaw();
  initSpecificHeat();
});
