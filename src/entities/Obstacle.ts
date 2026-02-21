import { getCachedImage } from "../core/AssetCache";

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
  readonly scaledW: number;
  readonly scaledH: number;
  readonly newYPoz: number;
  hasPassed = false;
  private readonly image: HTMLImageElement;
  private readonly drawAsGround: boolean;
  private readonly hitboxOffsetLeft: number;
  private readonly hitboxOffsetRight: number;
  private readonly hitboxOffsetTop: number;
  private readonly hitboxOffsetBottom: number;

  constructor(options: ObstacleOptions) {
    this.x = options.x;
    this.y = options.y;
    this.w = options.w;
    this.h = options.h;
    this.scaleFactor = options.scaleFactor ?? 1;
    this.scaledW = this.w / this.scaleFactor;
    this.scaledH = this.h / this.scaleFactor;
    this.newYPoz = this.y - this.scaledH;
    this.speed = options.speed ?? 5;
    this.drawAsGround = options.drawAsGround ?? false;
    const hitboxInset = options.hitboxInset ?? {
      left: 0.14,
      right: 0.14,
      top: 0.12,
      bottom: 0.04,
    };
    this.hitboxOffsetLeft = this.scaledW * hitboxInset.left;
    this.hitboxOffsetRight = this.scaledW * hitboxInset.right;
    this.hitboxOffsetTop = this.scaledH * hitboxInset.top;
    this.hitboxOffsetBottom = this.scaledH * hitboxInset.bottom;

    this.image = getCachedImage(options.path);
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
    return {
      left: this.x + this.hitboxOffsetLeft,
      top: this.newYPoz + this.hitboxOffsetTop,
      right: this.x + this.scaledW - this.hitboxOffsetRight,
      bottom: this.newYPoz + this.scaledH - this.hitboxOffsetBottom,
    };
  }

  collidesWithRect(left: number, top: number, right: number, bottom: number): boolean {
    const obstacleLeft = this.x + this.hitboxOffsetLeft;
    const obstacleTop = this.newYPoz + this.hitboxOffsetTop;
    const obstacleRight = this.x + this.scaledW - this.hitboxOffsetRight;
    const obstacleBottom = this.newYPoz + this.scaledH - this.hitboxOffsetBottom;

    return !(
      right <= obstacleLeft ||
      left >= obstacleRight ||
      bottom <= obstacleTop ||
      top >= obstacleBottom
    );
  }
}
