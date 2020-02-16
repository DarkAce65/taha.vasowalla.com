import periodicTable from './periodicTable.json';

const molarMassTable = periodicTable.elements.reduce(
  (table, { symbol, name, atomic_mass }) => ({
    ...table,
    [symbol]: { name, mass: atomic_mass },
  }),
  {}
);

const getFormulaErrors = formula => {
  if (formula.length === 0) {
    return false;
  }

  if (formula.match(/(^[a-z0-9]|\([a-z0-9]|[0-9)][a-z])/g)) {
    return 'Formula is invalid. Make sure element symbols are capitalized correctly and atom counts directly follow elements';
  }

  let p = 0;
  for (let i = 0; i < formula.length; i++) {
    const c = formula.charAt(i);
    if (c === '(') {
      p++;
    } else if (c === ')') {
      p--;
      if (p < 0) {
        return "Found ')' without matching '('";
      }
    }
  }
  if (p !== 0) {
    return 'Unclosed parenthesis';
  }

  const elements = formula.match(/([A-Z][a-z]*)/g);

  if (elements === null) {
    return 'Found no elements in formula';
  }

  const invalidElements = elements.filter(
    value => !Object.prototype.hasOwnProperty.call(molarMassTable, value)
  );

  if (invalidElements.length === 1) {
    return `${invalidElements[0]} is not a recognized element symbol.`;
  } else if (invalidElements.length === 2) {
    return `${invalidElements[0]} and ${invalidElements[1]} are not recognized element symbols.`;
  } else if (invalidElements.length > 2) {
    return `${invalidElements.slice(0, -1).join(', ')}, and ${
      invalidElements[invalidElements.length - 1]
    } are not recognized element symbols.`;
  }

  return false;
};

export { getFormulaErrors };
