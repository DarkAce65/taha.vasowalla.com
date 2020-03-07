import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';

document.addEventListener('DOMContentLoaded', () => {
  UIkit.use(Icons);

  const cells = document.querySelectorAll('#board .cell');

  setTimeout(() => {
    cells.forEach(cell => {
      const r = Math.random();
      if (r < 0.3) cell.classList.add('possible');
      else if (r < 0.6) cell.classList.add('red');
      else cell.classList.add('blue');
    });
  }, 0);

  cells.forEach(cell => {
    cell.addEventListener('click', () => {
      console.log(cell.dataset);
    });
  });
});
