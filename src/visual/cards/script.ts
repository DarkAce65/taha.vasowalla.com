import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';

import gsap from 'gsap';

import { shuffle } from '~/lib/utils';

let height = 300;
let width = 800;
let cardHeight = 90;
let cardWidth = 50;

let cardOpacity = 1;
let cardCount = 60;
let current = 'random';
let delay = 5 / cardCount;

const resize = (): void => {
  const container = document.querySelector<HTMLElement>('#animationContainer')!;

  height =
    window.innerHeight - container.getBoundingClientRect().top + document.body.scrollTop - 10;
  container.style.height = `${height}px`;
  width = parseFloat(getComputedStyle(container, null).width.replace('px', ''));

  cardHeight = Math.min(90, Math.floor(((height - 20) * 3) / 20));
  cardWidth = Math.min(50, Math.floor(width / 20));

  document.querySelectorAll<HTMLElement>('.card').forEach((element) => {
    element.style.height = `${cardHeight}px`;
    element.style.width = `${cardWidth}px`;
    element.style.marginTop = `${-cardHeight / 2}px`;
    element.style.marginLeft = `${-cardWidth / 2}px`;
  });
};

// Pile orientation
const pile = (elements: Element[], offset = 0): void => {
  current = 'pile';

  gsap.to(elements, {
    duration: 1,
    stagger: delay,
    x: width / 4,
    y: (index) => height - (index + offset) / 2,
    z: 0,
    rotationX: 90,
    rotationY: 0,
    rotationZ: 0,
  });
};

// Cylinder orientation
const cylinder = (elements: Element[], offset = 0): void => {
  current = 'cylinder';

  elements.forEach((element, index) => {
    const radiusOffset = Math.floor((index + offset) / 60);
    const radius = Math.max(0, width / 4 - radiusOffset * (width / 30));
    const angle = (((index + offset) % 10) / 10) * 2 * Math.PI;
    const px = radius * Math.cos(angle);
    const pz = radius * Math.sin(angle);
    const py = Math.floor((index + offset - radiusOffset * 60) / 10) * (height / 6) + height / 12;

    gsap.to(element, {
      duration: 2.5,
      delay: index * delay,
      ease: 'elastic.out(1, 1)',
      x: px,
      y: py,
      z: pz,
      rotationX: 0,
      rotationY: 90 - (angle * 180) / Math.PI,
      rotationZ: 0,
    });
  });
};

// Sphere orientation
const sphere = (elements: Element[], offset = 0): void => {
  current = 'sphere';

  const radius = Math.min(width / 2.2, height / 2.2);
  elements.forEach((element, index) => {
    const phi = Math.acos(-1 + (2 * (index + offset)) / cardCount);
    const theta = Math.sqrt(cardCount * Math.PI) * phi;
    const px = radius * Math.cos(theta) * Math.sin(phi);
    const py = radius * Math.sin(theta) * Math.sin(phi);
    const pz = radius * Math.cos(phi);
    let rx =
      (180 / Math.PI) *
      Math.acos(
        (px * px + pz * pz) / Math.sqrt(px * px + py * py + pz * pz) / Math.sqrt(px * px + pz * pz),
      );
    if (Math.sign(py) === Math.sign(pz)) {
      rx *= -1;
    }
    const ry = (180 / Math.PI) * Math.atan(px / pz);
    const rz = 0;

    gsap.to(element, {
      duration: 2.5,
      delay: index * delay,
      ease: 'elastic.out(1, 1)',
      x: px,
      y: py + height / 2,
      z: pz,
      rotationX: rx,
      rotationY: ry,
      rotationZ: rz,
    });
  });
};

// Fan orientation
const fan = (elements: Element[], offset = 0): void => {
  current = 'fan';

  const radius = Math.min(width / 2.2 - cardHeight / 2, height / 2.2 - cardHeight / 2);
  elements.forEach((element, index) => {
    const angle = (-(index + offset) / cardCount) * Math.PI;
    const px = radius * Math.cos(angle);
    const py = radius * Math.sin(angle) + height / 1.5;
    const pz = (index + offset) / 5;
    gsap.to(element, {
      duration: 2.5,
      delay: index * delay,
      ease: 'elastic.out(1, 1)',
      x: px,
      y: py,
      z: pz,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 90 + angle * (180 / Math.PI),
    });
  });
};

