import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';
import { TimelineMax, Linear, Power1, Bounce } from 'gsap';

let height;
let width;
let cardHeight;
let cardWidth;
let delay;

let cardOpacity = 1;
let cardCount = 60;
let current = 'random';

let backgroundTimeline;
let colorTimeline;
let animationTimeline;

const resize = () => {
  const container = document.querySelector('#animationContainer');
  // Resize function
  height =
    window.innerHeight - container.getBoundingClientRect().top + document.body.scrollTop - 10;

  container.style.height = height;
  width = parseFloat(getComputedStyle(container, null).width.replace('px', ''));

  cardHeight = Math.min(90, Math.floor(((height - 20) * 3) / 20));
  cardWidth = Math.min(50, Math.floor(width / 20));

  document.querySelectorAll('.card').forEach(element => {
    element.style.height = cardHeight;
    element.style.width = cardWidth;
    element.style.marginTop = -cardHeight / 2;
    element.style.marginLeft = -cardWidth / 2;
  });
};

const pile = (elements, offset = 0) => {
  // Pile orientation
  current = 'pile'; // Set the current orientation
  animationTimeline.staggerTo(
    elements,
    1,
    {
      cycle: { y: index => height - (index + offset) / 2 },
      x: width / 4,
      z: 0,
      rotationX: 90,
      rotationY: 0,
      rotationZ: 0,
    },
    delay,
    animationTimeline.time()
  );
};

const cylinder = (elements, offset = 0) => {
  // Cylinder orientation
  current = 'cylinder';
  elements.forEach((value, index) => {
    const radiusOffset = Math.floor((index + offset) / 60);
    const radius = Math.max(0, width / 4 - (radiusOffset * width) / 30);
    const angle = (((index + offset) % 10) / 10) * 2 * Math.PI;
    const px = radius * Math.cos(angle);
    const pz = radius * Math.sin(angle);
    const py = (Math.floor((index + offset - radiusOffset * 60) / 10) * height) / 6 + height / 12;
    animationTimeline.to(
      value,
      1,
      {
        x: px,
        y: py,
        z: pz,
        rotationX: 0,
        rotationY: 90 - (angle * 180) / Math.PI,
        rotationZ: 0,
        delay: index * delay,
      },
      animationTimeline.time()
    );
  });
};

const sphere = (elements, offset = 0) => {
  // Sphere orientation
  current = 'sphere';
  const radius = Math.min(width / 2.2, height / 2.2);
  elements.forEach((value, index) => {
    const phi = Math.acos(-1 + (2 * (index + offset)) / cardCount);
    const theta = Math.sqrt(cardCount * Math.PI) * phi;
    const px = radius * Math.cos(theta) * Math.sin(phi);
    const py = radius * Math.sin(theta) * Math.sin(phi);
    const pz = radius * Math.cos(phi);
    let rx =
      (180 / Math.PI) *
      Math.acos(
        (px * px + pz * pz) / Math.sqrt(px * px + py * py + pz * pz) / Math.sqrt(px * px + pz * pz)
      );
    if (Math.sign(py) === Math.sign(pz)) {
      rx *= -1;
    }
    const ry = (180 / Math.PI) * Math.atan(px / pz);
    const rz = 0;
    animationTimeline.to(
      value,
      1,
      {
        x: px,
        y: py + height / 2,
        z: pz,
        rotationX: rx,
        rotationY: ry,
        rotationZ: rz,
        delay: index * delay,
      },
      animationTimeline.time()
    );
  });
};

const fan = (elements, offset = 0) => {
  // Fan orientation
  current = 'fan';
  const radius = Math.min(width / 2.2 - cardHeight / 2, height / 2.2 - cardHeight / 2);
  elements.forEach((value, index) => {
    const angle = (-(index + offset) / cardCount) * Math.PI;
    const px = radius * Math.cos(angle);
    const py = radius * Math.sin(angle) + height / 1.5;
    const pz = (index + offset) / 5;
    animationTimeline.to(
      value,
      1,
      {
        x: px,
        y: py,
        z: pz,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 90 + (angle * 180) / Math.PI,
        delay: index * delay,
      },
      animationTimeline.time()
    );
  });
};

