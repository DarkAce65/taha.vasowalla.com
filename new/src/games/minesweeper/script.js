import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';

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
  document.querySelector('#scale').addEventListener('change', ev => {
    switch (ev.target.value) {
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
  });
});
