export type ObstacleTemplate = {
  path: string;
  y: number;
  w: number;
  h: number;
  scaleFactor: number;
  speed: number;
  hitboxInset?: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
};

export const GAME_CONFIG = {
  canvasWidth: 800,
  canvasHeight: 380,
  playerStartX: 100,
  playerStartY: 304,
  obstacleStartX: 815,
  obstacleCleanupX: -100,
  obstacleMinDist: 320,
  obstacleMaxDist: 620,
  warningFrames: 100,
  thresholdStep: 15,
  obstacleSpeedStep: 0.35,
  obstacleMaxSpeed: 8,
  backgroundSpeed: 2.4,
} as const;

export const OBSTACLE_TEMPLATES: ObstacleTemplate[] = [
  {
    path: "/assets/spikeC.png",
    y: 360,
    w: 139,
    h: 250,
    scaleFactor: 5,
    speed: 5,
    hitboxInset: { left: 0.24, right: 0.24, top: 0.3, bottom: 0.04 },
  },
  {
    path: "/assets/spikeB.png",
    y: 360,
    w: 343,
    h: 177,
    scaleFactor: 5,
    speed: 5,
    hitboxInset: { left: 0.2, right: 0.2, top: 0.26, bottom: 0.04 },
  },
  {
    path: "/assets/spikeD.png",
    y: 290,
    w: 326,
    h: 159,
    scaleFactor: 6,
    speed: 6,
    hitboxInset: { left: 0.24, right: 0.24, top: 0.26, bottom: 0.04 },
  },
  {
    path: "/assets/spikeA.png",
    y: 360,
    w: 364,
    h: 202,
    scaleFactor: 5,
    speed: 5,
    hitboxInset: { left: 0.2, right: 0.2, top: 0.24, bottom: 0.04 },
  },
];
