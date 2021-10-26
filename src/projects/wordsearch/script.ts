import enableIcons from '~/lib/enableIcons';

type Direction = 'u' | 'ur' | 'r' | 'dr' | 'd' | 'dl' | 'l' | 'ul';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const MAX_ATTEMPTS = 100;

const getRandomLetter = (): string => ALPHABET[Math.floor(26 * Math.random())];

const getXDelta = (direction: Direction): number => {
  switch (direction) {
    case 'ul':
    case 'l':
    case 'dl':
      return -1;
    case 'u':
    case 'd':
      return 0;
    case 'ur':
    case 'r':
    case 'dr':
      return 1;
  }
};

const getYDelta = (direction: Direction): number => {
  switch (direction) {
    case 'ul':
    case 'u':
    case 'ur':
      return -1;
    case 'l':
    case 'r':
      return 0;
    case 'dl':
    case 'd':
    case 'dr':
      return 1;
  }
};

interface GridCell {
  letter: string | null;
  uses: number;
}

interface WordPosition {
  col: number;
  row: number;
  direction: Direction;
}

class GridBuilder {
  private grid: GridCell[][];
  private wordPositions: { [word: string]: WordPosition };
  constructor(private width: number, private height: number) {
    this.grid = [];
    this.wordPositions = {};
    this.reset(width, height);
  }

  reset(width = this.width, height = this.height): void {
    this.width = width;
    this.height = height;
    this.grid = new Array(width);
    for (let col = 0; col < width; col++) {
      const column = new Array(height);
      for (let row = 0; row < height; row++) {
        column[row] = { letter: null, uses: 0 };
      }
      this.grid[col] = column;
    }

    this.wordPositions = {};
  }

  testWord(word: string, col: number, row: number, direction: Direction): boolean {
    const xDelta = getXDelta(direction);
    const yDelta = getYDelta(direction);
    for (let i = 0; i < word.length; i++) {
      const cell = this.grid[col + xDelta * i][row + yDelta * i];
      if (cell.letter && cell.letter !== word[i]) {
        return false;
      }
    }

    return true;
  }

  placeWord(word: string, col: number, row: number, direction: Direction): void {
    const xDelta = getXDelta(direction);
    const yDelta = getYDelta(direction);
    for (let i = 0; i < word.length; i++) {
      this.grid[col + xDelta * i][row + yDelta * i].letter = word[i];
      this.grid[col + xDelta * i][row + yDelta * i].uses++;
    }
    this.wordPositions[word] = { col, row, direction };
  }

  removeWord(word: string): void {
    if (!this.wordPositions[word]) {
      throw new Error(`Cannot remove ${word} - it does not exist in this grid`);
    }

    const { col, row, direction } = this.wordPositions[word];

    const xDelta = getXDelta(direction);
    const yDelta = getYDelta(direction);
    for (let i = 0; i < word.length; i++) {
      const cell = this.grid[col + xDelta * i][row + yDelta * i];
      cell.uses--;
      if (cell.uses === 0) {
        cell.letter = null;
      }
    }
  }

  randomlyPlaceWord(word: string, directions: Direction[]) {
    const l = word.length;

    const direction = directions[Math.floor(Math.random() * directions.length)];

    let colStart = 0;
    let colEnd = this.width - 1;
    let rowStart = 0;
    let rowEnd = this.height - 1;

    if (direction !== 'u' && direction !== 'd') {
      colEnd -= l;
    }
    if (['ul', 'l', 'dl'].includes(direction)) {
      colStart += l - 1;
    }
    if (direction !== 'l' && direction !== 'r') {
      rowEnd -= l;
    }
    if (['ul', 'u', 'ur'].includes(direction)) {
      rowStart += l - 1;
    }

    const col = Math.floor((colEnd + 1) * Math.random()) + colStart;
    const row = Math.floor((rowEnd + 1) * Math.random()) + rowStart;
    if (this.testWord(word, col, row, direction)) {
      this.placeWord(word, col, row, direction);
      return true;
    }

    return false;
  }

  randomlyPlaceWords(words: string[], { allowDiagonals = false, allowReversed = false } = {}) {
    this.reset();

    const directions: Direction[] = ['r', 'd'];
    if (allowDiagonals) {
      directions.push('dr');
    }
    if (allowReversed) {
      directions.push('u', 'l');
    }
    if (allowDiagonals && allowReversed) {
      directions.push('ur', 'dl', 'ul');
    }

    const attempts: { [word: string]: number } = {};
    let i = 0;

    while (i < words.length) {
      let word = words[i];
      attempts[word] = (attempts[word] || 0) + 1;
      if (attempts[word] > MAX_ATTEMPTS) {
        if (i < 1) {
          throw new Error('Unable to backtrack further');
        }

        attempts[word] = 0;
        i--;
        word = words[i];
        this.removeWord(word);
        continue;
      }

      if (this.randomlyPlaceWord(word, directions)) {
        i++;
      }
    }
  }

  render(initialRender?: boolean) {
    let tableHtml = '';
    for (let row = 0; row < this.height; row++) {
      tableHtml += '<tr>';
      for (let col = 0; col < this.width; col++) {
        const letter = initialRender
          ? '_'
          : (this.grid[col][row].letter || getRandomLetter()).toUpperCase();

        tableHtml += `<td>${letter}</td>`;
      }
      tableHtml += '</tr>';
    }
    document.querySelector('#grid')!.innerHTML = tableHtml;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  enableIcons();

  let width = 5;
  let height = 5;

  let gridBuilder: GridBuilder;
  const initializeGridBuilder = () => {
    if (width <= 0 || height <= 0) {
      return;
    }

    gridBuilder = new GridBuilder(width, height);
    gridBuilder.render(true);
  };
  initializeGridBuilder();

  (document.querySelector('#width') as HTMLInputElement).addEventListener('input', (event) => {
    const target = event.currentTarget as HTMLInputElement;
    if (target.value.length < 0) {
      return;
    }

    try {
      width = parseInt(target.value, 10);
      initializeGridBuilder();
    } catch (e) {
      // Ignore parse errors
    }
  });

  (document.querySelector('#height') as HTMLInputElement).addEventListener('input', (event) => {
    const target = event.currentTarget as HTMLInputElement;
    if (target.value.length < 0) {
      return;
    }

    try {
      height = parseInt(target.value, 10);
      initializeGridBuilder();
    } catch (e) {
      // Ignore parse errors
    }
  });

  document.querySelector('#generate')!.addEventListener('click', () => {
    const rawWordInput = (document.querySelector('#words') as HTMLTextAreaElement).value;
    const words = rawWordInput
      .split('\n')
      .map((word) => word.replaceAll(' ', '').toUpperCase())
      .filter((word) => word.length !== 0);
    const allowDiagonals = (document.querySelector('#allowDiagonals') as HTMLInputElement).checked;
    const allowReversed = (document.querySelector('#allowReversed') as HTMLInputElement).checked;

    try {
      gridBuilder.randomlyPlaceWords(words, {
        allowDiagonals,
        allowReversed,
      });
      gridBuilder.render();
    } catch (e) {
      alert(
        `Unable to make a wordsearch with ${height} rows and ${width} columns! Either try again or make the grid larger.`
      );
    }
  });
});
