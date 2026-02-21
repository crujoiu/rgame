export class Renderer {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;

  constructor(canvasId: string, width: number, height: number) {
    const canvas = document.getElementById(canvasId);
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error(`Canvas with id ${canvasId} was not found.`);
    }

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("2D rendering context is not available.");
    }

    canvas.width = width;
    canvas.height = height;

    this.canvas = canvas;
    this.ctx = context;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
