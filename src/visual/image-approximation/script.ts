import UIkit from 'uikit';

import { faFileImage } from '@fortawesome/free-regular-svg-icons';

import DeferredPromise from '~/lib/DeferredPromise';
import enableIcons from '~/lib/enableIcons';
import { getElOrThrow } from '~/lib/getEl';

function getOffscreenCanvas(width: number, height: number): HTMLCanvasElement | OffscreenCanvas {
  try {
    return new OffscreenCanvas(width, height);
  } catch (err) {
    return document.createElement('canvas');
  }
}

function loadImageUrl(imageUrl: string): Promise<HTMLImageElement> {
  const deferredPromise = new DeferredPromise<HTMLImageElement>();
  const image = new Image();
  image.addEventListener('load', () => {
    deferredPromise.resolve(image);
  });
  image.addEventListener('error', ({ error }) => {
    deferredPromise.reject(error);
  });
  image.src = imageUrl;
  return deferredPromise.promise;
}

document.addEventListener('DOMContentLoaded', () => {
  enableIcons({ uikit: false, faIcons: [faFileImage] });

  const width = 400;
  const height = 400;

  const workingCanvas = getOffscreenCanvas(width, height);
  const displayCanvas = getElOrThrow<HTMLCanvasElement>('#displayCanvas');
  const workingCtx = workingCanvas.getContext('2d', { alpha: false });
  const displayCtx = displayCanvas.getContext('2d', { alpha: false });
  if (!workingCtx || !displayCtx) {
    UIkit.notification('Failed to initialize the page', { pos: 'bottom-right', status: 'error' });
    return;
  }

  let imageData: ImageDataArray;

  workingCanvas.width = width;
  workingCanvas.height = height;
  displayCanvas.width = width;
  displayCanvas.height = height;

  getElOrThrow('#start').addEventListener('click', () => {
    console.log('start');
  });

  getElOrThrow('#upload').addEventListener('change', (event) => {
    const { files } = event.currentTarget as HTMLInputElement;
    if (files !== null && files.length !== 0) {
      const reader = new FileReader();
      reader.onload = ({ target }) => {
        const imageUrl = target!.result;
        if (typeof imageUrl !== 'string') {
          return;
        }

        loadImageUrl(imageUrl).then((image) => {
          getElOrThrow('#image').style.backgroundImage = `url(${imageUrl})`;
          UIkit.notification(`${files[0].name} loaded!`, {
            pos: 'bottom-right',
            status: 'success',
          });

          workingCtx.clearRect(0, 0, width, height);
          const imageAspect = image.height / image.width;
          if (imageAspect > height / width) {
            const x = ((1 - 1 / imageAspect) * width) / 2;
            workingCtx.drawImage(image, x, 0, width / imageAspect, height);
          } else {
            const y = ((1 - 1 * imageAspect) * height) / 2;
            workingCtx.drawImage(image, 0, y, width, height * imageAspect);
          }
          imageData = workingCtx.getImageData(0, 0, width, height).data;
        });
      };

      reader.readAsDataURL(files[0]);
    }
  });
});
