import { Animation } from "./Animation";
import { Hitbox, Obstacle } from "./Obstacle";
import { SpriteSheet } from "./SpriteSheet";

const JUMP_VELOCITY = -12.2;
const GRAVITY = 0.58;
const MAX_FALL_SPEED = 13;

export class Player {
  posX: number;
  posY: number;
  readonly width = 45;
  readonly height = 56;

  private readonly runAnim: Animation;
  private readonly jumpAnim: Animation;
  private readonly landAnim: Animation;
  private anim: Animation;
  private velocityY = 0;
  private onGround = true;

  constructor(posX: number, posY: number, private readonly groundY: number) {
    this.posX = posX;
    this.posY = posY;

    const character = new SpriteSheet("/assets/player.png", this.width, this.height);
    this.runAnim = new Animation(character, 4, 0, 8);
    this.jumpAnim = new Animation(character, 4, 9, 9);
    this.landAnim = new Animation(character, 4, 8, 8);
    this.anim = this.runAnim;
  }

  reset(): void {
    this.posY = this.groundY;
    this.velocityY = 0;
    this.onGround = true;
    this.anim = this.runAnim;
  }

  jump(): void {
    if (!this.onGround) {
      return;
    }

    this.velocityY = JUMP_VELOCITY;
    this.onGround = false;
    this.anim = this.jumpAnim;
  }

  update(): void {
    if (!this.onGround) {
      this.velocityY = Math.min(this.velocityY + GRAVITY, MAX_FALL_SPEED);
      this.posY += this.velocityY;

      if (this.velocityY > 0) {
        this.anim = this.landAnim;
      }

      if (this.posY >= this.groundY) {
        this.posY = this.groundY;
        this.velocityY = 0;
        this.onGround = true;
        this.anim = this.runAnim;
      }
    }
  }

  crashed(obstacle: Obstacle): boolean {
    const playerHitbox = this.getHitbox();
    const obstacleHitbox = obstacle.getHitbox();
    return this.intersects(playerHitbox, obstacleHitbox);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.anim.draw(ctx, this.posX, this.posY);
    this.anim.update();
  }

  private getHitbox(): Hitbox {
    // Use a torso-centric hitbox to avoid punishing collisions on thin limbs.
    const insetLeft = this.width * 0.28;
    const insetRight = this.width * 0.24;
    const insetTop = this.height * 0.16;
    const insetBottom = this.height * 0.08;

    return {
      left: this.posX + insetLeft,
      top: this.posY + insetTop,
      right: this.posX + this.width - insetRight,
      bottom: this.posY + this.height - insetBottom,
    };
  }

  private intersects(a: Hitbox, b: Hitbox): boolean {
    return !(
      a.right <= b.left ||
      a.left >= b.right ||
      a.bottom <= b.top ||
      a.top >= b.bottom
    );
  }
}
