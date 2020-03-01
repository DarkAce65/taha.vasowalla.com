import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';
import katex from 'katex';

import renderLaTeX from '../../lib/renderLaTeX';
import makeToggleWrapper from '../../lib/makeToggleWrapper';
import debounce from '../../lib/debounce';
import { formulaToLatex, parseFormula } from './molarMass';
import getComputeTarget from './getComputeTarget';
import compute from './compute';
import computeDilution from './computeDilution';
import computeIdealGasLaw from './computeIdealGasLaw';
import computeSpecificHeat from './computeSpecificHeat';

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
  const units = [m1Units, v1Units, m2Units, v2Units];

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
      if (input.checkValidity && !input.checkValidity() && input.reportValidity) {
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
        inputs,
        units.map(unit => unit.value),
        inputs.indexOf(computeTarget),
        computeDilution
      );
      computeTarget.value = computed;
    } catch (ex) {
      UIkit.notification(ex.message, { status: 'danger' });
    }
  });

  document.querySelector('#dilutionClear').addEventListener('click', () => {
    inputs.forEach(input => {
      input.value = '';
    });
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
  const units = [pUnits, vUnits, nUnits, tUnits];

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
      if (input.checkValidity && !input.checkValidity() && input.reportValidity) {
        input.reportValidity();
      } else {
        input.value = input.value; // eslint-disable-line no-self-assign
      }
    });
  });

  document.querySelector('#idealGasLawCalculate').addEventListener('click', () => {
    recomputeTarget.now();

    try {
      const computed = compute(
        inputs,
        units.map(unit => unit.value),
        inputs.indexOf(computeTarget),
        computeIdealGasLaw
      );
      computeTarget.value = computed;
    } catch (ex) {
      UIkit.notification(ex.message, { status: 'danger' });
    }
  });

  document.querySelector('#idealGasLawClear').addEventListener('click', () => {
    inputs.forEach(input => {
      input.value = '';
    });
  });
};

const copyToArray = (src, dest) => {
  while (dest.length < src.length) {
    dest.push(0);
  }
  while (dest.length > src.length) {
    dest.pop();
  }

  for (let i = 0; i < src.length; i++) {
    if (dest[i] !== src[i]) {
      dest[i] = src[i];
    }
  }
};

const initSpecificHeat = () => {
  const q = document.querySelector('#specificHeatQ');
  const m = document.querySelector('#specificHeatM');
  const cp = document.querySelector('#specificHeatCp');
  const t = document.querySelector('#specificHeatT');
  const tf = document.querySelector('#specificHeatTf');
  const ti = document.querySelector('#specificHeatTi');
  const qUnits = document.querySelector('#specificHeatQUnits');
  const mUnits = document.querySelector('#specificHeatMUnits');
  const cpUnits = document.querySelector('#specificHeatCpUnits');
  const tUnits = document.querySelector('#specificHeatTUnits');
  const tfUnits = document.querySelector('#specificHeatTfUnits');
  const tiUnits = document.querySelector('#specificHeatTiUnits');
  const inputs = [q, m, cp, t];
  const units = [qUnits, mUnits, cpUnits, tUnits];

  let computeTarget = t;
  const recomputeTarget = debounce(() => {
    const newComputeTarget = getComputeTarget(inputs);
    if (newComputeTarget !== null) {
      computeTarget.parentElement.classList.remove('uk-form-highlight');
      newComputeTarget.parentElement.classList.add('uk-form-highlight');
      computeTarget = newComputeTarget;
    }
  });

  let tempInputMethod = 'deltaT';
  document.querySelector('#specificHeatDeltaTTab').addEventListener('shown', () => {
    t.value = '';
    copyToArray([q, m, cp, t], inputs);
    copyToArray([qUnits, mUnits, cpUnits, tUnits], units);
    tempInputMethod = 'deltaT';
    computeTarget.parentElement.classList.remove('uk-form-highlight');
    recomputeTarget.now();
  });
  document.querySelector('#specificHeatDiffTTab').addEventListener('shown', () => {
    tf.value = '';
    ti.value = '';
    copyToArray([q, m, cp, tf, ti], inputs);
    copyToArray([qUnits, mUnits, cpUnits, tfUnits, tiUnits], units);
    tempInputMethod = 'diffT';
    computeTarget.parentElement.classList.remove('uk-form-highlight');
    recomputeTarget.now();
    if (computeTarget === t) {
      computeTarget = ti;
    }
  });

  [q, m, cp, t, tf, ti].forEach(input => {
    input.addEventListener('input', () => {
      recomputeTarget();
    });

    input.addEventListener('blur', () => {
      if (input.checkValidity && !input.checkValidity() && input.reportValidity) {
        input.reportValidity();
      } else {
        input.value = input.value; // eslint-disable-line no-self-assign
      }
    });
  });

  document.querySelector('#specificHeatCalculate').addEventListener('click', () => {
    recomputeTarget.now();

    try {
      const computed = compute(
        inputs,
        units.map(unit => unit.value),
        inputs.indexOf(computeTarget),
        computeSpecificHeat.bind(this, tempInputMethod)
      );
      computeTarget.value = computed;
    } catch (ex) {
      UIkit.notification(ex.message, { status: 'danger' });
    }
  });

  document.querySelector('#specificHeatClear').addEventListener('click', () => {
    inputs.forEach(input => {
      input.value = '';
    });
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
