export default (tempInputMethod, parsedInputs, computeTargetIndex) => {
  if (tempInputMethod === 'deltaT') {
    switch (computeTargetIndex) {
      case 0:
        return parsedInputs[1] * parsedInputs[2] * parsedInputs[3];
      case 1:
        return parsedInputs[0] / parsedInputs[2] / parsedInputs[3];
      case 2:
        return parsedInputs[0] / parsedInputs[1] / parsedInputs[3];
      case 3:
        return parsedInputs[0] / parsedInputs[1] / parsedInputs[2];
      default:
        break;
    }
  } else if (tempInputMethod === 'diffT') {
    switch (computeTargetIndex) {
      case 0:
        return parsedInputs[1] * parsedInputs[2] * (parsedInputs[3] - parsedInputs[4]);
      case 1:
        return parsedInputs[0] / parsedInputs[2] / (parsedInputs[3] - parsedInputs[4]);
      case 2:
        return parsedInputs[0] / parsedInputs[1] / (parsedInputs[3] - parsedInputs[4]);
      case 3:
        return parsedInputs[0] / parsedInputs[1] / parsedInputs[2] + parsedInputs[4];
      case 4:
        return parsedInputs[3] - parsedInputs[0] / parsedInputs[1] / parsedInputs[2];
      default:
        break;
    }
  } else {
    throw new Error(`Invalid temperature input method: ${tempInputMethod}`);
  }

  throw new Error(`Invalid compute target index: ${computeTargetIndex}`);
};
