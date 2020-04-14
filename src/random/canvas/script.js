import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';

import gsap from 'gsap';
import Draggable from 'gsap/Draggable';

import requestAnimationFrame from '../../lib/requestAnimationFrame';

gsap.registerPlugin(Draggable);

let bubblesCanvas;
let bubblesCtx;
let rainCanvas;
let rainCtx;

let animateBubbles = false;
const bubbles = [];

let animateRain = false;
const raindrops = [];
const drops = [];
const wind = 0.015;
const gravity = 0.2;
let rain_chance = 0.3;

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  clone() {
    return new Vector(this.x, this.y);
  }
}

class Bubble {
  constructor(x, y) {
    this.radius = Math.random() * 14 + 6;
    this.position = new Vector(x, y + this.radius);
    this.velocity = new Vector(0, -Math.random() / 2);
    this.opacity = Math.random() * 0.7 + 0.1;
  }

  update() {
    this.position.y = this.position.y + this.velocity.y;
    this.opacity = this.opacity - 0.0005;
  }

  draw(context) {
    context.beginPath();
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
    context.closePath();
    context.fillStyle = `rgba(185, 211, 238,${this.opacity})`;
    context.fill();
  }
}

const updateBubbles = () => {
  if (animateBubbles) {
    bubblesCtx.clearRect(0, 0, bubblesCanvas.width, bubblesCanvas.height);
    for (let i = 0; i < bubbles.length; i++) {
      if (bubbles[i].position.y + bubbles[i].radius < 0 || bubbles[i].opacity < 0.01) {
        bubbles[i] = new Bubble(
          Math.random() * bubblesCanvas.width,
          Math.random() * 150 + 10 + bubblesCanvas.height
        );
      } else {
        bubbles[i].update();
      }
      bubbles[i].draw(bubblesCtx);
    }
    requestAnimationFrame(updateBubbles);
  }
};

class Raindrop {
  constructor() {
    this.position = new Vector(Math.random() * rainCanvas.width, 0);
    this.prev = this.position;
    this.velocity = new Vector(0, -Math.random() * 12);
    this.drops = Math.round(Math.random() * 4 + 2);
  }

  update() {
    this.prev = this.position.clone();
    this.velocity.y += gravity;
    this.velocity.x += wind;
    this.position.x = this.position.x + this.velocity.x;
    this.position.y = this.position.y + this.velocity.y;
  }
}

class Drop {
  constructor(x, y) {
    const dist = Math.random() * 5;
    const angle = Math.PI + Math.random() * Math.PI;
    this.position = new Vector(x, y);
    this.velocity = new Vector(Math.cos(angle) * dist, Math.sin(angle) * dist);
  }

  update() {
    this.velocity.y += gravity;
    this.velocity.x *= 0.95;
    this.position.x = this.position.x + this.velocity.x;
    this.position.y = this.position.y + this.velocity.y;
  }
}

const updateRain = () => {
  if (animateRain) {
    rainCtx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
    rainCtx.strokeStyle = 'rgb(60, 135, 235)';
    rainCtx.lineWidth = 2;
    rainCtx.beginPath();
    for (let i = 0; i < raindrops.length; i++) {
      const rain = raindrops[i];
      rain.update();
      rainCtx.moveTo(rain.prev.x, rain.prev.y);
      rainCtx.lineTo(rain.position.x, rain.position.y);
      if (rain.position.x < 0) {
        rain.prev.x += rainCanvas.width;
        rain.position.x += rainCanvas.width;
      } else if (rain.position.x > rainCanvas.width) {
        rain.prev.x -= rainCanvas.width;
        rain.position.x -= rainCanvas.width;
      }
      if (rain.position.y > rainCanvas.height) {
        let n = rain.drops;
        while (n--) {
          drops.push(new Drop(rain.position.x, rainCanvas.height));
        }
        raindrops.splice(i, 1);
        i--;
      }
    }
    rainCtx.fillStyle = 'rgb(60, 135, 235)';
    rainCtx.stroke();
    for (let i = 0; i < drops.length; i++) {
      const drop = drops[i];
      drop.update();
      rainCtx.beginPath();
      rainCtx.arc(drop.position.x, drop.position.y, 1, 0, Math.PI * 2, false);
      rainCtx.closePath();
      rainCtx.fill();
      if (drop.position.y > rainCanvas.height) {
        drops.splice(i, 1);
        i--;
      }
    }
    if (Math.random() < rain_chance) {
      raindrops.push(new Raindrop());
    }
    requestAnimationFrame(updateRain);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  UIkit.use(Icons);

  gsap.set('#rainDial', { transformOrigin: '50% 50%' });
  Draggable.create('#rainDial', {
    type: 'rotation',
    bounds: { minRotation: -135, maxRotation: 135 },
    onDrag() {
      rain_chance = (this.rotation + 135) / 270;
    },
  });
  gsap.set('#rainDial', { rotation: -81 });

  rainCanvas = document.querySelector('#rain');
  rainCtx = rainCanvas.getContext('2d');
  rainCanvas.height = rainCanvas.offsetHeight;
  rainCanvas.width = rainCanvas.offsetWidth;

  bubblesCanvas = document.querySelector('#bubbles');
  bubblesCtx = bubblesCanvas.getContext('2d');
  bubblesCanvas.height = bubblesCanvas.offsetHeight;
  bubblesCanvas.width = bubblesCanvas.offsetWidth;
  for (let i = 0; i < bubblesCanvas.width / 3; i++) {
    bubbles[i] = new Bubble(
      Math.random() * bubblesCanvas.width,
      Math.random() * 190 + 10 + bubblesCanvas.height
    );
  }

  document.querySelector('#rainToggle').addEventListener('click', function () {
    animateRain = !animateRain;

    if (animateRain) {
      this.classList.add('uk-active');
    } else {
      this.classList.remove('uk-active');
    }
    updateRain();
  });

  document.querySelector('#bubbleToggle').addEventListener('click', function () {
    animateBubbles = !animateBubbles;

    if (animateBubbles) {
      this.classList.add('uk-active');
    } else {
      this.classList.remove('uk-active');
    }
    updateBubbles();
  });

  window.addEventListener('resize', () => {
    rainCanvas.height = rainCanvas.offsetHeight;
    rainCanvas.width = rainCanvas.offsetWidth;
    bubblesCanvas.height = bubblesCanvas.offsetHeight;
    bubblesCanvas.width = bubblesCanvas.offsetWidth;
  });
});
