import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';

import Minefield from './Minefield';

document.addEventListener('DOMContentLoaded', () => {
  UIkit.use(Icons);

  const minefield = new Minefield({
    target: 'table#grid',
    minesLeftEl: '#minesLeft',
    timerEl: '#timer',
  });

  document.querySelector('#face').addEventListener('click', () => minefield.initialize());
});
