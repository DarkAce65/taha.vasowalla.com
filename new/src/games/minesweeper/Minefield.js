import { getElOrThrow } from '../../lib/getEl';
import shuffle from '../../lib/shuffle';

import Clock from './Clock';
import setNumberDisplay from './setNumberDisplay';

export const presets = {
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

const getCoordinatesFromDataset = cell => ({
  row: parseInt(cell.dataset.row, 10),
  col: parseInt(cell.dataset.col, 10),
});

class Minefield {
  constructor({ target, minesLeftEl, faceEl, timerEl, finishCallback }) {
    this._active = false;

    this._domTarget = getElOrThrow(target);
    this._minesLeftEl = getElOrThrow(minesLeftEl);
    this._faceEl = getElOrThrow(faceEl);
    this._timerEl = getElOrThrow(timerEl);

    this._grid = [];
    this._gameOptions = { rows: 0, cols: 0, mines: 0 };
    this._openedCells = 0;
    this.minesLeft = 0;
    this._clock = new Clock();
    this._clock.callback = time => setNumberDisplay(this._timerEl, time);

    this._finishCallback = finishCallback;

    this._faceEl.addEventListener('click', () => this.initialize());
    this._domTarget.addEventListener('mousedown', () => this._faceEl.classList.add('surprise'));
    ['mouseup', 'mouseleave'].forEach(ev =>
      this._domTarget.addEventListener(ev, () => this._faceEl.classList.remove('surprise'))
    );

    this.initialize('intermediate');
  }

  set minesLeft(minesLeft) {
    this._minesLeft = minesLeft;

    setNumberDisplay(this._minesLeftEl, minesLeft);
  }

  get minesLeft() {
    return this._minesLeft;
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

    this._active = true;
    this._gameOptions.mines = 0;
    this._minesLeft = 0;
    this._openedCells = 0;
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
    for (let r = 0; r < this._gameOptions.rows; r++) {
      for (let c = 0; c < this._gameOptions.cols; c++) {
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
    this._gameOptions.mines += mineLocations.length;
    this.minesLeft += mineLocations.length;
  }

  updateNeighbors(row, col, delta) {
    const rowStart = Math.max(0, row - 1);
    const rowEnd = Math.min(this._gameOptions.rows - 1, row + 1);
    const colStart = Math.max(0, col - 1);
    const colEnd = Math.min(this._gameOptions.cols - 1, col + 1);
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
    const rowEnd = Math.min(this._gameOptions.rows - 1, row + 1);
    const colStart = Math.max(0, col - 1);
    const colEnd = Math.min(this._gameOptions.cols - 1, col + 1);
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

    this._gameOptions.mines -= minesRemoved;
    this.minesLeft -= minesRemoved;
    this.addMines(minesRemoved, avoidLocations);
  }

  bindToDOM() {
    this._faceEl.classList.remove('surprise', 'win', 'lose');

    const table = this._domTarget;
    let tbody = table.querySelector('tbody');
    if (!tbody) {
      tbody = document.createElement('tbody');
      table.appendChild(tbody);
    }

    const rows = [...tbody.querySelectorAll('tr')];
    while (rows.length < this._gameOptions.rows) {
      rows.push(document.createElement('tr'));
    }
    if (rows.length >= this._gameOptions.rows) {
      rows.splice(0, rows.length - this._gameOptions.rows).forEach(row => row.remove());
    }

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];

      const cols = [...row.querySelectorAll('td')];
      while (cols.length < this._gameOptions.cols) {
        const cell = document.createElement('td');
        cols.push(cell);
        cell.addEventListener('click', () => {
          const coords = getCoordinatesFromDataset(cell);
          this.handleCellClick(coords.row, coords.col);
        });
        cell.addEventListener('contextmenu', ev => {
          ev.preventDefault();
          const coords = getCoordinatesFromDataset(cell);
          this.handleCellRightClick(coords.row, coords.col);
        });
      }
      if (cols.length >= this._gameOptions.cols) {
        cols.splice(0, cols.length - this._gameOptions.cols).forEach(col => col.remove());
      }

      for (let c = 0; c < cols.length; c++) {
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

  finishGame(won) {
    this._active = false;
    this._clock.pause();
    if (won) {
      this._faceEl.classList.add('win');
    } else {
      this._faceEl.classList.add('lose');
    }

    for (let row = 0; row < this._gameOptions.rows; row++) {
      for (let col = 0; col < this._gameOptions.cols; col++) {
        const cell = this._grid[row][col];
        if (cell.state === 'closed' && cell.value < 0) {
          cell.state = 'open';
          cell.element.classList.remove('closed');
          cell.element.classList.add('mine');
        } else if (cell.state === 'flag' && cell.value >= 0) {
          cell.state = 'open';
          cell.element.classList.remove('flag');
          cell.element.classList.add('xmine');
        }
      }
    }

    if (this._finishCallback) {
      this._finishCallback(won ? 'win' : 'lose', this._clock.value);
    }
  }

  openNeighbors(row, col) {
    const rowStart = Math.max(0, row - 1);
    const rowEnd = Math.min(this._gameOptions.rows - 1, row + 1);
    const colStart = Math.max(0, col - 1);
    const colEnd = Math.min(this._gameOptions.cols - 1, col + 1);
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
      this.finishGame(false);
    } else {
      if (
        this._openedCells + this._gameOptions.mines ===
        this._gameOptions.rows * this._gameOptions.cols
      ) {
        this.finishGame(true);
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

  toggleFlag(row, col) {
    const cell = this._grid[row][col];
    switch (cell.state) {
      case 'closed':
        cell.state = 'flag';
        cell.element.classList.remove('closed');
        cell.element.classList.add('flag');
        this.minesLeft--;
        break;
      case 'flag':
        cell.state = 'closed';
        cell.element.classList.remove('flag');
        cell.element.classList.add('closed');
        this.minesLeft++;
        break;
    }
  }

  surroundingMinesFlagged(row, col) {
    const rowStart = Math.max(0, row - 1);
    const rowEnd = Math.min(this._gameOptions.rows - 1, row + 1);
    const colStart = Math.max(0, col - 1);
    const colEnd = Math.min(this._gameOptions.cols - 1, col + 1);
    let flags = 0;
    for (let r = rowStart; r <= rowEnd; r++) {
      for (let c = colStart; c <= colEnd; c++) {
        if (this._grid[r][c].state === 'flag') {
          flags++;
        }
      }
    }

    return this._grid[row][col].value === flags;
  }

  chord(row, col) {
    if (this._grid[row][col].state === 'open' && this.surroundingMinesFlagged(row, col)) {
      this.openNeighbors(row, col);
    }
  }

  handleCellClick(row, col) {
    if (!this._active) {
      return;
    }

    switch (this._grid[row][col].state) {
      case 'closed':
        this.openCell(row, col);
        break;
      case 'open':
        this.chord(row, col);
        break;
    }
  }

  handleCellRightClick(row, col) {
    if (!this._active) {
      return;
    }

    if (this._openedCells <= 0) {
      return;
    }

    this.toggleFlag(row, col);
  }
}

export default Minefield;
