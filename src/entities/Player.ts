import { Animation } from "./Animation";
import { Obstacle } from "./Obstacle";
import { SpriteSheet } from "./SpriteSheet";

const JUMP_VELOCITY = -12.2;
const DOUBLE_TAP_BOOST_VELOCITY = -14.8;
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
  private canUseDoubleTapBoost = false;
  private static readonly HITBOX_INSET_LEFT_RATIO = 0.28;
  private static readonly HITBOX_INSET_RIGHT_RATIO = 0.24;
  private static readonly HITBOX_INSET_TOP_RATIO = 0.16;
  private static readonly HITBOX_INSET_BOTTOM_RATIO = 0.08;

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
    this.canUseDoubleTapBoost = false;
    this.anim = this.runAnim;
  }

  jump(doubleTap = false): void {
    if (this.onGround) {
      this.velocityY = JUMP_VELOCITY;
      this.onGround = false;
      this.canUseDoubleTapBoost = true;
      this.anim = this.jumpAnim;
      return;
    }

    if (!doubleTap || !this.canUseDoubleTapBoost) {
      return;
    }

    this.velocityY = DOUBLE_TAP_BOOST_VELOCITY;
    this.canUseDoubleTapBoost = false;
    this.anim = this.jumpAnim;
  }

  update(timeScale: number): void {
    if (!this.onGround) {
      this.velocityY = Math.min(this.velocityY + GRAVITY * timeScale, MAX_FALL_SPEED);
      this.posY += this.velocityY * timeScale;

      if (this.velocityY > 0) {
        this.anim = this.landAnim;
      }

      if (this.posY >= this.groundY) {
        this.posY = this.groundY;
        this.velocityY = 0;
        this.onGround = true;
        this.canUseDoubleTapBoost = false;
        this.anim = this.runAnim;
      }
    }
  }

  crashed(obstacle: Obstacle): boolean {
    const insetLeft = this.width * Player.HITBOX_INSET_LEFT_RATIO;
    const insetRight = this.width * Player.HITBOX_INSET_RIGHT_RATIO;
    const insetTop = this.height * Player.HITBOX_INSET_TOP_RATIO;
    const insetBottom = this.height * Player.HITBOX_INSET_BOTTOM_RATIO;

    const left = this.posX + insetLeft;
    const top = this.posY + insetTop;
    const right = this.posX + this.width - insetRight;
    const bottom = this.posY + this.height - insetBottom;
    return obstacle.collidesWithRect(left, top, right, bottom);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.anim.draw(ctx, this.posX, this.posY);
    this.anim.update();
  }
}
