import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';

import Cookie from 'js-cookie';

import ValidatedInput from '~/lib/ValidatedInput';
import { BREAKPOINT_SMALL } from '~/lib/breakpoints';
import { getElOrThrow } from '~/lib/getEl';
import getModalValues from '~/lib/getModalValues';

import Minefield, { PRESETS } from './Minefield';

type Scale = 'small' | 'medium' | 'large';
type Difficulty = 'beginner' | 'intermediate' | 'expert' | 'custom';

const initCustomGameModal = (): (() => Promise<{ rows: number; cols: number; mines: number }>) => {
  let rows: number | null = null;
  let cols: number | null = null;
  let mines: number | null = null;

  const initializeCustomButton = getElOrThrow<HTMLButtonElement>('#initialize');
  const minesInput = new ValidatedInput('#mines', {
    customValidator: (input) => {
      const parsedMines = Math.floor(parseFloat(input));
      if (parsedMines < 10) {
        return { type: 'error', message: 'Number of mines must be at least 10' };
      }
      if (rows !== null && cols !== null && parsedMines > rows * cols) {
        return {
          type: 'error',
          message: `Number of mines must be at less than the number of tiles (${rows * cols})`,
        };
      }

      return false;
    },
    inputCallback: (input, state) => {
      if (state === 'default') {
        mines = Math.floor(parseFloat(input));
      } else {
        mines = null;
      }

      initializeCustomButton.disabled = rows === null || cols === null || mines === null;
    },
  });
  const rowsInput = new ValidatedInput('#rows', {
    customValidator: (input) => {
      const parsedRows = Math.floor(parseFloat(input));
      if (parsedRows < 9 || 24 < parsedRows) {
        return { type: 'error', message: 'Number of rows must be between 9 and 24' };
      }

      return false;
    },
    inputCallback: (input, state) => {
      if (state === 'default') {
        rows = Math.floor(parseFloat(input));

        if (cols !== null) {
          minesInput.revalidate();
        }
      } else {
        rows = null;
      }

      initializeCustomButton.disabled = rows === null || cols === null || mines === null;
    },
  });
  const colsInput = new ValidatedInput('#cols', {
    customValidator: (input) => {
      const parsedCols = Math.floor(parseFloat(input));
      if (parsedCols < 9 || 30 < parsedCols) {
        return { type: 'error', message: 'Number of columns must be between 9 and 30' };
      }

      return false;
    },
    inputCallback: (input, state) => {
      if (input.length > 0 && state === 'default') {
        cols = Math.floor(parseFloat(input));

        if (rows !== null) {
          minesInput.revalidate();
        }
      } else {
        cols = null;
      }

      initializeCustomButton.disabled = rows === null || cols === null || mines === null;
    },
  });

  const reset = (): void => {
    rowsInput.reset();
    colsInput.reset();
    minesInput.reset();

    rows = null;
    cols = null;
    mines = null;
  };

  return () =>
    getModalValues('#customGameModal', initializeCustomButton)
      .then(() => ({ rows: rows!, cols: cols!, mines: mines! }))
      .finally(reset);
};

