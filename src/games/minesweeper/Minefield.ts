import { Selector, getElOrThrow } from '~/lib/getEl';
import { shuffle } from '~/lib/utils';

import Clock from './Clock';
import setNumberDisplay from './setNumberDisplay';

export const PRESETS = {
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

const getCoordinatesFromDataset = (cell: HTMLTableCellElement): { row: number; col: number } => ({
  row: parseInt(cell.dataset.row!, 10),
  col: parseInt(cell.dataset.col!, 10),
});

interface MinefieldOptions {
  rows: number;
  cols: number;
  mines: number;
}
interface MinefieldGridCell {
  value: number; // -9 to 8, negative = mine
  state: 'open' | 'closed' | 'flag'; // open, closed, flag
  element: HTMLTableCellElement | null; // Reference to element in DOM
}

class Minefield {
  private active: boolean;

  private readonly domTarget: HTMLElement;
  private readonly minesLeftEl: HTMLElement;
  private readonly faceEl: HTMLElement;
  private readonly timerEl: HTMLElement;

  private readonly clock: Clock;
  private grid: MinefieldGridCell[][];
  private gameOptions: MinefieldOptions;
  private openedCells: number;
  private _minesLeft = 0;

  private readonly finishCallback?: (state: 'win' | 'lose', time: number) => void;

  constructor({
    target,
    minesLeftEl,
    faceEl,
    timerEl,
    finishCallback,
  }: {
    target: Selector;
    minesLeftEl: Selector;
    faceEl: Selector;
    timerEl: Selector;
    finishCallback?: (state: 'win' | 'lose', time: number) => void;
  }) {
    this.active = false;

    this.domTarget = getElOrThrow(target);
    this.minesLeftEl = getElOrThrow(minesLeftEl);
    this.faceEl = getElOrThrow(faceEl);
    this.timerEl = getElOrThrow(timerEl);

    this.grid = [];
    this.gameOptions = { rows: 0, cols: 0, mines: 0 };
    this.openedCells = 0;
    this.minesLeft = 0;
    this.clock = new Clock();
    this.clock.callback = (time) => setNumberDisplay(this.timerEl, time);

    this.finishCallback = finishCallback;

    this.faceEl.addEventListener('click', () => this.initialize());
    this.domTarget.addEventListener('mousedown', () => this.faceEl.classList.add('surprise'));
    ['mouseup', 'mouseleave'].forEach((ev) =>
      this.domTarget.addEventListener(ev, () => this.faceEl.classList.remove('surprise')),
    );

    this.initialize('intermediate');
  }

  set minesLeft(minesLeft: number) {
    this._minesLeft = minesLeft;

    setNumberDisplay(this.minesLeftEl, minesLeft);
  }

  get minesLeft(): number {
    return this._minesLeft;
  }

  initialize(options: MinefieldOptions | keyof typeof PRESETS = this.gameOptions): void {
    if (typeof options === 'string') {
      if (!Object.prototype.hasOwnProperty.call(PRESETS, options)) {
        throw new Error(`Invalid preset "${options}" given`);
      }

      options = PRESETS[options];
    }

    const { rows, cols, mines } = options;
    this.gameOptions = options;

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

    this.active = true;
    this.gameOptions.mines = 0;
    this._minesLeft = 0;
    this.openedCells = 0;
    this.clock.stop();
    this.addMines(mines);
    this.bindToDOM();
  }

  addMines(numMines: number, avoidLocations: { r: number; c: number }[] = []): void {
    const avoid = new Set();
    for (let i = 0; i < avoidLocations.length; i++) {
      const { r, c } = avoidLocations[i];
      avoid.add(`${r}${c}`);
    }

    const possibleLocations = [];
    for (let r = 0; r < this.gameOptions.rows; r++) {
      for (let c = 0; c < this.gameOptions.cols; c++) {
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
    this.gameOptions.mines += mineLocations.length;
    this.minesLeft += mineLocations.length;
  }

  updateNeighbors(row: number, col: number, delta: number): void {
    const rowStart = Math.max(0, row - 1);
    const rowEnd = Math.min(this.gameOptions.rows - 1, row + 1);
    const colStart = Math.max(0, col - 1);
    const colEnd = Math.min(this.gameOptions.cols - 1, col + 1);
    for (let r = rowStart; r <= rowEnd; r++) {
      for (let c = colStart; c <= colEnd; c++) {
        if (r === row && c === col) {
          continue;
        }

        this.grid[r][c].value += delta;
      }
    }
  }

  removeSurroundingBombs(row: number, col: number): void {
    let minesRemoved = 0;
    const avoidLocations = [];
    const rowStart = Math.max(0, row - 1);
    const rowEnd = Math.min(this.gameOptions.rows - 1, row + 1);
    const colStart = Math.max(0, col - 1);
    const colEnd = Math.min(this.gameOptions.cols - 1, col + 1);
    for (let r = rowStart; r <= rowEnd; r++) {
      for (let c = colStart; c <= colEnd; c++) {
        avoidLocations.push({ r, c });
        if (this.grid[r][c].value < 0) {
          this.grid[r][c].value += 9;
          this.updateNeighbors(r, c, -1);
          minesRemoved++;
        }
      }
    }

    this.gameOptions.mines -= minesRemoved;
    this.minesLeft -= minesRemoved;
    this.addMines(minesRemoved, avoidLocations);
  }

  bindToDOM(): void {
    this.faceEl.classList.remove('surprise', 'win', 'lose');

    const table = this.domTarget;
    let tbody = table.querySelector('tbody');
    if (!tbody) {
      tbody = document.createElement('tbody');
      table.appendChild(tbody);
    }

    const rows = Array.from(tbody.querySelectorAll('tr'));
    while (rows.length < this.gameOptions.rows) {
      rows.push(document.createElement('tr'));
    }
    if (rows.length >= this.gameOptions.rows) {
      rows.splice(0, rows.length - this.gameOptions.rows).forEach((row) => row.remove());
    }

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];

      const cols = Array.from(row.querySelectorAll('td'));
      while (cols.length < this.gameOptions.cols) {
        const cell = document.createElement('td');
        cols.push(cell);
        cell.addEventListener('click', () => {
          const coords = getCoordinatesFromDataset(cell);
          this.handleCellClick(coords.row, coords.col);
        });
        cell.addEventListener('contextmenu', (ev) => {
          ev.preventDefault();
          const coords = getCoordinatesFromDataset(cell);
          this.handleCellRightClick(coords.row, coords.col);
        });
      }
      if (cols.length >= this.gameOptions.cols) {
        cols.splice(0, cols.length - this.gameOptions.cols).forEach((col) => col.remove());
      }

      for (let c = 0; c < cols.length; c++) {
        const cell = cols[c];
        cell.dataset['row'] = `${r}`;
        cell.dataset['col'] = `${c}`;
        cell.className = 'cell closed';
        row.appendChild(cell);

        this.grid[r][c].element = cell;
      }

      tbody.appendChild(row);
    }
  }

  finishGame(won: boolean): void {
    this.active = false;
    this.clock.pause();
    if (won) {
      this.faceEl.classList.add('win');
    } else {
      this.faceEl.classList.add('lose');
    }

    for (let row = 0; row < this.gameOptions.rows; row++) {
      for (let col = 0; col < this.gameOptions.cols; col++) {
        const cell = this.grid[row][col];
        const cellElement = cell.element!;
        if (cell.state === 'closed' && cell.value < 0) {
          cell.state = 'open';
          cellElement.classList.remove('closed');
          cellElement.classList.add('mine');
        } else if (cell.state === 'flag' && cell.value >= 0) {
          cell.state = 'open';
          cellElement.classList.remove('flag');
          cellElement.classList.add('xmine');
        }
      }
    }

    if (this.finishCallback) {
      this.finishCallback(won ? 'win' : 'lose', this.clock.value);
    }
  }

  openNeighbors(row: number, col: number): void {
    const rowStart = Math.max(0, row - 1);
    const rowEnd = Math.min(this.gameOptions.rows - 1, row + 1);
    const colStart = Math.max(0, col - 1);
    const colEnd = Math.min(this.gameOptions.cols - 1, col + 1);
    for (let r = rowStart; r <= rowEnd; r++) {
      for (let c = colStart; c <= colEnd; c++) {
        if (!(r === row && c === col) && this.grid[r][c].state === 'closed') {
          this.openCell(r, c);
        }
      }
    }
  }

  openCell(row: number, col: number): void {
    if (this.openedCells === 0) {
      this.removeSurroundingBombs(row, col);
      this.clock.start();
    }

    this.openedCells += 1;
    const cell = this.grid[row][col];
    const cellElement = cell.element!;
    cell.state = 'open';
    if (cell.value < 0) {
      cellElement.classList.remove('closed');
      cellElement.classList.add('redmine');
      this.finishGame(false);
    } else {
      if (
        this.openedCells + this.gameOptions.mines ===
        this.gameOptions.rows * this.gameOptions.cols
      ) {
        this.finishGame(true);
      }
      if (cell.value === 0) {
        this.openNeighbors(row, col);
      }
      cellElement.classList.remove('closed');
      cellElement.classList.add(`open${cell.value}`);
    }
  }

  toggleFlag(row: number, col: number): void {
    const cell = this.grid[row][col];
    const cellElement = cell.element!;
    switch (cell.state) {
      case 'closed':
        cell.state = 'flag';
        cellElement.classList.remove('closed');
        cellElement.classList.add('flag');
        this.minesLeft--;
        break;
      case 'flag':
        cell.state = 'closed';
        cellElement.classList.remove('flag');
        cellElement.classList.add('closed');
        this.minesLeft++;
        break;
    }
  }

  surroundingMinesFlagged(row: number, col: number): boolean {
    const rowStart = Math.max(0, row - 1);
    const rowEnd = Math.min(this.gameOptions.rows - 1, row + 1);
    const colStart = Math.max(0, col - 1);
    const colEnd = Math.min(this.gameOptions.cols - 1, col + 1);
    let flags = 0;
    for (let r = rowStart; r <= rowEnd; r++) {
      for (let c = colStart; c <= colEnd; c++) {
        if (this.grid[r][c].state === 'flag') {
          flags++;
        }
      }
    }

    return this.grid[row][col].value === flags;
  }

  chord(row: number, col: number): void {
    if (this.grid[row][col].state === 'open' && this.surroundingMinesFlagged(row, col)) {
      this.openNeighbors(row, col);
    }
  }

  handleCellClick(row: number, col: number): void {
    if (!this.active) {
      return;
    }

    switch (this.grid[row][col].state) {
      case 'closed':
        this.openCell(row, col);
        break;
      case 'open':
        this.chord(row, col);
        break;
    }
  }

  handleCellRightClick(row: number, col: number): void {
    if (!this.active || this.openedCells <= 0) {
      return;
    }

    this.toggleFlag(row, col);
  }
}

export default Minefield;
