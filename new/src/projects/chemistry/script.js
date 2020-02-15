import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';

import renderLaTeX from '../../lib/renderLaTeX';

document.addEventListener('DOMContentLoaded', () => {
  UIkit.use(Icons);

  renderLaTeX();
});
