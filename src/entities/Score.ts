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
    ctx.font = "bold 14px sans-serif";
    ctx.fillStyle = "black";
    ctx.fillText(`HI: ${this.highScore}`, this.x - 110, this.y);
    ctx.fillText(`SCORE: ${this.value}`, this.x, this.y);
  }

  update(obstacles: Obstacle[], playerX: number): void {
    for (const obstacle of obstacles) {
      const distancePlayerObstacle = playerX - Math.floor(obstacle.x + obstacle.scaledW);
      if (distancePlayerObstacle > 0 && !obstacle.hasPassed) {
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
