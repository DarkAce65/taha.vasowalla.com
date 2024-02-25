import type { Animation, Vector2 } from './script';

class Bubble {
  private radius: number;
  private position: Vector2;
  private velocity: Vector2;
  private opacity: number;

  constructor(x: number, y: number) {
    this.radius = Math.random() * 14 + 6;
    this.position = { x, y: y + this.radius };
    this.velocity = { x: 0, y: -Math.random() / 2 };
    this.opacity = Math.random() * 0.7 + 0.1;
  }

  updateAndDraw(ctx: CanvasRenderingContext2D): boolean {
    this.position.y = this.position.y + this.velocity.y;
    this.opacity = this.opacity - 0.0005;

    if (
      this.position.y + this.radius < 0 ||
      this.position.y - this.radius > ctx.canvas.height ||
      this.position.x > ctx.canvas.width ||
      this.opacity < 0.01
    ) {
      return false;
    }

    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fillStyle = `rgba(185, 211, 238,${this.opacity})`;
    ctx.fill();

    return true;
  }
}

class Bubbles implements Animation {
  private bubbles: Bubble[];

  constructor() {
    this.bubbles = [];
  }

  render(ctx: CanvasRenderingContext2D): void {
    const { width, height } = ctx.canvas;

    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < Math.max(this.bubbles.length, width / 3); i++) {
      if (i >= this.bubbles.length) {
        this.bubbles.push(new Bubble(Math.random() * width, height));
      }

      const bubble = this.bubbles[i];
      const stillAlive = bubble.updateAndDraw(ctx);

      if (!stillAlive) {
        this.bubbles.splice(i, 1);
        i--;
      }
    }
  }
}

export default Bubbles;
