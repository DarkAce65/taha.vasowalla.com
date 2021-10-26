import ToggleWrapper from '~/lib/ToggleWrapper';
import enableIcons from '~/lib/enableIcons';
import { getElOrThrow } from '~/lib/getEl';

type Direction = 'u' | 'ur' | 'r' | 'dr' | 'd' | 'dl' | 'l' | 'ul';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const MAX_ATTEMPTS = 20;

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
      const c = col + xDelta * i;
      const r = row + yDelta * i;
      if (c < 0 || this.width - 1 < c || r < 0 || this.height - 1 < r) {
        return false;
      }

      const cell = this.grid[c][r];
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

    const orderedWords = words.slice(0);
    orderedWords.sort((a, b) => b.length - a.length);

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
    while (i < orderedWords.length) {
      let word = orderedWords[i];

      if (attempts[word] > MAX_ATTEMPTS) {
        if (i < 1) {
          throw new Error('Unable to backtrack further');
        }

        attempts[word] = 0;
        i--;
        word = orderedWords[i];
        this.removeWord(word);
        continue;
      }

      attempts[word] = (attempts[word] || 0) + 1;
      if (this.randomlyPlaceWord(word, directions)) {
        i++;
      }
    }
  }

  render(initialRender?: boolean) {
    let tableHtml = '';
    for (let row = 0; row < this.height; row++) {
      tableHtml += '<div class="row">';
      for (let col = 0; col < this.width; col++) {
        const letter = initialRender
          ? '_'
          : (this.grid[col][row].letter || getRandomLetter()).toUpperCase();

        tableHtml += `<div class="cell">${letter}</div>`;
      }
      tableHtml += '</div>';
      if (row !== this.height - 1) {
        tableHtml += '<br/>';
      }
    }
    getElOrThrow('#grid').innerHTML = tableHtml;

    const wordsToFind = getElOrThrow('#wordsToFind');

    let wordsToFindHtml = '';
    if (!initialRender) {
      const words = Object.keys(this.wordPositions);
      words.sort();
      for (const word of words) {
        wordsToFindHtml += `<div>${word}</div>`;
      }

      wordsToFind.innerHTML = wordsToFindHtml;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  enableIcons();

  const errorElement = getElOrThrow('#error');
  const wordSearchError = new ToggleWrapper('#error', {
    animation: 'uk-animation-fade',
    mode: '',
    queued: true,
  });

  let width = 5;
  let height = 5;
  let gridBuilder = new GridBuilder(width, height);
  gridBuilder.render(true);

  getElOrThrow('#generate').addEventListener('click', () => {
    const widthInput = parseInt(getElOrThrow<HTMLInputElement>('#width').value, 10);
    const heightInput = parseInt(getElOrThrow<HTMLInputElement>('#height').value, 10);

    if (isNaN(widthInput) || isNaN(heightInput) || widthInput <= 0 || heightInput <= 0) {
      errorElement.textContent =
        'Invalid width and height - ensure that they are both greater than 0';
      wordSearchError.show();
      return;
    }

    wordSearchError.hide();

    if (widthInput !== width || heightInput !== height) {
      width = widthInput;
      height = heightInput;

      gridBuilder = new GridBuilder(width, height);
      gridBuilder.render(true);
    }

    const rawWordInput = getElOrThrow<HTMLTextAreaElement>('#words').value;
    const words = rawWordInput
      .split('\n')
      .map((word) => word.replaceAll(' ', '').toUpperCase())
      .filter((word) => word.length !== 0);

    if (words.length === 0) {
      errorElement.textContent = `No words to add to wordsearch!`;
      wordSearchError.show();
      return;
    }

    const allowDiagonals = getElOrThrow<HTMLInputElement>('#allowDiagonals').checked;
    const allowReversed = getElOrThrow<HTMLInputElement>('#allowReversed').checked;

    try {
      gridBuilder.randomlyPlaceWords(words, { allowDiagonals, allowReversed });
      gridBuilder.render();
    } catch (error) {
      errorElement.textContent = `Unable to make a wordsearch with ${height} rows and ${width} columns! Either try again or make the grid larger.`;
      wordSearchError.show();
    }
  });
});