const drop = elements => {
  // Drop to floor
  current = 'drop';
  animationTimeline.staggerTo(
    elements,
    1,
    {
      cycle: {
        x(_, element) {
          const transform = element._gsTransform || { x: 0 };
          return transform.x + Math.random() * 50 - 25;
        },
        z(_, element) {
          const transform = element._gsTransform || { z: 0 };
          return transform.z + Math.random() * 50 - 25;
        },
        rotationX(_, element) {
          const transform = element._gsTransform || { rotationX: 0 };
          transform.rotationX += Math.random() - 0.5;
          return transform.rotationX % 90 < 0 ? -90 : 90;
        },
        rotationY(_, element) {
          const transform = element._gsTransform || { rotationY: 0 };
          return transform.rotationY + Math.random() * 120 - 60;
        },
      },
      y: height,
      rotationZ: 0,
      ease: Bounce.easeOut,
    },
    delay / 1.5,
    animationTimeline.time()
  );
};

const randomPosition = elements => {
  // Random orientation
  current = 'random';
  animationTimeline.staggerTo(
    elements,
    1,
    {
      cycle: {
        x: () => (Math.random() - 0.5) * (width - cardHeight * 2),
        y: () => Math.random() * height,
        z: () => (Math.random() - 0.5) * (width - cardHeight * 2),
        rotationX: () => Math.random() * 720 - 360,
        rotationY: () => Math.random() * 720 - 360,
        rotationZ: () => Math.random() * 720 - 360,
      },
    },
    delay,
    animationTimeline.time()
  );
};

const shuffle = array => {
  // Fisher–Yates Shuffle
  let m = array.length;
  let t;
  let i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
};

