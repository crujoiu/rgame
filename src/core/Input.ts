export class Input {
  private active = false;

  constructor(
    private readonly target: HTMLElement,
    private readonly onJump: () => void,
  ) {}

  enable(): void {
    if (this.active) {
      return;
    }

    window.addEventListener("keydown", this.handleKeyDown, false);
    this.target.addEventListener("pointerdown", this.handlePointerDown, { passive: false });
    this.active = true;
  }

  disable(): void {
    if (!this.active) {
      return;
    }

    window.removeEventListener("keydown", this.handleKeyDown, false);
    this.target.removeEventListener("pointerdown", this.handlePointerDown);
    this.active = false;
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (event.code !== "Space") {
      return;
    }

    event.preventDefault();
    this.onJump();
  };

  private readonly handlePointerDown = (event: PointerEvent): void => {
    event.preventDefault();
    this.onJump();
  };
}
