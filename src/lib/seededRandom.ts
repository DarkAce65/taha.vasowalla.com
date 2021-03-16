import { MathUtils } from 'three';

export default (value: number): number =>
  MathUtils.seededRandom(Math.abs(Math.floor(120193413 * (value + 1509))));