const buildHighscoreTable = (
  difficulty: Difficulty,
  scores?: { name: string; time: number }[],
): void => {
  const table = getElOrThrow(`.scoreTable[data-difficulty=${difficulty}] tbody`);
  table.innerHTML = '';

  if (scores) {
    scores
      .slice(0)
      .sort((a, b) => a.time - b.time)
      .forEach(({ name, time }) => {
        const scoreRow = document.createElement('tr');
        const nameCell = document.createElement('td');
        nameCell.textContent = name;
        scoreRow.appendChild(nameCell);
        const timeCell = document.createElement('td');
        timeCell.textContent = `${time}`;
        scoreRow.appendChild(timeCell);

        table.appendChild(scoreRow);
      });
  } else {
    const row = document.createElement('tr');
    const emptyCell = document.createElement('td');
    emptyCell.colSpan = 2;
    emptyCell.textContent = 'No highscores yet';

    row.appendChild(emptyCell);
    table.appendChild(row);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  UIkit.use(Icons);

  const scoresCookie = Cookie.get('scores');
  const scores = scoresCookie ? JSON.parse(scoresCookie) : {};
  Object.keys(PRESETS).forEach((difficulty) =>
    buildHighscoreTable(difficulty as keyof typeof PRESETS, scores[difficulty]),
  );

  const highscoreNameInput = getElOrThrow<HTMLInputElement>('#highscoreModal #name');
  let currentDifficulty: Difficulty = 'beginner';
  const minefield = new Minefield({
    target: 'table#grid',
    minesLeftEl: '#minesLeft',
    faceEl: '#face',
    timerEl: '#timer',
    finishCallback: (state, time) => {
      if (currentDifficulty !== 'custom' && state === 'win') {
        if (!Object.prototype.hasOwnProperty.call(scores, currentDifficulty)) {
          scores[currentDifficulty] = [];
        }

        getModalValues('#highscoreModal', '#submit', [highscoreNameInput])
          .then(([name]) => {
            scores[currentDifficulty].push({ name: name.trim(), time });
            buildHighscoreTable(currentDifficulty, scores[currentDifficulty]);
            Cookie.set('scores', JSON.stringify(scores));
          })
          .catch(() => {
            UIkit.notification('Failed to save highscore!', { status: 'danger' });
          });
      }
    },
  });

  const makeOptionsPromise = initCustomGameModal();
  document.querySelector;
  highscoreNameInput.addEventListener('input', () => {
    getElOrThrow<HTMLButtonElement>('#highscoreModal #submit').disabled =
      highscoreNameInput.value.trim().length === 0;
  });

  minefield.initialize(currentDifficulty);

  const tab = UIkit.tab('#highscoreTabs');
  getElOrThrow('#customTab').addEventListener('click', (ev) => {
    if (tab.index() === 3) {
      return;
    }

    ev.stopPropagation();

    makeOptionsPromise()
      .then((options) => {
        tab.show(3);
        currentDifficulty = 'custom';
        minefield.initialize(options);
      })
      .catch(() => {
        // Ignore error from closing modal
      });
  });
  getElOrThrow('#highscores').addEventListener('show', (ev) => {
    const difficulty = (ev.target as HTMLDivElement).dataset.difficulty as Difficulty;
    if (difficulty === 'custom') {
      return;
    }

    currentDifficulty = difficulty;
    minefield.initialize(difficulty);
  });

  const game = getElOrThrow('#game');
  const resize = (size: Scale): void => {
    switch (size) {
      case 'small':
        game.classList.remove('size-medium', 'size-large');
        game.classList.add('size-small');
        break;
      case 'medium':
        game.classList.remove('size-small', 'size-large');
        game.classList.add('size-medium');
        break;
      case 'large':
        game.classList.remove('size-small', 'size-medium');
        game.classList.add('size-large');
        break;
      default:
        throw new Error(`Invalid size: ${size}`);
    }

    Cookie.set('scale', size);
  };

  getElOrThrow<HTMLSelectElement>('#scale').addEventListener('change', (ev) =>
    resize((ev.currentTarget as HTMLSelectElement).value as Scale),
  );

  Object.keys(PRESETS).forEach((difficulty) =>
    getElOrThrow(`.scoreTable[data-difficulty="${difficulty}"] .reset`).addEventListener(
      'click',
      () => {
        delete scores[difficulty];
        buildHighscoreTable(difficulty as keyof typeof PRESETS, scores[difficulty]);
        Cookie.set('scores', JSON.stringify(scores));
      },
    ),
  );

  getElOrThrow('#recustomizeGame').addEventListener('click', () =>
    makeOptionsPromise()
      .then((options) => {
        currentDifficulty = 'custom';
        minefield.initialize(options);
      })
      .catch(() => {
        // Ignore error from closing modal
      }),
  );

  let scale = Cookie.get('scale');
  if (scale) {
    if (['small', 'medium', 'large'].indexOf(scale) === -1) {
      if (window.innerWidth < BREAKPOINT_SMALL) {
        scale = 'medium';
      } else {
        scale = 'small';
      }
    }
    getElOrThrow<HTMLSelectElement>('#scale').value = scale;
    resize(scale as Scale);
  }
});
