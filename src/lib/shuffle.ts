// Fisher–Yates Shuffle

export default <T>(array: T[]): T[] => {
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
