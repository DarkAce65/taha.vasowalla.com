import periodicTable from './periodicTable.json';

const molarMassTable = periodicTable.elements.reduce(
  (table, { number, symbol, name, atomic_mass }) => ({
    ...table,
    [symbol]: { number, name, mass: atomic_mass },
  }),
  {}
);

const getFormulaErrors = formula => {
  if (formula.length === 0) {
    return false;
  }

  if (!/^([A-Z][a-z]*\d*|\(|\)\d*)*$/.test(formula)) {
    return 'Formula is invalid. Make sure element symbols are capitalized correctly and atom counts directly follow elements.';
  }

  let p = 0;
  for (let i = 0; i < formula.length; i++) {
    const c = formula.charAt(i);
    if (c === '(') {
      p++;
    } else if (c === ')') {
      p--;
      if (p < 0) {
        return 'Formula is invalid. Make sure parentheses match correctly.';
      }
    }
  }
  if (p !== 0) {
    return 'Formula is invalid. Make sure parentheses match correctly.';
  }

  const elements = formula.match(/([A-Z][a-z]*)/g);
  if (elements === null) {
    return 'Found no elements in formula.';
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

const formulaToLatex = formula =>
  `\\displaystyle ${formula
    .replace(/\(/g, '\\left(')
    .replace(/\)/g, '\\right)')
    .replace(/(\d+)/g, '_{$1}')}`;

const parse = formula => {
  const tokens = formula.match(/([A-Z][a-z]*|\d+|\(|\))/g);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (/^[A-Z][a-z]*$/.test(token)) {
      let count = 1;
      if (i < tokens.length - 1 && /^\d+$/.test(tokens[i + 1])) {
        count = parseInt(tokens.splice(i + 1, 1)[0], 10);
      }
      tokens[i] = { symbol: token, count };
    } else if (token === ')') {
      let count = 1;
      if (i < tokens.length - 1 && /^\d+$/.test(tokens[i + 1])) {
        count = parseInt(tokens.splice(i + 1, 1)[0], 10);
      }

      let j = i - 1;
      while (tokens[j] !== '(') {
        tokens[j].count *= count;
        j--;
      }
      tokens.splice(i, 1);
      tokens.splice(j, 1);
      i -= 2;
    }
  }

  const elementMap = tokens.reduce((acc, { symbol, count }) => {
    if (Object.prototype.hasOwnProperty.call(acc, symbol)) {
      acc[symbol] += count;
    } else {
      acc[symbol] = count;
    }
    return acc;
  }, {});

  const elements = [];
  let totalAtoms = 0;
  let totalMass = 0;
  for (const symbol in elementMap) {
    if (Object.prototype.hasOwnProperty.call(elementMap, symbol)) {
      const count = elementMap[symbol];
      const { number, name, mass } = molarMassTable[symbol];
      const massInFormula = mass * count;
      elements.push({ name, number, mass, massInFormula, massPercent: 0, count });
      totalAtoms += count;
      totalMass += massInFormula;
    }
  }

  return {
    elements: elements
      .map(element => {
        element.massPercent = (element.massInFormula / totalMass) * 100;
        return element;
      })
      .sort((a, b) => a.number - b.number),
    totalAtoms,
    totalMass,
  };
};

export { getFormulaErrors, formulaToLatex, parse };
