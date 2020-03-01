import { fromSI, toSI } from './SIConversions';

const compute = ({ q, m, cp, t }, { qUnits, mUnits, cpUnits, tUnits }, computeTarget) => {
  if (
    (q !== computeTarget && q.value.length === 0) ||
    (m !== computeTarget && m.value.length === 0) ||
    (cp !== computeTarget && cp.value.length === 0) ||
    (t !== computeTarget && t.value.length === 0)
  ) {
    throw new Error('Too many unknowns');
  }

  let qValue = parseFloat(q.value);
  let mValue = parseFloat(m.value);
  let cpValue = parseFloat(cp.value);
  let tValue = parseFloat(t.value);

  if (
    (q !== computeTarget && (isNaN(qValue) || qValue <= 0)) ||
    (m !== computeTarget && (isNaN(mValue) || mValue <= 0)) ||
    (cp !== computeTarget && (isNaN(cpValue) || cpValue <= 0)) ||
    (t !== computeTarget && (isNaN(tValue) || tValue <= 0))
  ) {
    throw new Error('Invalid values in equation');
  }

  qValue = toSI(qValue, qUnits);
  mValue = toSI(mValue, mUnits);
  cpValue = toSI(cpValue, cpUnits);
  tValue = toSI(tValue, tUnits);

  if (computeTarget === q) {
    return fromSI(mValue * cpValue * tValue, qUnits);
  } else if (computeTarget === m) {
    return fromSI((cpValue * tValue) / qValue, mUnits);
  } else if (computeTarget === cp) {
    return fromSI((mValue * tValue) / qValue, cpUnits);
  } else if (computeTarget === t) {
    return fromSI((cpValue * mValue) / qValue, tUnits);
  }

  throw new Error('Unrecognized compute target');
};

export { compute };
