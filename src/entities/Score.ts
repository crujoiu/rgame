import { Obstacle } from "./Obstacle";

const HIGHSCORE_STORAGE_KEY = "rgame.highscore";

export class Score {
  private value = 0;
  private thresholdScore = 10;
  private highScore = 0;

  constructor(private readonly x: number, private readonly y: number) {
    this.highScore = this.loadHighScore();
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.font = "800 18px \"Baloo 2\", \"Trebuchet MS\", sans-serif";
    ctx.strokeStyle = "rgba(8, 40, 78, 0.95)";
    ctx.lineWidth = 5;
    ctx.fillStyle = "#fffdf0";
    ctx.strokeText(`BEST: ${this.highScore}`, this.x - 140, this.y);
    ctx.fillText(`BEST: ${this.highScore}`, this.x - 140, this.y);
    ctx.strokeText(`SCORE: ${this.value}`, this.x + 4, this.y);
    ctx.fillText(`SCORE: ${this.value}`, this.x + 4, this.y);
  }

  update(obstacles: Obstacle[], playerX: number): void {
    for (const obstacle of obstacles) {
      if (playerX > obstacle.x + obstacle.scaledW && !obstacle.hasPassed) {
        this.value += 1;
        obstacle.hasPassed = true;
        this.persistHighScoreIfNeeded();
      }
    }
  }

  reset(): void {
    this.value = 0;
    this.thresholdScore = 10;
  }

  getValue(): number {
    return this.value;
  }

  getHighScore(): number {
    return this.highScore;
  }

  consumeDifficultyIncrease(step: number): boolean {
    if (this.value < this.thresholdScore) {
      return false;
    }

    this.thresholdScore += step;
    return true;
  }

  private persistHighScoreIfNeeded(): void {
    if (this.value <= this.highScore) {
      return;
    }

    this.highScore = this.value;
    try {
      window.localStorage.setItem(HIGHSCORE_STORAGE_KEY, String(this.highScore));
    } catch {
      // Keep in-memory high score when storage is unavailable.
    }
  }

  private loadHighScore(): number {
    try {
      const stored = window.localStorage.getItem(HIGHSCORE_STORAGE_KEY);
      if (!stored) {
        return 0;
      }

      const parsed = Number.parseInt(stored, 10);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    } catch {
      return 0;
    }
  }
}
