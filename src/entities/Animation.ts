import { SpriteSheet } from "./SpriteSheet";

export class Animation {
  private readonly frameCoords: Array<{ row: number; col: number }>;
  private currentFrame = 0;
  private counter = 0;

  constructor(
    private readonly character: SpriteSheet,
    private readonly frameSpeed: number,
    startFrame: number,
    endFrame: number,
  ) {
    this.frameCoords = [];
    for (let frameNumber = startFrame; frameNumber <= endFrame; frameNumber += 1) {
      this.frameCoords.push({
        row: Math.floor(frameNumber / this.character.frames),
        col: frameNumber % this.character.frames,
      });
    }
  }

  update(): void {
    if (this.counter === this.frameSpeed - 1) {
      this.currentFrame = (this.currentFrame + 1) % this.frameCoords.length;
    }
    this.counter = (this.counter + 1) % this.frameSpeed;
  }

  draw(ctx: CanvasRenderingContext2D, posX: number, posY: number): void {
    const frame = this.frameCoords[this.currentFrame];
    ctx.drawImage(
      this.character.image,
      frame.col * this.character.frameW,
      frame.row * this.character.frameH,
      this.character.frameW,
      this.character.frameH,
      posX,
      posY,
      this.character.frameW,
      this.character.frameH,
    );
  }
}
