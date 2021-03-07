// Fisher–Yates Shuffle
export const shuffle = <T>(array: T[]): T[] => {
  let m = array.length;
  let t: T;
  let i: number;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
};

export const wrappedModulo = (value: number, modulus: number): number =>
  ((value % modulus) + modulus) % modulus;

export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(value, max));

export const sigmoid = (value: number): number => 1 / (1 + Math.pow(Math.E, -value));