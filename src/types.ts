import { EventSystem } from "./game/systems/events";

export type GameView = (options: {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  events: EventSystem;
}) => GameViewApi;

export interface GameViewApi {
  update: (deltaTime: number) => void;
  render: () => void;
  processInput: (deltaTime: number) => void;
  dispose?: () => void;
}

export type GameScreenEnum =
  | "menu"
  | "game"
  | "high-scores"
  | "credits"
  | "attract"
  | "options"
  | "path-maker";
