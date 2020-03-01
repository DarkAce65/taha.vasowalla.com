import { fromSI, toSI } from './SIConversions';

const R = 0.0820573; // (L * atm) / (K * mol)

const compute = ({ p, v, n, t }, { pUnits, vUnits, nUnits, tUnits }, computeTarget) => {
  if (
    (p !== computeTarget && p.value.length === 0) ||
    (v !== computeTarget && v.value.length === 0) ||
    (n !== computeTarget && n.value.length === 0) ||
    (t !== computeTarget && t.value.length === 0)
  ) {
    throw new Error('Too many unknowns');
  }

  let pValue = parseFloat(p.value);
  let vValue = parseFloat(v.value);
  let nValue = parseFloat(n.value);
  let tValue = parseFloat(t.value);

  if (
    (p !== computeTarget && (isNaN(pValue) || pValue <= 0)) ||
    (v !== computeTarget && (isNaN(vValue) || vValue <= 0)) ||
    (n !== computeTarget && (isNaN(nValue) || nValue <= 0)) ||
    (t !== computeTarget && (isNaN(tValue) || tValue <= 0))
  ) {
    throw new Error('Invalid values in equation');
  }

  pValue = toSI(pValue, pUnits);
  vValue = toSI(vValue, vUnits);
  nValue = toSI(nValue, nUnits);
  tValue = toSI(tValue, tUnits);

  if (computeTarget === p) {
    return fromSI((nValue * R * tValue) / vValue, pUnits);
  } else if (computeTarget === v) {
    return fromSI((nValue * R * tValue) / pValue, vUnits);
  } else if (computeTarget === n) {
    return fromSI((pValue * vValue) / tValue / R, nUnits);
  } else if (computeTarget === t) {
    return fromSI((pValue * vValue) / nValue / R, tUnits);
  }

  throw new Error('Unrecognized compute target');
};

export { compute };
