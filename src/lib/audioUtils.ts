export const toHHMMSS = (number: number): string => {
  const date = new Date(0, 0, 0);
  date.setSeconds(Math.round(number));
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  let hourMinuteSeparator = '';
  if (hours !== 0) {
    if (minutes < 10) {
      hourMinuteSeparator = ':0';
    } else {
      hourMinuteSeparator = ':';
    }
  }

  let minuteSecondSeparator = ':';
  if (seconds < 10) {
    minuteSecondSeparator += '0';
  }

  return `${hours}${hourMinuteSeparator}${minutes}${minuteSecondSeparator}${seconds}`;
};

const toLog = (i: number, max: number): number => Math.pow(max, i / (max - 1)) - 1;

export const makeLogarithmicMapper = (
  maxDomain: number,
  maxRange: number
): ((index: number) => number) => {
  const mapped: number[] = [];
  for (let i = 0; i < maxDomain; i++) {
    mapped[i] = toLog((i * maxRange) / maxDomain, maxRange);
  }

  return (i) => mapped[i];
};
