import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';

import Cookie from 'js-cookie';

import ValidatedInput from '../../lib/ValidatedInput';
import { BREAKPOINT_SMALL } from '../../lib/breakpoints';
import getEl from '../../lib/getEl';
import getModalValues from '../../lib/getModalValues';

import Minefield, { presets } from './Minefield';

const initCustomGameModal = () => {
  let rows = null;
  let cols = null;
  let mines = null;

  const initializeCustomButton = document.querySelector('#initialize');
  const minesInput = new ValidatedInput('#mines', {
    validator: (input) => {
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
    validator: (input) => {
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
    validator: (input) => {
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

  const reset = () => {
    rowsInput.reset();
    colsInput.reset();
    minesInput.reset();

    rows = null;
    cols = null;
    mines = null;
  };

  return () =>
    getModalValues('#customGameModal', initializeCustomButton)
      .then(() => ({ rows, cols, mines }))
      .finally(reset);
};

const buildHighscoreTable = (difficulty, scores) => {
  const table = document.querySelector(`.scoreTable[data-difficulty=${difficulty}] tbody`);
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
        timeCell.textContent = time;
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

  const scores = Cookie.getJSON('scores') || {};
  Object.keys(presets).forEach((difficulty) => buildHighscoreTable(difficulty, scores[difficulty]));

  const highscoreNameInput = getEl('#highscoreModal #name');
  let currentDifficulty = 'beginner';
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
            Cookie.set('scores', scores);
          })
          .catch(() => {});
      }
    },
  });

  const makeOptionsPromise = initCustomGameModal();
  document.querySelector;
  highscoreNameInput.addEventListener('input', () => {
    document.querySelector('#highscoreModal #submit').disabled =
      highscoreNameInput.value.trim().length === 0;
  });

  minefield.initialize(currentDifficulty);

  const tab = UIkit.tab('#highscoreTabs');
  document.querySelector('#customTab').addEventListener('click', (ev) => {
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
      .catch(() => {});
  });
  document.querySelector('#highscores').addEventListener('show', (ev) => {
    const { difficulty } = ev.target.dataset;
    if (difficulty === 'custom') {
      return;
    }

    currentDifficulty = difficulty;
    minefield.initialize(difficulty);
  });

  const game = document.querySelector('#game');
  const resize = (size) => {
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

  document.querySelector('#scale').addEventListener('change', (ev) => resize(ev.target.value));

  Object.keys(presets).forEach((difficulty) =>
    document
      .querySelector(`.scoreTable[data-difficulty="${difficulty}"] .reset`)
      .addEventListener('click', () => {
        delete scores[difficulty];
        buildHighscoreTable(difficulty, scores[difficulty]);
        Cookie.set('scores', scores);
      })
  );

  document.querySelector('#recustomizeGame').addEventListener('click', () =>
    makeOptionsPromise()
      .then((options) => {
        currentDifficulty = 'custom';
        minefield.initialize(options);
      })
      .catch(() => {})
  );

  let scale = Cookie.get('scale');
  if (['small', 'medium', 'large'].indexOf(scale) === -1) {
    if (window.innerWidth < BREAKPOINT_SMALL) {
      scale = 'medium';
    } else {
      scale = 'small';
    }
  }
  document.querySelector('#scale').value = scale;
  resize(scale);
});
