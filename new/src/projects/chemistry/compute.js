import { fromSI, toSI } from './SIConversions';

export default (inputs, units, computeTargetIndex, equation) => {
  if (inputs.length !== units.length) {
    throw new Error('Mismatched inputs and units');
  }
  if (computeTargetIndex < 0 || inputs.length <= computeTargetIndex) {
    throw new Error(`Invalid compute target: ${computeTargetIndex}`);
  }

  const parsedInputs = [];
  for (let i = 0; i < inputs.length; i++) {
    if (i === computeTargetIndex) {
      continue;
    }

    if (inputs[i].value.length === 0) {
      throw new Error('Too many unknowns');
    }

    parsedInputs[i] = parseFloat(inputs[i].value);
    if (isNaN(parsedInputs[i])) {
      throw new Error(`Invalid values in equation: inputs[${i}] = ${inputs[i].value}`);
    }
    parsedInputs[i] = toSI(parsedInputs[i], units[i]);
  }

  return fromSI(equation(parsedInputs, computeTargetIndex), units[computeTargetIndex]);
};
