const conversions = {
  atm: { from: (value) => value, to: (value) => value },
  mmHg: { from: (value) => value * 760, to: (value) => value / 760 },
  Pa: { from: (value) => value * 101325, to: (value) => value / 101325 },
  kPa: { from: (value) => value * 101.325, to: (value) => value / 101.325 },
  torr: { from: (value) => value * 760, to: (value) => value / 760 },
  L: { from: (value) => value, to: (value) => value },
  mL: { from: (value) => value * 1000, to: (value) => value / 1000 },
  m3: { from: (value) => value / 1000, to: (value) => value * 1000 },
  cm3: { from: (value) => value * 1000, to: (value) => value / 1000 },
  mol: { from: (value) => value, to: (value) => value },
  mmol: { from: (value) => value * 1000, to: (value) => value / 1000 },
  K: { from: (value) => value, to: (value) => value },
  C: { from: (value) => value - 273, to: (value) => value + 273 },
  F: { from: (value) => ((value - 273) * 9) / 5 + 32, to: (value) => ((value - 32) * 5) / 9 + 273 },
  M: { from: (value) => value, to: (value) => value },
  mM: { from: (value) => value * 1000, to: (value) => value / 1000 },
  J: { from: (value) => value, to: (value) => value },
  cal: { from: (value) => value * 4.184, to: (value) => value / 4.184 },
  g: { from: (value) => value, to: (value) => value },
  kg: { from: (value) => value / 1000, to: (value) => value * 1000 },
  JgK: { from: (value) => value, to: (value) => value },
  JkgK: { from: (value) => value * 1000, to: (value) => value / 1000 },
};

const fromSI = (value, unit) => {
  if (!Object.prototype.hasOwnProperty.call(conversions, unit)) {
    throw new Error(`Unrecognized unit: ${unit}`);
  }

  return conversions[unit].from(value);
};

const toSI = (value, unit) => {
  if (!Object.prototype.hasOwnProperty.call(conversions, unit)) {
    throw new Error(`Unrecognized unit: ${unit}`);
  }

  return conversions[unit].to(value);
};

export { fromSI, toSI };
