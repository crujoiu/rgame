export type ObstacleOptions = {
  path: string;
  x: number;
  y: number;
  w: number;
  h: number;
  scaleFactor?: number;
  speed?: number;
  drawAsGround?: boolean;
  hitboxInset?: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
};

export type Hitbox = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export class Obstacle {
  x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  speed: number;
  readonly scaleFactor: number;
  hasPassed = false;
  private readonly image: HTMLImageElement;
  private readonly drawAsGround: boolean;
  private readonly hitboxInset: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };

  constructor(options: ObstacleOptions) {
    this.x = options.x;
    this.y = options.y;
    this.w = options.w;
    this.h = options.h;
    this.scaleFactor = options.scaleFactor ?? 1;
    this.speed = options.speed ?? 5;
    this.drawAsGround = options.drawAsGround ?? false;
    this.hitboxInset = options.hitboxInset ?? {
      left: 0.14,
      right: 0.14,
      top: 0.12,
      bottom: 0.04,
    };

    this.image = new Image();
    this.image.src = options.path;
  }

  get scaledW(): number {
    return this.w / this.scaleFactor;
  }

  get scaledH(): number {
    return this.h / this.scaleFactor;
  }

  get newYPoz(): number {
    return this.y - this.scaledH;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (this.drawAsGround) {
      ctx.drawImage(this.image, 0, 0, this.w, this.h, this.x, this.y, this.w, this.h);
      return;
    }

    ctx.drawImage(
      this.image,
      0,
      0,
      this.w,
      this.h,
      this.x,
      this.newYPoz,
      this.scaledW,
      this.scaledH,
    );
  }

  move(): void {
    this.x -= this.speed;
  }

  getHitbox(): Hitbox {
    const insetLeft = this.scaledW * this.hitboxInset.left;
    const insetRight = this.scaledW * this.hitboxInset.right;
    const insetTop = this.scaledH * this.hitboxInset.top;
    const insetBottom = this.scaledH * this.hitboxInset.bottom;

    return {
      left: this.x + insetLeft,
      top: this.newYPoz + insetTop,
      right: this.x + this.scaledW - insetRight,
      bottom: this.newYPoz + this.scaledH - insetBottom,
    };
  }
}
