export default (inputs) => {
  let computeTarget = 'old';
  for (let i = 0; i < inputs.length; i++) {
    const state = inputs[i].state;
    if (state === 'error') {
      return 'error';
    }

    if (state === 'empty') {
      if (computeTarget === 'old') {
        computeTarget = inputs[i];
      } else {
        return null;
      }
    }
  }

  return computeTarget;
};
