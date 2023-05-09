import { BulletSystem } from "../../systems/bullets";
import { Lives } from "../../systems/lives";
import { Score } from "../../systems/scoring";
import { Enemy } from "./enemies/enemy";
import { Wave } from "./enemies/waves/wave";
import { Wave2 } from "./enemies/waves/wave2";
import { WaveBonus } from "./enemies/waves/waveBonus";
import { Ship } from "./ship";
import { BallState } from "./views/ball";
import { Brick } from "./views/brick";
import { Cloud } from "./views/cloud";
import { PaddleState } from "./views/paddle";

export type GameplayState = {
  elapsedTime: number;
  shotsFired: number;
  shotsHit: number;
  lives: Lives;
  score: Score;
  state: "playing" | "paused" | "gameover" | "win" | "quit" | "waiting" | 'readying';
  canvas: HTMLCanvasElement;
  enemies: Enemy[];
  ship: Ship;
  wave: Wave | Wave2 | WaveBonus;
  waveCount: number;
  bullets: BulletSystem;
  displayWaveForMs: number;
};