document.addEventListener('DOMContentLoaded', () => {
  UIkit.use(Icons);

  backgroundTimeline = new TimelineMax();
  backgroundTimeline.to('#animation', 20, {
    rotationY: -360,
    repeat: -1,
    ease: Linear.easeNone,
  }); // Infinite spin

  colorTimeline = new TimelineMax();
  animationTimeline = new TimelineMax();

  for (let i = 0; i < cardCount; i++) {
    document
      .querySelector('#animation')
      .insertAdjacentHTML(
        'beforeend',
        `<div class="card" style="background: hsl(${(i * 360) / cardCount}, 100%, 50%);"></div>`
      );
  }

  resize();
  animationTimeline.set(
    '.card',
    { y: height / 2, rotationZ: 90, opacity: cardOpacity },
    animationTimeline.time()
  );
  delay = 0.02;
  randomPosition(document.querySelectorAll('.card'));
  delay = 5 / cardCount;

  document.querySelector('#cardCountContainer').addEventListener('click', () => {
    // Change opacity
    cardOpacity = cardOpacity === 1 ? 0.5 : 1;
    backgroundTimeline.to('.card', 2, { opacity: cardOpacity }, backgroundTimeline.time());
  });

  document.querySelectorAll('a#add, button#add').forEach(element => {
    element.addEventListener('click', () => {
      // Add 30 cards
      cardCount += 30;
      document.querySelector('#cardCount').innerHTML = cardCount;
      delay = 5 / cardCount;

      const newCards = [];
      for (let i = 0; i < 30; i++) {
        const card = document.createElement('div');
        card.classList.add('card');
        newCards.push(card);
        document.querySelector('#animation').appendChild(card);
      }
      resize();
      animationTimeline.set(
        newCards,
        { y: height / 2, rotationZ: 90, opacity: cardOpacity },
        animationTimeline.time()
      );

      switch (current) {
        case 'pile':
          pile(newCards, cardCount - 30);
          break;
        case 'cylinder':
          cylinder(newCards, cardCount - 30);
          break;
        case 'sphere':
          animationTimeline.clear();
          sphere(document.querySelectorAll('.card:not(.dead)'));
          break;
        case 'fan':
          animationTimeline.clear();
          fan(document.querySelectorAll('.card:not(.dead)'));
          break;
        case 'drop':
          drop(newCards);
          break;
        case 'random':
          randomPosition(newCards);
          break;
      }

      colorTimeline.clear();
      colorTimeline
        .to('.card:not(.dead)', 1, { backgroundColor: 'hsl(0, 100%, 50%)' })
        .staggerTo(
          '.card:not(.dead)',
          1,
          { cycle: { backgroundColor: i => `hsl(${(i * 360) / cardCount}, 100%, 50%)` } },
          0.01
        );

      document.querySelector('button#remove').removeAttribute('disabled');
      document.querySelector('a#remove').parentNode.classList.remove('uk-disabled');
    });
  });

  document.querySelectorAll('a#remove, button#remove').forEach(removeButton =>
    removeButton.addEventListener('click', () => {
      // Remove 30 cards
      if (cardCount > 60) {
        animationTimeline.clear();
        cardCount -= 30;
        delay = 5 / cardCount;

        const killedElements = shuffle(
          Array.from(document.querySelectorAll('.card:not(.dead)'))
        ).slice(0, 30);
        killedElements.forEach(el => el.classList.add('dead'));
        backgroundTimeline.to(
          killedElements,
          0.6,
          { rotationX: 0, rotationY: 0, rotationZ: 0 },
          backgroundTimeline.time()
        );
        backgroundTimeline.to(
          killedElements,
          1,
          {
            y: 0,
            opacity: 0,
            ease: Power1.easeIn,
            onComplete() {
              this.target.forEach(el => el.parentNode.removeChild(el));
              document.querySelector('#cardCount').innerHTML = cardCount;
              colorTimeline.clear();
              colorTimeline.staggerTo(
                '.card:not(.dead)',
                1,
                { cycle: { backgroundColor: i => `hsl(${(i * 360) / cardCount}, 100%, 50%)` } },
                0.01
              );
            },
          },
          backgroundTimeline.time()
        );

        switch (current) {
          case 'pile':
            pile(document.querySelectorAll('.card:not(.dead)'));
            break;
          case 'cylinder':
            cylinder(document.querySelectorAll('.card:not(.dead)'));
            break;
          case 'sphere':
            sphere(document.querySelectorAll('.card:not(.dead)'));
            break;
          case 'fan':
            fan(document.querySelectorAll('.card:not(.dead)'));
            break;
        }

        if (cardCount <= 60) {
          document.querySelector('button#remove').setAttribute('disabled', '');
          document.querySelector('a#remove').parentNode.classList.add('uk-disabled');
        }
      }
    })
  );

  document.querySelectorAll('a#pile, button#pile').forEach(pileButton =>
    pileButton.addEventListener('click', () => {
      // Pile button click
      animationTimeline.clear(); // Stop all animations
      pile(document.querySelectorAll('.card:not(.dead)')); // Position cards
    })
  );

  document.querySelectorAll('a#cylinder, button#cylinder').forEach(cylinderButton =>
    cylinderButton.addEventListener('click', () => {
      // Cylinder button click
      animationTimeline.clear();
      cylinder(document.querySelectorAll('.card:not(.dead)'));
    })
  );

  document.querySelectorAll('a#sphere, button#sphere').forEach(sphereButton =>
    sphereButton.addEventListener('click', () => {
      // Sphere button click
      animationTimeline.clear();
      sphere(document.querySelectorAll('.card:not(.dead)'));
    })
  );

  document.querySelectorAll('a#fan, button#fan').forEach(fanButton =>
    fanButton.addEventListener('click', () => {
      // Fan button click
      animationTimeline.clear();
      fan(document.querySelectorAll('.card:not(.dead)'));
    })
  );

  document.querySelectorAll('a#drop, button#drop').forEach(dropButton =>
    dropButton.addEventListener('click', () => {
      // Drop button click
      if (current !== 'drop') {
        animationTimeline.clear();
        drop(shuffle(Array.from(document.querySelectorAll('.card:not(.dead)'))));
      }
    })
  );

  document.querySelectorAll('a#random, button#random').forEach(randomButton =>
    randomButton.addEventListener('click', () => {
      // Random button click
      animationTimeline.clear();
      randomPosition(shuffle(Array.from(document.querySelectorAll('.card:not(.dead)'))));
    })
  );

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resize();

      animationTimeline.clear();
      switch (current) {
        case 'pile':
          pile(document.querySelectorAll('.card:not(.dead)'));
          break;
        case 'cylinder':
          cylinder(document.querySelectorAll('.card:not(.dead)'));
          break;
        case 'sphere':
          sphere(document.querySelectorAll('.card:not(.dead)'));
          break;
        case 'fan':
          fan(document.querySelectorAll('.card:not(.dead)'));
          break;
      }
    }, 500);
  });
});
