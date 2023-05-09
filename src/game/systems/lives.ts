import { Textures } from "./dynamicImports/textures";
import { EventSystem } from "./events";
import { GameOverEvent } from "./events/types/GameOver";
import { PlayerDestroyedEvent } from "./events/types/PlayerDestroyed";

const STARTING_LIVES = 3;
const LIVES_SPRITE = Textures().ship;
const X_POSITION = 10;
const Y_POSITION = 10;
const WIDTH = 48;
const HEIGHT = 48;

export class Lives {
  private lives: number;
  private events: EventSystem;
  private context: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private onDispose: VoidFunction[] = [];

  constructor(
    events: EventSystem,
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D
  ) {
    this.lives = STARTING_LIVES;
    this.events = events;
    this.canvas = canvas;
    this.context = context;

    this.onDispose.push(
      this.events.subscribe<PlayerDestroyedEvent>({
        type: "PLAYER_DESTROYED",
        callback: () => {
          this.loseLife();
        },
      })
    );
  }

  public dispose() {
    this.onDispose.forEach((dispose) => dispose());
  }

  public getLives(): number {
    return this.lives;
  }

  public loseLife(): void {
    this.lives--;
    if (this.lives === 0) this.gameOver();
  }

  public reset(): void {
    this.lives = STARTING_LIVES;
  }

  public gameOver(): void {
    this.events.publish<GameOverEvent>({
      type: "GAME_OVER",
      payload: {},
    });
  }

  public render(active: boolean) {
    // render lives as ship sprites on the side of the screen
    const livesToRender = this.lives - (active ? 1 : 0);
    for (let i = 0; i < livesToRender; i++) {
      this.context.drawImage(
        LIVES_SPRITE,
        X_POSITION + i * WIDTH,
        this.canvas.height - Y_POSITION - HEIGHT,
        WIDTH,
        HEIGHT
      );
    }
  }
}
