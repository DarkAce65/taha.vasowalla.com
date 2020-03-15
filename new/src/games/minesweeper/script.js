import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';

import { BREAKPOINT_SMALL } from '../../lib/breakpoints';

import Minefield from './Minefield';

document.addEventListener('DOMContentLoaded', () => {
  UIkit.use(Icons);

  const minefield = new Minefield({
    target: 'table#grid',
    minesLeftEl: '#minesLeft',
    faceEl: '#face',
    timerEl: '#timer',
  });

  minefield.initialize('beginner');

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
