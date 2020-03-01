import { fromSI, toSI } from './SIConversions';

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

const compute = ({ m1, v1, m2, v2, m1Units, v1Units, m2Units, v2Units }, computeTarget) => {
  if (
    (m1 !== computeTarget && m1.value.length === 0) ||
    (v1 !== computeTarget && v1.value.length === 0) ||
    (m2 !== computeTarget && m2.value.length === 0) ||
    (v2 !== computeTarget && v2.value.length === 0)
  ) {
    throw new Error('Too many unknowns');
  }

  let m1Value = parseFloat(m1.value);
  let v1Value = parseFloat(v1.value);
  let m2Value = parseFloat(m2.value);
  let v2Value = parseFloat(v2.value);

  if (
    (m1 !== computeTarget && (isNaN(m1Value) || m1Value <= 0)) ||
    (v1 !== computeTarget && (isNaN(v1Value) || v1Value <= 0)) ||
    (m2 !== computeTarget && (isNaN(m2Value) || m2Value <= 0)) ||
    (v2 !== computeTarget && (isNaN(v2Value) || v2Value <= 0))
  ) {
    throw new Error('Invalid values in equation');
  }

  m1Value = toSI(m1Value, m1Units);
  v1Value = toSI(v1Value, v1Units);
  m2Value = toSI(m2Value, m2Units);
  v2Value = toSI(v2Value, v2Units);

  if (computeTarget === m1) {
    return fromSI((m2Value * v2Value) / v1Value, m1Units);
  } else if (computeTarget === v1) {
    return fromSI((m2Value * v2Value) / m1Value, v1Units);
  } else if (computeTarget === m2) {
    return fromSI((m1Value * v1Value) / v2Value, m2Units);
  } else if (computeTarget === v2) {
    return fromSI((m1Value * v1Value) / m2Value, v2Units);
  }

  throw new Error('Unrecognized compute target');
};

export { getComputeTarget, compute };