// Drop to floor
const drop = (elements: Element[]): void => {
  current = 'drop';

  const makeRandomShift = (low: number, high: number) => () => {
    const r = Math.random() * (high - low) + low;

    if (r < 0) {
      return `-=${Math.abs(r)}`;
    }

    return `+=${r}`;
  };

  gsap.to(elements, {
    duration: 1,
    stagger: delay / 1.5,
    ease: 'bounce.out',
    x: makeRandomShift(-25, 25),
    y: height,
    z: makeRandomShift(-25, 25),
    rotationX(_, element) {
      const rotationX = (gsap.getProperty(element, 'rotationX') as number) || 0;
      return rotationX % 90 < 0 ? -90 : 90;
    },
    rotationY: makeRandomShift(-60, 60),
    rotationZ: 0,
  });
};

// Random orientation
const randomPosition = (elements: Element[]): void => {
  current = 'random';

  const s = (width - cardHeight * 2) / 2;
  const r = gsap.utils.random(-s, s, true);
  const h = gsap.utils.random(0, height, true);
  const randomAngle = gsap.utils.random(-360, 360, true);
  gsap.to(elements, {
    duration: 1,
    stagger: delay,
    x: r,
    y: h,
    z: r,
    rotationX: randomAngle,
    rotationY: randomAngle,
    rotationZ: randomAngle,
  });
};

