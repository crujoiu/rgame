export class Input {
  private static readonly DOUBLE_TAP_WINDOW_MS = 260;

  private active = false;
  private lastTapAt = 0;
  private lastSpaceAt = 0;

  constructor(
    private readonly target: HTMLElement,
    private readonly onJump: (doubleTap: boolean) => void,
  ) {}

  enable(): void {
    if (this.active) {
      return;
    }

    this.lastTapAt = 0;
    this.lastSpaceAt = 0;
    window.addEventListener("keydown", this.handleKeyDown, false);
    this.target.addEventListener("pointerdown", this.handlePointerDown, { passive: false });
    this.target.addEventListener("touchstart", this.handleTouchStart, { passive: false });
    this.target.addEventListener("mousedown", this.handleMouseDown, false);
    this.active = true;
  }

  disable(): void {
    if (!this.active) {
      return;
    }

    window.removeEventListener("keydown", this.handleKeyDown, false);
    this.target.removeEventListener("pointerdown", this.handlePointerDown);
    this.target.removeEventListener("touchstart", this.handleTouchStart);
    this.target.removeEventListener("mousedown", this.handleMouseDown);
    this.lastTapAt = 0;
    this.lastSpaceAt = 0;
    this.active = false;
  }

  private readonly handleKeyDown = (event: KeyboardEvent): void => {
    if (event.code !== "Space") {
      return;
    }

    event.preventDefault();
    if (event.repeat) {
      return;
    }

    const now = performance.now();
    const isDoubleSpace = now - this.lastSpaceAt <= Input.DOUBLE_TAP_WINDOW_MS;
    this.lastSpaceAt = now;
    this.onJump(isDoubleSpace);
  };

  private readonly handlePointerDown = (event: PointerEvent): void => {
    event.preventDefault();
    this.triggerTapJump();
  };

  private readonly handleTouchStart = (event: TouchEvent): void => {
    event.preventDefault();
    this.triggerTapJump();
  };

  private readonly handleMouseDown = (event: MouseEvent): void => {
    event.preventDefault();
    this.triggerTapJump();
  };

  private triggerTapJump(): void {
    const now = performance.now();
    const isDoubleTap = now - this.lastTapAt <= Input.DOUBLE_TAP_WINDOW_MS;
    this.lastTapAt = now;
    this.onJump(isDoubleTap);
  }
}
