export class SpriteSheet {
  readonly frameW: number;
  readonly frameH: number;
  readonly image: HTMLImageElement;
  readonly frames: number;

  constructor(path: string, frameW: number, frameH: number, frames = 10) {
    this.frameW = frameW;
    this.frameH = frameH;
    this.frames = frames;
    this.image = new Image();
    this.image.src = path;
  }
}
