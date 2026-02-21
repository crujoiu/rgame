import { SpriteSheet } from "./SpriteSheet";

export class Animation {
  private readonly animationSequence: number[];
  private currentFrame = 0;
  private counter = 0;

  constructor(
    private readonly character: SpriteSheet,
    private readonly frameSpeed: number,
    startFrame: number,
    endFrame: number,
  ) {
    this.animationSequence = [];
    for (let frameNumber = startFrame; frameNumber <= endFrame; frameNumber += 1) {
      this.animationSequence.push(frameNumber);
    }
  }

  update(): void {
    if (this.counter === this.frameSpeed - 1) {
      this.currentFrame = (this.currentFrame + 1) % this.animationSequence.length;
    }
    this.counter = (this.counter + 1) % this.frameSpeed;
  }

  draw(ctx: CanvasRenderingContext2D, posX: number, posY: number): void {
    const spriteFrame = this.animationSequence[this.currentFrame];
    const row = Math.floor(spriteFrame / this.character.frames);
    const col = Math.floor(spriteFrame % this.character.frames);
    ctx.drawImage(
      this.character.image,
      col * this.character.frameW,
      row * this.character.frameH,
      this.character.frameW,
      this.character.frameH,
      posX,
      posY,
      this.character.frameW,
      this.character.frameH,
    );
  }
}
