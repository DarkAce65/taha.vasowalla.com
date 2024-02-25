import type { Animation, Vector2 } from './script';

interface RainParams {
  wind: number;
  gravity: number;
  rainChance: number;
}

class Drop {
  private position: Vector2;
  private velocity: Vector2;

  constructor(x: number, y: number, vx: number, vy: number) {
    this.position = { x, y };
    this.velocity = { x: vx, y: vy };
  }

  updateAndDraw(ctx: CanvasRenderingContext2D, { gravity }: RainParams): boolean {
    this.position.x = this.position.x + this.velocity.x;
    this.position.y = this.position.y + this.velocity.y;
    this.velocity.x *= 0.98;
    this.velocity.y += gravity;

    if (this.position.y > ctx.canvas.height) {
      return false;
    }

    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, 1, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();

    return true;
  }
}

class Raindrop {
  private position: Vector2;
  private velocity: Vector2;

  constructor(x: number, y: number) {
    this.position = { x, y };
    this.velocity = { x: 0, y: -Math.random() * 12 };
  }

  updateAndDraw(ctx: CanvasRenderingContext2D, { wind, gravity }: RainParams): boolean {
    const { width, height } = ctx.canvas;

    const prevPosition = { ...this.position };
    this.position.x = this.position.x + this.velocity.x;
    this.position.y = this.position.y + this.velocity.y;
    this.velocity.x += wind;
    this.velocity.y += gravity;

    if (this.position.y > height) {
      return false;
    }

    if (this.position.x < 0) {
      prevPosition.x += width;
      this.position.x += width;
    } else if (this.position.x > width) {
      prevPosition.x -= width;
      this.position.x -= width;
    }

    ctx.moveTo(prevPosition.x, prevPosition.y);
    ctx.lineTo(this.position.x, this.position.y);

    return true;
  }

  makeDrops(height: number): Drop[] {
    return new Array(Math.round(Math.random() * 4 + 2))
      .fill(undefined)
      .map(
        () =>
          new Drop(
            this.position.x,
            height,
            this.velocity.x / 10 + (Math.random() * 6 - 3),
            -Math.random() * 5,
          ),
      );
  }
}

class Rain implements Animation {
  private raindrops: Raindrop[];
  private drops: Drop[];

  constructor(
    public wind = 0.015,
    public gravity = 0.2,
    public rainChance = 0.3,
  ) {
    this.raindrops = [];
    this.drops = [];
  }

  render(ctx: CanvasRenderingContext2D): void {
    const { width, height } = ctx.canvas;
    const rainParams: RainParams = {
      wind: this.wind,
      gravity: this.gravity,
      rainChance: this.rainChance,
    };

    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = 'rgb(60, 135, 235)';
    ctx.fillStyle = 'rgb(60, 135, 235)';
    ctx.lineWidth = 2;

    ctx.beginPath();
    for (let i = 0; i < this.raindrops.length; i++) {
      const raindrop = this.raindrops[i];
      const stillAlive = raindrop.updateAndDraw(ctx, rainParams);

      if (!stillAlive) {
        this.drops.push(...raindrop.makeDrops(height));
        this.raindrops.splice(i, 1);
        i--;
      }
    }
    ctx.stroke();

    for (let i = 0; i < this.drops.length; i++) {
      const drop = this.drops[i];
      const stillAlive = drop.updateAndDraw(ctx, rainParams);

      if (!stillAlive) {
        this.drops.splice(i, 1);
        i--;
      }
    }

    if (Math.random() < this.rainChance) {
      this.raindrops.push(new Raindrop(Math.random() * width, 0));
    }
  }
}

export default Rain;
