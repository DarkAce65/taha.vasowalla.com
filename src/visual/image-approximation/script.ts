import UIkit from 'uikit';

import { faFileImage } from '@fortawesome/free-regular-svg-icons';

import enableIcons from '~/lib/enableIcons';
import { getElOrThrow } from '~/lib/getEl';
import { shuffle } from '~/lib/utils';

function getOffscreenCanvas(width: number, height: number): HTMLCanvasElement | OffscreenCanvas {
  try {
    return new OffscreenCanvas(width, height);
  } catch (err) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
}

function getImageData(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  image: HTMLImageElement,
): ImageDataArray {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  ctx.clearRect(0, 0, width, height);
  const imageAspect = image.height / image.width;
  if (imageAspect > height / width) {
    const x = ((1 - 1 / imageAspect) * width) / 2;
    ctx.drawImage(image, x, 0, width / imageAspect, height);
  } else {
    const y = ((1 - 1 * imageAspect) * height) / 2;
    ctx.drawImage(image, 0, y, width, height * imageAspect);
  }
  return ctx.getImageData(0, 0, width, height).data;
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
  ): void {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
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

  public draw(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (let i = 0; i < this.data.length; i += Individual.GENE_SIZE) {
      this.drawTriangle(ctx, i);
    }
  }

  public calculateFitness(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    targetImageData: ImageDataArray,
  ): number {
    this.draw(ctx);

    const workingData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data;
    let squaredDiff = 0;
    for (let p = 0; p < workingData.length; p += 4) {
      const rDiff = targetImageData[p] - workingData[p];
      const gDiff = targetImageData[p + 1] - workingData[p + 1];
      const bDiff = targetImageData[p + 2] - workingData[p + 2];
      squaredDiff += rDiff * rDiff + gDiff * gDiff + bDiff * bDiff;
    }
    const normalizedSquaredDiff = squaredDiff / (255 * 255);
    return 1 - normalizedSquaredDiff / ((workingData.length * 3) / 4);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  enableIcons({ uikit: true, faIcons: [faFileImage] });

  const imageCanvas = getElOrThrow<HTMLCanvasElement>('#imageCanvas');
  const displayCanvas = getElOrThrow<HTMLCanvasElement>('#displayCanvas');
  const workingCanvas = getOffscreenCanvas(200, 200);
  imageCanvas.width = 200;
  imageCanvas.height = 200;
  displayCanvas.width = 200;
  displayCanvas.height = 200;

  const imageCtx = imageCanvas.getContext('2d', { alpha: false });
  const displayCtx = displayCanvas.getContext('2d', { alpha: false });
  const workingCtx = workingCanvas.getContext('2d', { alpha: false });
  if (!imageCtx || !workingCtx || !displayCtx) {
    UIkit.notification('Failed to initialize the page', { pos: 'bottom-right', status: 'error' });
    return;
  }

  const trianglesPerIndividual = 125;
  const individualsPerGeneration = 50;
  const mutationChance = 0.01;
  let targetImage: HTMLImageElement;
  let targetImageData: ImageDataArray;

  function iterate(individuals: Individual[]): void {
    if (!workingCtx || !displayCtx) {
      return;
    }

    const individualsWithFitness = individuals
      .map<
        [Individual, number]
      >((individual) => [individual, individual.calculateFitness(workingCtx, targetImageData)])
      .sort(([, aFitness], [, bFitness]) => bFitness - aFitness);

    const [bestIndividual, bestFitness] = individualsWithFitness[0];
    bestIndividual.draw(displayCtx);

    const breeders = individualsWithFitness
      .slice(0, Math.max(2, ~~(individualsWithFitness.length * 0.15)))
      .map(([individual]) => individual);
    const mutationAmount = 0.1 / (bestFitness * bestFitness);

    const newIndividuals: Individual[] = [];
    for (let i = newIndividuals.length; i < individualsPerGeneration; i++) {
      shuffle(breeders);
      newIndividuals.push(
        Individual.fromParents(trianglesPerIndividual, breeders[0], breeders[1], {
          mutationAmount,
          mutationChance,
        }),
      );
    }
    requestAnimationFrame(() => iterate(newIndividuals));
  }

  function resize(width: number, height: number): void {
    if (!imageCtx) {
      return;
    }

    imageCanvas.width = width;
    imageCanvas.height = height;
    workingCanvas.width = width;
    workingCanvas.height = height;
    displayCanvas.width = width;
    displayCanvas.height = height;
    targetImageData = getImageData(imageCtx, targetImage);
  }

  function start(): void {
    iterate(
      new Array(individualsPerGeneration)
        .fill(null)
        .map(() => new Individual(trianglesPerIndividual)),
    );
  }

  getElOrThrow('#start').addEventListener('click', () => {
    start();
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

        const image = new Image();
        image.addEventListener('load', () => {
          UIkit.notification(`${files[0].name} loaded!`, {
            pos: 'bottom-right',
            status: 'success',
          });

          targetImage = image;
          targetImageData = getImageData(imageCtx, image);
          start();
        });
        image.src = imageUrl;
      };

      reader.readAsDataURL(files[0]);
    }
  });

  getElOrThrow('#blur').addEventListener('click', () => {
    displayCanvas.classList.toggle('blur');
  });
});
