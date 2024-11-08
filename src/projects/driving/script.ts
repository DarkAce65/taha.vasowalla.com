import enableIcons from '~/lib/enableIcons';

import Simulator from './Simulator';
import Track from './Track';
import { Vector2 } from './constants';

document.addEventListener('DOMContentLoaded', () => {
  enableIcons();

  const width = 800;
  const height = 600;
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(1, -1);
  ctx.translate(0, -height);

  const statWidth = 200 * window.devicePixelRatio;
  const statHeight = 125 * window.devicePixelRatio;
  const netCanvas = document.getElementById('net') as HTMLCanvasElement;
  netCanvas.width = statWidth;
  netCanvas.height = statHeight;
  const netCtx = netCanvas.getContext('2d')!;

  const carStatusCanvas = document.getElementById('carStatus') as HTMLCanvasElement;
  carStatusCanvas.width = statWidth;
  carStatusCanvas.height = statHeight;
  const carStatusCtx = carStatusCanvas.getContext('2d')!;
  carStatusCtx.scale(1, -1);
  carStatusCtx.translate(0, -statHeight);

  const simCanvasParams = { ctx, width, height };
  const netCanvasParams = { ctx: netCtx, width: statWidth, height: statHeight };
  const carStatusCanvasParams = { ctx: carStatusCtx, width: statWidth, height: statHeight };

  const trackPoints: Vector2[] = [
    [120, 170],
    [150, 320],
    [90, 420],
    [110, 520],
    [400, 540],
    [650, 500],
    [700, 420],
    [660, 360],
    [540, 340],
    [400, 400],
    [320, 360],
    [300, 240],
    [390, 180],
    [620, 240],
    [700, 180],
    [685, 120],
    [600, 65],
    [305, 75],
    [130, 110],
  ];
  const track = new Track(trackPoints.map((position) => ({ position })));

  const simulator = new Simulator(track, simCanvasParams, netCanvasParams, carStatusCanvasParams, {
    generationSize: 30,
    numBreeders: 4,
    numRandom: 3,
    numHiddenNodes: 12,
    numSensors: 5,
    sensorAngle: (160 * Math.PI) / 180,
  });

  const startButton = document.querySelector('#start')!;
  const pauseButton = document.querySelector('#pause')!;
  const killButton = document.querySelector('#kill')!;
  const resetButton = document.querySelector('#reset')!;

  const updateState = (): void => {
    switch (simulator.getState()) {
      case 'RUNNING':
        startButton.classList.add('uk-active');
        pauseButton.classList.remove('uk-active');
        break;
      case 'PAUSED':
        startButton.classList.remove('uk-active');
        pauseButton.classList.add('uk-active');
        break;
      case 'STOPPED':
        startButton.classList.remove('uk-active');
        pauseButton.classList.remove('uk-active');
        break;
    }
  };

  startButton.addEventListener('click', () => {
    simulator.start();
    updateState();
  });
  pauseButton.addEventListener('click', () => {
    simulator.pause();
    updateState();
  });
  killButton.addEventListener('click', () => simulator.killCurrentSimulation());
  resetButton.addEventListener('click', () => {
    simulator.reset();
    updateState();
  });
});