document.addEventListener('DOMContentLoaded', () => {
  UIkit.use(Icons);

  gsap.to('#animation', { duration: 20, ease: 'none', rotationY: -360 }).repeat(-1); // Infinite spin

  for (let i = 0; i < cardCount; i++) {
    document
      .querySelector('#animation')!
      .insertAdjacentHTML(
        'beforeend',
        `<div class="card" style="background: hsl(${(i * 360) / cardCount}, 100%, 50%);"></div>`,
      );
  }

  resize();
  gsap.set('.card', { y: height / 2, rotationZ: 90, opacity: cardOpacity });
  delay = 0.02;
  randomPosition(Array.from(document.querySelectorAll('.card')));
  delay = 5 / cardCount;

  document.querySelector('#cardCountContainer')!.addEventListener('click', () => {
    // Change opacity
    cardOpacity = cardOpacity === 1 ? 0.5 : 1;
    gsap.killTweensOf('.card:not(.dead)', 'opacity');
    gsap.to('.card', { duration: 2, opacity: cardOpacity });
  });

  document.querySelectorAll('a#add, button#add').forEach((element) => {
    element.addEventListener('click', () => {
      // Add 30 cards
      cardCount += 30;
      document.querySelector('#cardCount')!.textContent = `${cardCount}`;
      delay = 5 / cardCount;

      const newCards = [];
      for (let i = 0; i < 30; i++) {
        const card = document.createElement('div');
        card.classList.add('card');
        newCards.push(card);
        document.querySelector('#animation')!.appendChild(card);
      }
      resize();
      gsap.set(newCards, { y: height / 2, rotationZ: 90, opacity: cardOpacity });

      switch (current) {
        case 'pile':
          pile(newCards, cardCount - 30);
          break;
        case 'cylinder':
          cylinder(newCards, cardCount - 30);
          break;
        case 'sphere':
          gsap.killTweensOf('.card:not(.dead)');
          sphere(Array.from(document.querySelectorAll('.card:not(.dead)')));
          break;
        case 'fan':
          gsap.killTweensOf('.card:not(.dead)');
          fan(Array.from(document.querySelectorAll('.card:not(.dead)')));
          break;
        case 'drop':
          drop(newCards);
          break;
        case 'random':
          randomPosition(newCards);
          break;
      }

      gsap.killTweensOf('.card:not(.dead)', 'backgroundColor');
      gsap.to('.card:not(.dead)', { duration: 1, backgroundColor: 'hsl(0, 100%, 50%)' }).then(() =>
        gsap.to('.card:not(.dead)', {
          duration: 1,
          stagger: 0.01,
          backgroundColor: (i) => `hsl(${(i * 360) / cardCount}, 100%, 50%)`,
        }),
      );

      document.querySelector('button#remove')!.removeAttribute('disabled');
      (document.querySelector('a#remove')!.parentNode! as HTMLElement).classList.remove(
        'uk-disabled',
      );
    });
  });

  document.querySelectorAll('a#remove, button#remove').forEach((removeButton) =>
    removeButton.addEventListener('click', () => {
      // Remove 30 cards
      if (cardCount > 60) {
        gsap.killTweensOf('.card:not(.dead)');
        cardCount -= 30;
        delay = 5 / cardCount;

        const killedElements = shuffle(
          Array.from(document.querySelectorAll('.card:not(.dead)')),
        ).slice(0, 30);
        killedElements.forEach((el) => el.classList.add('dead'));
        gsap
          .to(killedElements, { duration: 0.6, rotationX: 0, rotationY: 0, rotationZ: 0 })
          .then(() => gsap.to(killedElements, { duration: 1, ease: 'power1.in', y: 0, opacity: 0 }))
          .then(() => {
            killedElements.forEach((el) => el.parentNode!.removeChild(el));
            document.querySelector('#cardCount')!.textContent = `${cardCount}`;
            gsap.to('.card:not(.dead)', {
              duration: 1,
              stagger: 0.01,
              backgroundColor: (i) => `hsl(${(i * 360) / cardCount}, 100%, 50%)`,
            });
          });

        switch (current) {
          case 'pile':
            pile(Array.from(document.querySelectorAll('.card:not(.dead)')));
            break;
          case 'cylinder':
            cylinder(Array.from(document.querySelectorAll('.card:not(.dead)')));
            break;
          case 'sphere':
            sphere(Array.from(document.querySelectorAll('.card:not(.dead)')));
            break;
          case 'fan':
            fan(Array.from(document.querySelectorAll('.card:not(.dead)')));
            break;
        }

        if (cardCount <= 60) {
          document.querySelector('button#remove')!.setAttribute('disabled', '');
          (document.querySelector('a#remove')!.parentNode! as HTMLElement).classList.add(
            'uk-disabled',
          );
        }
      }
    }),
  );

  document.querySelectorAll('a#pile, button#pile').forEach((pileButton) =>
    pileButton.addEventListener('click', () => {
      gsap.killTweensOf('.card:not(.dead)', 'x,y,z,rotationX,rotationY,rotationZ');
      pile(Array.from(document.querySelectorAll('.card:not(.dead)'))); // Position cards
    }),
  );

  document.querySelectorAll('a#cylinder, button#cylinder').forEach((cylinderButton) =>
    cylinderButton.addEventListener('click', () => {
      gsap.killTweensOf('.card:not(.dead)', 'x,y,z,rotationX,rotationY,rotationZ');
      cylinder(Array.from(document.querySelectorAll('.card:not(.dead)')));
    }),
  );

  document.querySelectorAll('a#sphere, button#sphere').forEach((sphereButton) =>
    sphereButton.addEventListener('click', () => {
      gsap.killTweensOf('.card:not(.dead)', 'x,y,z,rotationX,rotationY,rotationZ');
      sphere(Array.from(document.querySelectorAll('.card:not(.dead)')));
    }),
  );

  document.querySelectorAll('a#fan, button#fan').forEach((fanButton) =>
    fanButton.addEventListener('click', () => {
      gsap.killTweensOf('.card:not(.dead)', 'x,y,z,rotationX,rotationY,rotationZ');
      fan(Array.from(document.querySelectorAll('.card:not(.dead)')));
    }),
  );

  document.querySelectorAll('a#drop, button#drop').forEach((dropButton) =>
    dropButton.addEventListener('click', () => {
      if (current !== 'drop') {
        gsap.killTweensOf('.card:not(.dead)', 'x,y,z,rotationX,rotationY,rotationZ');
        drop(shuffle(Array.from(document.querySelectorAll('.card:not(.dead)'))));
      }
    }),
  );

  document.querySelectorAll('a#random, button#random').forEach((randomButton) =>
    randomButton.addEventListener('click', () => {
      gsap.killTweensOf('.card:not(.dead)', 'x,y,z,rotationX,rotationY,rotationZ');
      randomPosition(shuffle(Array.from(document.querySelectorAll('.card:not(.dead)'))));
    }),
  );

  let resizeTimeout: ReturnType<typeof setTimeout>;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resize();

      gsap.killTweensOf('.card:not(.dead)', 'x,y,z,rotationX,rotationY,rotationZ');
      switch (current) {
        case 'pile':
          pile(Array.from(document.querySelectorAll('.card:not(.dead)')));
          break;
        case 'cylinder':
          cylinder(Array.from(document.querySelectorAll('.card:not(.dead)')));
          break;
        case 'sphere':
          sphere(Array.from(document.querySelectorAll('.card:not(.dead)')));
          break;
        case 'fan':
          fan(Array.from(document.querySelectorAll('.card:not(.dead)')));
          break;
      }
    }, 500);
  });
});
