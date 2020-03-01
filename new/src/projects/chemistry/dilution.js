const getComputeTarget = inputs => {
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

const compute = (m1, v1, m2, v2, computeTarget) => {
  if (
    (m1 !== computeTarget && m1.value.length === 0) ||
    (v1 !== computeTarget && v1.value.length === 0) ||
    (m2 !== computeTarget && m2.value.length === 0) ||
    (v2 !== computeTarget && v2.value.length === 0)
  ) {
    throw new Error('Too many unknowns');
  }

  const m1Value = parseFloat(m1.value);
  const v1Value = parseFloat(v1.value);
  const m2Value = parseFloat(m2.value);
  const v2Value = parseFloat(v2.value);

  if (
    (m1 !== computeTarget && (isNaN(m1Value) || m1Value <= 0)) ||
    (v1 !== computeTarget && (isNaN(v1Value) || v1Value <= 0)) ||
    (m2 !== computeTarget && (isNaN(m2Value) || m2Value <= 0)) ||
    (v2 !== computeTarget && (isNaN(v2Value) || v2Value <= 0))
  ) {
    throw new Error('Invalid values in equation');
  }

  if (computeTarget === m1) {
    return (m2Value * v2Value) / v1Value;
  } else if (computeTarget === v1) {
    return (m2Value * v2Value) / m1Value;
  } else if (computeTarget === m2) {
    return (m1Value * v1Value) / v2Value;
  } else if (computeTarget === v2) {
    return (m1Value * v1Value) / m2Value;
  }

  throw new Error('Unrecognized compute target');
};

export { getComputeTarget, compute };
