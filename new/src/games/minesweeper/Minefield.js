import getEl from '../../lib/getEl';
import shuffle from '../../lib/shuffle';

import Clock from './Clock';
import setNumberDisplay from './setNumberDisplay';

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
  constructor({ target, minesLeftEl, timerEl }) {
    this._clock = new Clock();
    this._clock.callback = time => setNumberDisplay(timerEl, time);

    this._grid = [];
    this._rows = 0;
    this._cols = 0;
    this._openedCells = 0;
    this._numMines = 0;
    this._minesLeft = 0;
    this._domTarget = target ? getEl(target) : null;
    this._minesLeftEl = minesLeftEl;

    this._gameOptions = null;
    this.initialize('intermediate');
  }

  initialize(options = this._gameOptions) {
    if (typeof options === 'string') {
      if (!Object.prototype.hasOwnProperty.call(presets, options)) {
        throw new Error(`Invalid preset "${options}" given`);
      }

      options = presets[options];
    }

    const { rows, cols, mines } = options;
    this._gameOptions = options;
    this._rows = rows;
    this._cols = cols;

    this._grid = [];
    for (let r = 0; r < rows; r++) {
      this._grid[r] = [];
      for (let c = 0; c < cols; c++) {
        this._grid[r][c] = {
          value: 0, // -9 to 8, negative = mine
          state: 'closed', // open, closed, flag
          element: null, // Reference to element in DOM
        };
      }
    }

    this._openedCells = 0;
    this._numMines = 0;
    this._minesLeft = 0;
    setNumberDisplay(this._minesLeftEl, this._minesLeft);
    this._clock.stop();
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
    for (let r = 0; r < this._rows; r++) {
      for (let c = 0; c < this._cols; c++) {
        if (!avoid.has(`${r}${c}`) && this._grid[r][c].value >= 0) {
          possibleLocations.push({ r, c });
        }
      }
    }

    const mineLocations = shuffle(possibleLocations).slice(0, numMines);
    for (let i = 0; i < mineLocations.length; i++) {
      const { r, c } = mineLocations[i];
      this._grid[r][c].value -= 9;
      this.updateNeighbors(r, c, 1);
    }
    this._numMines += mineLocations.length;
    this._minesLeft += mineLocations.length;
    setNumberDisplay(this._minesLeftEl, this._minesLeft);
  }

  updateNeighbors(row, col, delta) {
    const rowStart = Math.max(0, row - 1);
    const rowEnd = Math.min(this._rows - 1, row + 1);
    const colStart = Math.max(0, col - 1);
    const colEnd = Math.min(this._cols - 1, col + 1);
    for (let r = rowStart; r <= rowEnd; r++) {
      for (let c = colStart; c <= colEnd; c++) {
        if (r === row && c === col) {
          continue;
        }

        this._grid[r][c].value += delta;
      }
    }
  }

  removeSurroundingBombs(row, col) {
    let minesRemoved = 0;
    const avoidLocations = [];
    const rowStart = Math.max(0, row - 1);
    const rowEnd = Math.min(this._rows - 1, row + 1);
    const colStart = Math.max(0, col - 1);
    const colEnd = Math.min(this._cols - 1, col + 1);
    for (let r = rowStart; r <= rowEnd; r++) {
      for (let c = colStart; c <= colEnd; c++) {
        avoidLocations.push({ r, c });
        if (this._grid[r][c].value < 0) {
          this._grid[r][c].value += 9;
          this.updateNeighbors(r, c, -1);
          minesRemoved++;
        }
      }
    }

    this._numMines -= minesRemoved;
    this._minesLeft -= minesRemoved;
    this.addMines(minesRemoved, avoidLocations);
  }

  bindToDOM(target) {
    if (target) {
      this._domTarget = getEl(target);
    }

    if (!this._domTarget) {
      return;
    }

    const table = this._domTarget;
    let tbody = table.querySelector('tbody');
    if (!tbody) {
      tbody = document.createElement('tbody');
      table.appendChild(tbody);
    }

    const rows = [...tbody.querySelectorAll('tr')];
    while (rows.length < this._rows) {
      rows.push(document.createElement('tr'));
    }
    if (rows.length >= this._rows) {
      rows.splice(0, rows.length - this._rows).forEach(row => row.remove());
    }

    for (let r = 0; r < this._rows; r++) {
      const row = rows[r];

      const cols = [...row.querySelectorAll('td')];
      while (cols.length < this._cols) {
        const cell = document.createElement('td');
        cols.push(cell);
        cell.addEventListener('click', () => {
          this.openCell(parseInt(cell.dataset.row, 10), parseInt(cell.dataset.col, 10));
        });
        cell.addEventListener('contextmenu', ev => {
          ev.preventDefault();
          this.openCell(parseInt(cell.dataset.row, 10), parseInt(cell.dataset.col, 10));
        });
      }
      if (cols.length >= this._cols) {
        cols.splice(0, cols.length - this._cols).forEach(col => col.remove());
      }

      for (let c = 0; c < this._cols; c++) {
        const cell = cols[c];
        cell.dataset['row'] = r;
        cell.dataset['col'] = c;
        cell.className = 'cell closed';
        row.appendChild(cell);

        this._grid[r][c].element = cell;
      }

      tbody.appendChild(row);
    }
  }

  openNeighbors(row, col) {
    const rowStart = Math.max(0, row - 1);
    const rowEnd = Math.min(this._rows - 1, row + 1);
    const colStart = Math.max(0, col - 1);
    const colEnd = Math.min(this._cols - 1, col + 1);
    for (let r = rowStart; r <= rowEnd; r++) {
      for (let c = colStart; c <= colEnd; c++) {
        if (!(r === row && c === col) && this._grid[r][c].state === 'closed') {
          this.openCell(r, c);
        }
      }
    }
  }

  openCell(row, col) {
    if (this._openedCells === 0) {
      this.removeSurroundingBombs(row, col);
      this._clock.start();
    }

    this._openedCells += 1;
    this._grid[row][col].state = 'open';
    const value = this._grid[row][col].value;
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    if (value < 0) {
      cell.classList.remove('closed');
      cell.classList.add('redmine');
      // endGame();
    } else {
      if (this._openedCells + this._numMines === this._rows * this._cols) {
        // winGame();
      }
      if (value === 0) {
        this.openNeighbors(row, col);
      }
      cell.classList.remove('closed');
      cell.classList.add(`open${value}`);
    }

    if (this.openCellCallback) {
      this.openCellCallback();
    }
  }
}

export default Minefield;
