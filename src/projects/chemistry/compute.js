import { fromSI, toSI } from './SIConversions';

export default (inputs, units, computeTargetIndex, equation) => {
  if (inputs.length !== units.length) {
    throw new Error('Mismatched number of inputs and units');
  }
  if (computeTargetIndex === -1) {
    throw new Error('Too many unknowns');
  }

  const parsedInputs = [];
  for (let i = 0; i < inputs.length; i++) {
    if (i === computeTargetIndex) {
      continue;
    }

    if (inputs[i].state === 'empty') {
      throw new Error('Too many unknowns');
    }

    parsedInputs[i] = parseFloat(inputs[i].value);
    if (isNaN(parsedInputs[i])) {
      throw new Error(`Invalid values in equation`);
    }

    parsedInputs[i] = toSI(parsedInputs[i], units[i]);
  }

  return fromSI(equation(parsedInputs, computeTargetIndex), units[computeTargetIndex]);
};
