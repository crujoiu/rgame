import { Background } from "../entities/Background";
import { Obstacle } from "../entities/Obstacle";
import { Player } from "../entities/Player";
import { Score } from "../entities/Score";
import { GAME_CONFIG, OBSTACLE_TEMPLATES, ObstacleTemplate } from "./State";
import { Input } from "./Input";
import { Renderer } from "./Renderer";

type GameElements = {
  cover: HTMLElement;
  title: HTMLElement;
  over: HTMLElement;
  warning: HTMLElement;
  startButton: HTMLButtonElement;
  restartButton: HTMLButtonElement;
};

export class Game {
  private readonly background: Background;
  private readonly ground: Obstacle;
  private readonly player: Player;
  private readonly score: Score;
  private readonly input: Input;
  private readonly elements: GameElements;

  private animationFrameId = 0;
  private running = false;
  private frame = 0;
  private obstacles: Obstacle[] = [];
  private obstacleTemplates: ObstacleTemplate[] = [];
  private nextObstacleDistance: number = GAME_CONFIG.obstacleMinDist;

  constructor(private readonly renderer: Renderer) {
    this.background = new Background("/assets/layer2.png", 0, 0, GAME_CONFIG.backgroundSpeed);
    this.ground = new Obstacle({
      path: "/assets/base.png",
      x: 0,
      y: 360,
      w: 800,
      h: 100,
      drawAsGround: true,
      speed: 0,
    });
    this.player = new Player(
      GAME_CONFIG.playerStartX,
      GAME_CONFIG.playerStartY,
      GAME_CONFIG.playerStartY,
    );
    this.score = new Score(670, 35);
    this.input = new Input(this.renderer.canvas, () => this.player.jump());

    this.elements = {
      cover: this.getElement("cover"),
      title: this.getElement("title"),
      over: this.getElement("over"),
      warning: this.getElement("warning"),
      startButton: this.getButton("start"),
      restartButton: this.getButton("restart"),
    };

    this.bindUi();
  }

  private bindUi(): void {
    this.bindPress(this.elements.startButton, () => this.start());
    this.bindPress(this.elements.restartButton, () => this.start());
  }

  start(): void {
    if (this.running) {
      return;
    }

    this.resetRound();
    this.input.enable();
    this.running = true;
    this.loop();
  }

  private resetRound(): void {
    this.frame = 0;
    this.obstacles = [];
    this.obstacleTemplates = OBSTACLE_TEMPLATES.map((template) => ({ ...template }));
    this.nextObstacleDistance = this.randomInt(
      GAME_CONFIG.obstacleMinDist,
      GAME_CONFIG.obstacleMaxDist,
    );

    this.background.reset();
    this.player.reset();
    this.score.reset();
    this.spawnRandomObstacle();

    this.hideElement(this.elements.cover);
    this.hideElement(this.elements.over);
    this.hideElement(this.elements.title);
    this.hideElement(this.elements.warning);
    this.hideElement(this.elements.startButton);
    this.hideElement(this.elements.restartButton);
  }

  private stop(): void {
    this.running = false;
    this.input.disable();

    if (this.animationFrameId) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }

    this.showElement(this.elements.cover);
    this.showElement(this.elements.over);
    this.showElement(this.elements.restartButton);
    this.hideElement(this.elements.warning);
  }

  private loop = (): void => {
    if (!this.running) {
      return;
    }

    this.update();
    this.render();
    this.animationFrameId = window.requestAnimationFrame(this.loop);
  };

  private update(): void {
    this.frame += 1;
    this.background.update();
    this.player.update();

    this.manageObstacles();
    for (const obstacle of this.obstacles) {
      obstacle.move();
    }

    this.score.update(this.obstacles, this.player.posX);
    if (this.score.consumeDifficultyIncrease(GAME_CONFIG.thresholdStep)) {
      for (const template of this.obstacleTemplates) {
        template.speed = Math.min(
          template.speed + GAME_CONFIG.obstacleSpeedStep,
          GAME_CONFIG.obstacleMaxSpeed,
        );
      }
    }

    for (const obstacle of this.obstacles) {
      if (this.player.crashed(obstacle)) {
        this.stop();
        return;
      }
    }

    if (this.frame > 0 && this.frame < GAME_CONFIG.warningFrames) {
      this.showElement(this.elements.warning);
    } else {
      this.hideElement(this.elements.warning);
    }
  }

  private render(): void {
    this.renderer.clear();

    this.background.draw(this.renderer.ctx);
    this.score.draw(this.renderer.ctx);
    this.player.draw(this.renderer.ctx);

    for (const obstacle of this.obstacles) {
      obstacle.draw(this.renderer.ctx);
    }

    this.ground.draw(this.renderer.ctx);
  }

  private manageObstacles(): void {
    if (this.obstacles.length === 0) {
      this.spawnRandomObstacle();
      return;
    }

    const lastObstacle = this.obstacles[this.obstacles.length - 1];
    if (lastObstacle.x < this.nextObstacleDistance) {
      this.spawnRandomObstacle();
    }

    const firstObstacle = this.obstacles[0];
    if (firstObstacle && firstObstacle.x < GAME_CONFIG.obstacleCleanupX) {
      this.obstacles.shift();
    }
  }

  private spawnRandomObstacle(): void {
    const obstacleIndex = Math.floor(Math.random() * this.obstacleTemplates.length);
    const template = this.obstacleTemplates[obstacleIndex];

    this.obstacles.push(
      new Obstacle({
        path: template.path,
        x: GAME_CONFIG.obstacleStartX,
        y: template.y,
        w: template.w,
        h: template.h,
        scaleFactor: template.scaleFactor,
        speed: template.speed,
        hitboxInset: template.hitboxInset,
      }),
    );

    this.nextObstacleDistance = this.randomInt(
      GAME_CONFIG.obstacleMinDist,
      GAME_CONFIG.obstacleMaxDist,
    );
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private getElement(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`Element with id ${id} was not found.`);
    }
    return element;
  }

  private getButton(id: string): HTMLButtonElement {
    const element = this.getElement(id);
    if (!(element instanceof HTMLButtonElement)) {
      throw new Error(`Element with id ${id} is not a button.`);
    }
    return element;
  }

  private showElement(element: HTMLElement): void {
    element.classList.add("is-visible");
  }

  private hideElement(element: HTMLElement): void {
    element.classList.remove("is-visible");
  }

  private bindPress(button: HTMLButtonElement, handler: () => void): void {
    button.addEventListener("click", handler, false);
    button.addEventListener("pointerup", handler, false);
    button.addEventListener(
      "touchend",
      (event: TouchEvent) => {
        event.preventDefault();
        handler();
      },
      { passive: false },
    );
  }
}
