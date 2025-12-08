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

class Individual {
  private static GENE_SIZE = 3 * 2 + 4;
  private data: number[];

  constructor(numTriangles: number, data?: number[]) {
    const expectedDataLength = numTriangles * Individual.GENE_SIZE;

    if (data) {
      if (data.length !== expectedDataLength) {
        throw new Error(
          `Invalid data passed for ${numTriangles} triangles. Given ${data.length} but expected ${
            expectedDataLength
          }`,
        );
      }
      this.data = data;
    } else {
      this.data = [];
      for (let i = 0; i < numTriangles; i++) {
        Individual.addTriangle(this.data);
      }
    }
  }

  static fromParents(
    numTriangles: number,
    parent1: Individual,
    parent2: Individual,
    { mutationAmount, mutationChance }: { mutationChance: number; mutationAmount: number },
  ): Individual {
    if (parent1.data.length !== parent2.data.length) {
      throw new Error(
        `Parents have incompatible data lengths: ${parent1.data.length} vs ${parent2.data.length}`,
      );
    }

    const expectedDataLength = numTriangles * Individual.GENE_SIZE;
    const data = [];
    const inheritedDataLength = Math.min(
      parent1.data.length,
      parent2.data.length,
      expectedDataLength,
    );
    for (let i = 0; i < inheritedDataLength; i += Individual.GENE_SIZE) {
      const inherited = Math.random() < 0.5 ? parent1.data : parent2.data;
      for (let j = 0; j < Individual.GENE_SIZE; j++) {
        let value = inherited[i + j];
        if (Math.random() < mutationChance) {
          value += (Math.random() * 2 - 1) * mutationAmount;
          value = Math.max(0, Math.min(value, 1));
        }
        if (isNaN(value)) {
          value = Math.random();
        }
        data.push(value);
      }
    }
    while (data.length < expectedDataLength) {
      Individual.addTriangle(data);
    }

    return new Individual(numTriangles, data);
  }

  private static addTriangle(data: number[]): void {
    for (let j = 0; j < 3; j++) {
      data.push(Math.random() * 2 - 0.5, Math.random() * 2 - 0.5);
    }
    data.push(
      Math.random(),
      Math.random(),
      Math.random(),
      Math.max(Math.random() * Math.random(), 0.2),
    );
  }

  private drawTriangle(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    index: number,
    width: number,
    height: number,
  ): void {
    const r = Math.floor(this.data[index + 6] * 255);
    const g = Math.floor(this.data[index + 7] * 255);
    const b = Math.floor(this.data[index + 8] * 255);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.data[index + 9]})`;
    ctx.beginPath();
    ctx.moveTo(Math.floor(this.data[index] * width), Math.floor(this.data[index + 1] * height));
    ctx.lineTo(Math.floor(this.data[index + 2] * width), Math.floor(this.data[index + 3] * height));
    ctx.lineTo(Math.floor(this.data[index + 4] * width), Math.floor(this.data[index + 5] * height));
    ctx.fill();
  }

  public draw(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < this.data.length; i += Individual.GENE_SIZE) {
      this.drawTriangle(ctx, i, width, height);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  enableIcons({ uikit: true, faIcons: [faFileImage] });

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
