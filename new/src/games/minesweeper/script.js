import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';

import ValidatedInput from '../../lib/ValidatedInput';
import { BREAKPOINT_SMALL } from '../../lib/breakpoints';

import Minefield from './Minefield';

const initCustomGameModal = () => {
  let rows = null;
  let cols = null;
  let mines = null;

  const modal = document.querySelector('#customGameModal');
  const initializeCustomButton = document.querySelector('#initialize');
  const minesInput = new ValidatedInput('#mines', {
    validator: input => {
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
    validator: input => {
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
          minesInput.input.dispatchEvent(new InputEvent('input'));
        }
      } else {
        rows = null;
      }

      initializeCustomButton.disabled = rows === null || cols === null || mines === null;
    },
  });
  const colsInput = new ValidatedInput('#cols', {
    validator: input => {
      const parsedCols = Math.floor(parseFloat(input));
      if (parsedCols < 9 || 30 < parsedCols) {
        return { type: 'error', message: 'Number of cols must be between 9 and 30' };
      }

      return false;
    },
    inputCallback: (input, state) => {
      if (state === 'default') {
        cols = Math.floor(parseFloat(input));

        if (rows !== null) {
          minesInput.input.dispatchEvent(new InputEvent('input'));
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
    new Promise((resolve, reject) => {
      function onSubmit() {
        if (rows !== null && cols !== null && mines !== null) {
          initializeCustomButton.removeEventListener('click', onSubmit);
          modal.removeEventListener('click', onHide);
          UIkit.modal('#customGameModal').hide();

          resolve({ rows, cols, mines });
          reset();
        }
      }

      function onHide() {
        initializeCustomButton.removeEventListener('click', onSubmit);
        modal.removeEventListener('click', onHide);

        reject();
        reset();
      }

      initializeCustomButton.addEventListener('click', onSubmit);
      modal.addEventListener('hide', onHide);
    });
};

document.addEventListener('DOMContentLoaded', () => {
  UIkit.use(Icons);

  const minefield = new Minefield({
    target: 'table#grid',
    minesLeftEl: '#minesLeft',
    faceEl: '#face',
    timerEl: '#timer',
  });

  const makeOptionsPromise = initCustomGameModal();

  minefield.initialize('beginner');

  const tab = UIkit.tab('#highscoreTabs');
  document.querySelector('#customTab').addEventListener('click', ev => {
    if (tab.index() === 3) {
      return;
    }

    ev.stopPropagation();

    UIkit.modal('#customGameModal').show();
    makeOptionsPromise()
      .then(options => {
        tab.show(3);
        minefield.initialize(options);
      })
      .catch(() => {});
  });
  document.querySelector('#highscores').addEventListener('show', ev => {
    const { difficulty } = ev.target.dataset;
    if (difficulty === 'custom') {
      return;
    }

    minefield.initialize(difficulty);
  });

  const game = document.querySelector('#game');
  const resize = size => {
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
    }
  };

  document.querySelector('#scale').addEventListener('change', ev => resize(ev.target.value));

  if (window.innerWidth < BREAKPOINT_SMALL) {
    document.querySelector('#scale').value = 'medium';
    resize('medium');
  }
});
