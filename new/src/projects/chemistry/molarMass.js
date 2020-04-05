import periodicTable from './periodicTable.json';

const molarMassTable = periodicTable.elements.reduce(
  (table, { number, symbol, name, atomic_mass }) => ({
    ...table,
    [symbol]: { number, name, mass: atomic_mass },
  }),
  {}
);

const validateFormula = (formula) => {
  if (formula.length === 0) {
    return;
  }

  if (!/^([A-Z][a-z]*([1-9]\d*)?|\(|\)([1-9]\d*)?)*$/.test(formula)) {
    throw new Error(
      'Invalid formula. Make sure element symbols are capitalized correctly and atom counts directly follow elements.'
    );
  }

  let lastOpenParen = -1;
  let parenCount = 0;
  for (let i = 0; i < formula.length; i++) {
    const c = formula.charAt(i);
    if (c === '(') {
      parenCount++;
      lastOpenParen = i;
    } else if (c === ')') {
      parenCount--;
      if (parenCount < 0) {
        throw new Error('Invalid formula. Found mismatched parentheses.');
      } else if (lastOpenParen === i - 1) {
        throw new Error('Invalid formula. Found a pair of empty parentheses.');
      }
    }
  }
  if (parenCount !== 0) {
    throw new Error('Invalid formula. Found mismatched parentheses.');
  }

  const elements = formula.match(/([A-Z][a-z]*)/g);
  if (elements === null) {
    throw new Error('Found no elements in formula.');
  }

  const invalidElements = elements.filter(
    (value) => !Object.prototype.hasOwnProperty.call(molarMassTable, value)
  );
  if (invalidElements.length === 1) {
    throw new Error(`Unknown elements. ${invalidElements[0]} is not a recognized element symbol.`);
  } else if (invalidElements.length === 2) {
    throw new Error(
      `Unknown elements. ${invalidElements[0]} and ${invalidElements[1]} are not recognized element symbols.`
    );
  } else if (invalidElements.length > 2) {
    throw new Error(
      `Unknown elements. ${invalidElements.slice(0, -1).join(', ')}, and ${
        invalidElements[invalidElements.length - 1]
      } are not recognized element symbols.`
    );
  }
};

const formulaToLatex = (formula) =>
  formula.replace(/\(/g, '\\left(').replace(/\)/g, '\\right)').replace(/(\d+)/g, '_{$1}');

const parseFormula = (formula) => {
  validateFormula(formula);

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
      .map((element) => {
        element.massPercent = (element.massInFormula / totalMass) * 100;
        return element;
      })
      .sort((a, b) => a.number - b.number),
    totalAtoms,
    totalMass,
  };
};

export { formulaToLatex, parseFormula };
