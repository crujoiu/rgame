export class Background {
  private x: number;
  private readonly y: number;
  private readonly speed: number;
  private readonly image: HTMLImageElement;

  constructor(path: string, x: number, y: number, speed: number) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.image = new Image();
    this.image.src = path;
  }

  reset(): void {
    this.x = 0;
  }

  update(): void {
    this.x -= this.speed;
    if (this.x + this.image.width < 0) {
      this.x = 0;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.drawImage(this.image, this.x, this.y);
    ctx.drawImage(this.image, this.x + this.image.width, this.y);
  }
}
