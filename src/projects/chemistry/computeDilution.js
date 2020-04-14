export default (parsedInputs, computeTargetIndex) => {
  switch (computeTargetIndex) {
    case 0:
      return (parsedInputs[2] * parsedInputs[3]) / parsedInputs[1];
    case 1:
      return (parsedInputs[2] * parsedInputs[3]) / parsedInputs[0];
    case 2:
      return (parsedInputs[0] * parsedInputs[1]) / parsedInputs[3];
    case 3:
      return (parsedInputs[0] * parsedInputs[1]) / parsedInputs[2];
    default:
      break;
  }

  throw new Error(`Invalid compute target index: ${computeTargetIndex}`);
};
