import { Selector, getElOrThrow } from '~/lib/getEl';

export default (selector: Selector, num: number): void => {
  const element = getElOrThrow(selector);

  const display = [];
  const isNegative = num < 0;
  num = Math.abs(num);
  for (let i = 0; i < 3; i++) {
    const number = document.createElement('span');
    number.classList.add('number', `n${num % 10}`);
    display[2 - i] = number;
    num = ~~(num / 10);
  }
  if (isNegative) {
    const dash = document.createElement('span');
    dash.classList.add('number', 'dash');
    display[0] = dash;
  }

  element.innerHTML = '';
  display.forEach((number) => element.appendChild(number));
};
