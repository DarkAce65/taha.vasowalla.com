import shuffle from '../../lib/shuffle';
import getEl from '../../lib/getEl';

const presets = {
  beginner: {
    rows: 9,
    cols: 9,
    mines: 10,
  },
  intermediate: {
    rows: 16,
    cols: 16,
    mines: 40,
  },
  expert: {
    rows: 16,
    cols: 30,
    mines: 99,
  },
};

class Minefield {
  constructor(target) {
    this.grid = [];
    this.openedCells = 0;
    this.numMines = 0;
    this.minesLeft = 0;
    this.domTarget = target ? getEl(target) : null;

    this.initialize('intermediate');
  }

  initialize(options) {
    if (typeof options === 'string') {
      if (!Object.prototype.hasOwnProperty.call(presets, options)) {
        throw new Error(`Invalid preset "${options}" given`);
      }

      options = presets[options];
    }

    const { rows, cols, mines } = options;
    this.grid = [];
    for (let r = 0; r < rows; r++) {
      this.grid[r] = [];
      for (let c = 0; c < cols; c++) {
        this.grid[r][c] = {
          value: 0, // -9 to 8, negative = mine
          state: 'closed', // open, closed, flag
          element: null, // Reference to element in DOM
        };
      }
    }

    this.numMines = 0;
    this.minesLeft = 0;
    this.addMines(mines);
    this.bindToDOM();
  }

  addMines(numMines, avoidLocations = []) {
    const avoid = new Set();
    for (let i = 0; i < avoidLocations.length; i++) {
      const { r, c } = avoidLocations[i];
      avoid.add(`${r}${c}`);
    }

    const possibleLocations = [];
    for (let r = 0; r < this.grid.length; r++) {
      for (let c = 0; c < this.grid[0].length; c++) {
        if (!avoid.has(`${r}${c}`) && this.grid[r][c].value >= 0) {
          possibleLocations.push({ r, c });
        }
      }
    }

    const mineLocations = shuffle(possibleLocations).slice(0, numMines);
    for (let i = 0; i < mineLocations.length; i++) {
      const { r, c } = mineLocations[i];
      this.grid[r][c].value -= 9;
      this.updateNeighbors(r, c, 1);
    }
  }

  updateNeighbors(row, col, delta) {
    const rowStart = Math.max(0, row - 1);
    const rowEnd = Math.min(this.grid.length - 1, row + 1);
    const colStart = Math.max(0, col - 1);
    const colEnd = Math.min(this.grid[0].length - 1, col + 1);
    for (let r = rowStart; r <= rowEnd; r++) {
      for (let c = colStart; c <= colEnd; c++) {
        if (r === row && c === col) {
          continue;
        }

        this.grid[r][c].value += delta;
      }
    }
  }

  bindToDOM(target) {
    if (target) {
      this.domTarget = getEl(target);
    }

    if (!this.domTarget) {
      return;
    }

    const table = this.domTarget;
    let tbody = table.querySelector('tbody');
    if (!tbody) {
      tbody = document.createElement('tbody');
      table.appendChild(tbody);
    }

    const rows = [...tbody.querySelectorAll('tr')];
    while (rows.length < this.grid.length) {
      rows.push(document.createElement('tr'));
    }
    if (rows.length >= this.grid.length) {
      rows.splice(0, rows.length - this.grid.length).forEach(row => row.remove());
    }

    for (let r = 0; r < this.grid.length; r++) {
      const row = rows[r];

      const cols = [...row.querySelectorAll('td')];
      while (cols.length < this.grid[0].length) {
        const cell = document.createElement('td');
        cols.push(cell);
        cell.addEventListener('click', () => console.log(cell.dataset));
      }
      if (cols.length >= this.grid[0].length) {
        cols.splice(0, cols.length - this.grid[0].length).forEach(col => col.remove());
      }

      for (let c = 0; c < this.grid[0].length; c++) {
        const cell = cols[c];
        cell.dataset['row'] = r;
        cell.dataset['cell'] = c;
        cell.className = 'cell closed';
        row.appendChild(cell);

        this.grid[r][c].element = cell;
      }

      tbody.appendChild(row);
    }
  }
}

export default Minefield;
