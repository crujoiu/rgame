import "./style.css";
import { Game } from "./core/Game";
import { Renderer } from "./core/Renderer";
import { GAME_CONFIG } from "./core/State";

const renderer = new Renderer("canvas", GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
new Game(renderer);
