export class Input {
  private static readonly DOUBLE_TAP_WINDOW_MS = 320;

  private active = false;
  private lastJumpInputAt = 0;

  constructor(
    private readonly target: HTMLElement,
    private readonly onJump: (doubleTap: boolean) => void,
  ) {}

  enable(): void {
    if (this.active) {
      return;
    }

    this.lastJumpInputAt = 0;
    window.addEventListener("keydown", this.handleKeyDown, false);
    if (window.PointerEvent) {
      this.target.addEventListener("pointerdown", this.handlePointerDown, { passive: false });
    } else {
      this.target.addEventListener("touchstart", this.handleTouchStart, { passive: false });
      this.target.addEventListener("mousedown", this.handleMouseDown, false);
    }
    this.active = true;
  }

  disable(): void {
    if (!this.active) {
      return;
    }

    window.removeEventListener("keydown", this.handleKeyDown, false);
    if (window.PointerEvent) {
      this.target.removeEventListener("pointerdown", this.handlePointerDown);
    } else {
      this.target.removeEventListener("touchstart", this.handleTouchStart);
      this.target.removeEventListener("mousedown", this.handleMouseDown);
    }
    this.lastJumpInputAt = 0;
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

    this.triggerJumpFromInput();
  };

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (!event.isPrimary) {
      return;
    }
    event.preventDefault();
    this.triggerJumpFromInput();
  };

  private readonly handleTouchStart = (event: TouchEvent): void => {
    event.preventDefault();
    this.triggerJumpFromInput();
  };

  private readonly handleMouseDown = (event: MouseEvent): void => {
    event.preventDefault();
    this.triggerJumpFromInput();
  };

  private triggerJumpFromInput(): void {
    const now = performance.now();
    const isDoubleInput = now - this.lastJumpInputAt <= Input.DOUBLE_TAP_WINDOW_MS;
    this.lastJumpInputAt = now;
    this.onJump(isDoubleInput);
  }
}
