import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';

import katex from 'katex';

import ToggleWrapper from '~/lib/ToggleWrapper';
import ValidatedInput from '~/lib/ValidatedInput';
import debounce from '~/lib/debounce';
import renderLaTeX from '~/lib/renderLaTeX';

import compute from './compute';
import computeDilution from './computeDilution';
import computeIdealGasLaw from './computeIdealGasLaw';
import computeSpecificHeat from './computeSpecificHeat';
import getComputeTarget from './getComputeTarget';
import { formulaToLatex, parseFormula } from './molarMass';

const initMolarMass = () => {
  const formulaAndError = new ToggleWrapper('#molarMassFormulaContainer', {
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

  input.addEventListener('input', function () {
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
  const m1 = new ValidatedInput('#dilutionM1');
  const v1 = new ValidatedInput('#dilutionV1');
  const m2 = new ValidatedInput('#dilutionM2');
  const v2 = new ValidatedInput('#dilutionV2');
  const m1Units = document.querySelector('#dilutionM1Units');
  const v1Units = document.querySelector('#dilutionV1Units');
  const m2Units = document.querySelector('#dilutionM2Units');
  const v2Units = document.querySelector('#dilutionV2Units');
  const calculateButton = document.querySelector('#dilutionCalculate');
  const inputs = [m1, v1, m2, v2];
  const units = [m1Units, v1Units, m2Units, v2Units];

  let computeTarget = null;
  const recomputeTarget = debounce(() => {
    const newComputeTarget = getComputeTarget(inputs);
    if (computeTarget === newComputeTarget || newComputeTarget === 'old') {
      calculateButton.disabled = computeTarget === null;
      return;
    } else if (newComputeTarget === 'error') {
      calculateButton.disabled = true;
      return;
    }

    if (computeTarget !== null) {
      computeTarget.input.parentElement.classList.remove('uk-form-highlight');
      computeTarget.enableValidation = true;
    }

    if (newComputeTarget !== null) {
      newComputeTarget.input.parentElement.classList.add('uk-form-highlight');
      newComputeTarget.enableValidation = false;
    }

    computeTarget = newComputeTarget;
    calculateButton.disabled = computeTarget === null;
  });

  m1.setValidation(null, { stateCallback: recomputeTarget });
  v1.setValidation(null, { stateCallback: recomputeTarget });
  m2.setValidation(null, { stateCallback: recomputeTarget });
  v2.setValidation(null, { stateCallback: recomputeTarget });
  calculateButton.disabled = computeTarget === null;

  calculateButton.addEventListener('click', () => {
    recomputeTarget.now();

    try {
      const computed = compute(
        inputs,
        units.map((unit) => unit.value),
        inputs.indexOf(computeTarget),
        computeDilution
      );
      computeTarget.setValue(computed);
    } catch (ex) {
      UIkit.notification(ex.message, { status: 'danger' });
    }
  });

  document.querySelector('#dilutionClear').addEventListener('click', () => {
    inputs.forEach((input) => input.reset());
  });
};

const initIdealGasLaw = () => {
  const p = new ValidatedInput('#idealGasLawP');
  const v = new ValidatedInput('#idealGasLawV');
  const n = new ValidatedInput('#idealGasLawN');
  const t = new ValidatedInput('#idealGasLawT');
  const pUnits = document.querySelector('#idealGasLawPUnits');
  const vUnits = document.querySelector('#idealGasLawVUnits');
  const nUnits = document.querySelector('#idealGasLawNUnits');
  const tUnits = document.querySelector('#idealGasLawTUnits');
  const calculateButton = document.querySelector('#idealGasLawCalculate');
  const inputs = [p, v, n, t];
  const units = [pUnits, vUnits, nUnits, tUnits];

  let computeTarget = null;
  const recomputeTarget = debounce(() => {
    const newComputeTarget = getComputeTarget(inputs);
    if (computeTarget === newComputeTarget || newComputeTarget === 'old') {
      calculateButton.disabled = computeTarget === null;
      return;
    } else if (newComputeTarget === 'error') {
      calculateButton.disabled = true;
      return;
    }

    if (computeTarget !== null) {
      computeTarget.input.parentElement.classList.remove('uk-form-highlight');
      computeTarget.enableValidation = true;
    }

    if (newComputeTarget !== null) {
      newComputeTarget.input.parentElement.classList.add('uk-form-highlight');
      newComputeTarget.enableValidation = false;
    }

    computeTarget = newComputeTarget;
    calculateButton.disabled = computeTarget === null;
  });

  p.setValidation(null, { stateCallback: recomputeTarget });
  v.setValidation(null, { stateCallback: recomputeTarget });
  n.setValidation(null, { stateCallback: recomputeTarget });
  t.setValidation(null, { stateCallback: recomputeTarget });
  calculateButton.disabled = computeTarget === null;

  calculateButton.addEventListener('click', () => {
    recomputeTarget.now();

    try {
      const computed = compute(
        inputs,
        units.map((unit) => unit.value),
        inputs.indexOf(computeTarget),
        computeIdealGasLaw
      );
      computeTarget.setValue(computed);
    } catch (ex) {
      UIkit.notification(ex.message, { status: 'danger' });
    }
  });

  document.querySelector('#idealGasLawClear').addEventListener('click', () => {
    inputs.forEach((input) => input.reset());
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
  const q = new ValidatedInput('#specificHeatQ');
  const m = new ValidatedInput('#specificHeatM');
  const cp = new ValidatedInput('#specificHeatCp');
  const t = new ValidatedInput('#specificHeatT');
  const tf = new ValidatedInput('#specificHeatTf');
  const ti = new ValidatedInput('#specificHeatTi');
  const qUnits = document.querySelector('#specificHeatQUnits');
  const mUnits = document.querySelector('#specificHeatMUnits');
  const cpUnits = document.querySelector('#specificHeatCpUnits');
  const tUnits = document.querySelector('#specificHeatTUnits');
  const tfUnits = document.querySelector('#specificHeatTfUnits');
  const tiUnits = document.querySelector('#specificHeatTiUnits');
  const calculateButton = document.querySelector('#specificHeatCalculate');
  const inputs = [q, m, cp, t];
  const units = [qUnits, mUnits, cpUnits, tUnits];

  let computeTarget = null;
  const recomputeTarget = debounce(() => {
    const newComputeTarget = getComputeTarget(inputs);
    if (computeTarget === newComputeTarget || newComputeTarget === 'old') {
      calculateButton.disabled = computeTarget === null;
      return;
    } else if (newComputeTarget === 'error') {
      calculateButton.disabled = true;
      return;
    }

    if (computeTarget !== null) {
      computeTarget.input.parentElement.classList.remove('uk-form-highlight');
      computeTarget.enableValidation = true;
    }

    if (newComputeTarget !== null) {
      newComputeTarget.input.parentElement.classList.add('uk-form-highlight');
      newComputeTarget.enableValidation = false;
    }

    computeTarget = newComputeTarget;
    calculateButton.disabled = computeTarget === null;
  });

  let tempInputMethod = 'deltaT';
  document.querySelector('#specificHeatDeltaTTab').addEventListener('shown', () => {
    t.reset();
    copyToArray([q, m, cp, t], inputs);
    copyToArray([qUnits, mUnits, cpUnits, tUnits], units);
    tempInputMethod = 'deltaT';
    recomputeTarget.now();
  });
  document.querySelector('#specificHeatDiffTTab').addEventListener('shown', () => {
    tf.reset();
    ti.reset();
    copyToArray([q, m, cp, tf, ti], inputs);
    copyToArray([qUnits, mUnits, cpUnits, tfUnits, tiUnits], units);
    tempInputMethod = 'diffT';
    recomputeTarget.now();
  });

  q.setValidation(null, { stateCallback: recomputeTarget });
  m.setValidation(null, { stateCallback: recomputeTarget });
  cp.setValidation(null, { stateCallback: recomputeTarget });
  t.setValidation(null, { stateCallback: recomputeTarget });
  tf.setValidation(null, { stateCallback: recomputeTarget });
  ti.setValidation(null, { stateCallback: recomputeTarget });
  calculateButton.disabled = computeTarget === null;

  calculateButton.addEventListener('click', () => {
    recomputeTarget.now();

    try {
      const computed = compute(
        inputs,
        units.map((unit) => unit.value),
        inputs.indexOf(computeTarget),
        computeSpecificHeat.bind(this, tempInputMethod)
      );
      computeTarget.setValue(computed);
    } catch (ex) {
      UIkit.notification(ex.message, { status: 'danger' });
    }
  });

  document.querySelector('#specificHeatClear').addEventListener('click', () => {
    inputs.forEach((input) => input.reset());
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
