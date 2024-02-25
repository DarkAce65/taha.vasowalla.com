import gsap from 'gsap';
import Draggable from 'gsap/Draggable';

import enableIcons from '~/lib/enableIcons';
import { getElOrThrow } from '~/lib/getEl';

import Bubbles from './bubbles';
import Rain from './rain';

export interface Vector2 {
  x: number;
  y: number;
}

export interface Animation {
  render(ctx: CanvasRenderingContext2D): void;
}

function addAnimationHandler(
  buttonElement: HTMLElement,
  ctx: CanvasRenderingContext2D,
  animation: Animation,
): void {
  let animationHandle: ReturnType<typeof requestAnimationFrame> | null = null;
  function render(): void {
    animationHandle = requestAnimationFrame(render);
    animation.render(ctx);
  }
  buttonElement.addEventListener('click', function () {
    if (animationHandle === null) {
      animationHandle = requestAnimationFrame(render);
      buttonElement.classList.add('uk-active');
    } else {
      cancelAnimationFrame(animationHandle);
      animationHandle = null;
      buttonElement.classList.remove('uk-active');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  enableIcons();
  gsap.registerPlugin(Draggable);

  const bubblesCanvas = getElOrThrow<HTMLCanvasElement>('#bubbles');
  const bubblesCtx = bubblesCanvas.getContext('2d')!;

  const rainCanvas = getElOrThrow<HTMLCanvasElement>('#rain');
  const rainCtx = rainCanvas.getContext('2d')!;

  resize();

  const bubbles = new Bubbles();
  const rain = new Rain();

  addAnimationHandler(getElOrThrow('#bubblesToggle'), bubblesCtx, bubbles);
  addAnimationHandler(getElOrThrow('#rainToggle'), rainCtx, rain);

  gsap.set('#rainDial', { transformOrigin: '50% 50%' });
  Draggable.create('#rainDial', {
    type: 'rotation',
    bounds: { minRotation: -135, maxRotation: 135 },
    onDrag() {
      rain.rainChance = (this.rotation + 135) / 270;
    },
  });
  gsap.set('#rainDial', { rotation: -81 });

  function resize(): void {
    rainCanvas.height = rainCanvas.offsetHeight;
    rainCanvas.width = rainCanvas.offsetWidth;
    bubblesCanvas.height = bubblesCanvas.offsetHeight;
    bubblesCanvas.width = bubblesCanvas.offsetWidth;
  }

  window.addEventListener('resize', resize);
});
