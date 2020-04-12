import { fromSI, toSI } from './SIConversions';

export default (inputs, units, computeTargetIndex, equation) => {
  if (inputs.length !== units.length) {
    throw new Error('Mismatched number of inputs and units');
  }
  if (computeTargetIndex < 0 || inputs.length <= computeTargetIndex) {
    throw new Error(`Invalid compute target: ${computeTargetIndex}`);
  }

  const parsedInputs = [];
  for (let i = 0; i < inputs.length; i++) {
    if (i === computeTargetIndex) {
      continue;
    }

    if (inputs[i].getState() === 'empty') {
      throw new Error('Too many unknowns');
    }

    parsedInputs[i] = parseFloat(inputs[i].getValue());
    if (isNaN(parsedInputs[i])) {
      throw new Error(`Invalid values in equation`);
    }

    parsedInputs[i] = toSI(parsedInputs[i], units[i]);
  }

  return fromSI(equation(parsedInputs, computeTargetIndex), units[computeTargetIndex]);
};
