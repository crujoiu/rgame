import "./style.css";
import { Game } from "./core/Game";
import { Renderer } from "./core/Renderer";
import { GAME_CONFIG } from "./core/State";
import { AdManager } from "./core/AdManager";

const renderer = new Renderer("canvas", GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);

const bootstrap = (): void => {
  const adManager = new AdManager();
  adManager.initialize();
  new Game(renderer, adManager);
};

void bootstrap();
