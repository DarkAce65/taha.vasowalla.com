import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';

import { getElOrThrow } from '~/lib/getEl';

document.addEventListener('DOMContentLoaded', () => {
  UIkit.use(Icons);

  const targetCanvas = getElOrThrow<HTMLCanvasElement>('#targetCanvas');
  const workingCanvas = getElOrThrow<HTMLCanvasElement>('#workingCanvas');

  targetCanvas.width = 400;
  targetCanvas.height = 400;
  workingCanvas.width = 400;
  workingCanvas.height = 400;
});
