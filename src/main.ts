import "./style.css";
import { Game } from "./core/Game";
import { Renderer } from "./core/Renderer";
import { GAME_CONFIG } from "./core/State";
import { AdManager } from "./core/AdManager";
import { ConsentManager } from "./core/ConsentManager";

const renderer = new Renderer("canvas", GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);

const bootstrap = async (): Promise<void> => {
  const consentManager = new ConsentManager();
  const consent = await consentManager.ensureConsent();
  const adManager = new AdManager(consent);
  adManager.initialize();
  new Game(renderer, adManager);
};

void bootstrap();
