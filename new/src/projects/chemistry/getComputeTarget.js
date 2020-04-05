export default (inputs) => {
  let computeTarget = null;
  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].value.length === 0) {
      if (computeTarget === null) {
        computeTarget = inputs[i];
      } else {
        return null;
      }
    }
  }

  return computeTarget;
};
