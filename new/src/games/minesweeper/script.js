import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';

import getEl from '../../lib/getEl';
import Minefield from './Minefield';

const setNumberDisplay = (selector, num) => {
  const element = getEl(selector);
  if (!element) {
    throw new Error(`Missing element: ${selector}`);
  }

  const display = [];
  const isNegative = num < 0;
  num = Math.abs(num);
  for (let i = 0; i < 3; i++) {
    const number = document.createElement('span');
    number.classList.add('number', `n${num % 10}`);
    display[2 - i] = number;
    num = ~~(num / 10);
  }
  if (isNegative) {
    const dash = document.createElement('span');
    dash.classList.add('number', 'dash');
    display[0] = dash;
  }

  element.innerHTML = '';
  display.forEach(number => element.appendChild(number));
};

const timer = {
  value: 0,
  timeoutId: null,
  start() {
    this.timeoutId = setInterval(() => {
      timer.value += 1;
      setNumberDisplay('#timer', timer.value);
      if (timer.value === 999) {
        clearInterval(timer.timeoutId);
      }
    }, 1000);
  },
  stop() {
    clearInterval(timer.timeoutId);
    this.timeoutId = null;
  },
  restart() {
    this.value = 0;
    this.start();
  },
};

const minefield = new Minefield();

document.addEventListener('DOMContentLoaded', () => {
  UIkit.use(Icons);

  setNumberDisplay('#minesLeft', 99);
  setNumberDisplay('#timer', 0);

  minefield.bindToDOM('table#grid');
  setTimeout(() => {
    minefield.initialize('beginner');

    setTimeout(() => {
      minefield.initialize({ rows: 50, cols: 50, mines: 50 });

      setTimeout(() => {
        minefield.initialize('expert');
      }, 2000);
    }, 2000);
  }, 2000);
});
