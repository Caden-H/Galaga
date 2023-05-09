import { GameView, GameViewApi } from "../types";
import { Scripts } from "./systems/dynamicImports/scripts";
import { createEventSystem } from "./systems/events";
import { GameScreenChanged } from "./systems/events/types/GameScreenChanged";
import { createStarBackground } from "./views/components/starBackground";
import { menuScreen } from "./views/menu";
import { pathMakerScreen } from "./views/pathMaker";

export const createGame = ({ canvas }: { canvas: HTMLCanvasElement }) => {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not get canvas context");

  const events = createEventSystem();
  const screenOptions: Parameters<GameView>[0] = {
    canvas,
    context,
    events,
  };
  let view: GameViewApi = menuScreen(screenOptions);
  const starBackground = createStarBackground({ canvas, context });

  events.subscribe<GameScreenChanged>({
    type: "GAME_SCREEN_CHANGED",
    callback: (event) => {
      view.dispose?.();
      switch (event.payload.screen) {
        case "menu":
          view = menuScreen(screenOptions);
          break;
        case "game":
          view = Scripts().screens.gameplay(screenOptions);
          break;
        case "credits":
          view = Scripts().screens.credits(screenOptions);
          break;
        case "high-scores":
          view = Scripts().screens.highScores(screenOptions);
          break;
        case "options":
          view = Scripts().screens.controls(screenOptions);
          break;
        case "attract":
          view = Scripts().screens.attract(screenOptions);
          break;
        case "path-maker":
          view = pathMakerScreen(screenOptions);
          break;
      }
    },
  });

  return {
    processInput: (deltaTime: number) => {
      view.processInput(deltaTime);
    },
    update: (deltaTime: number) => {
      starBackground.update(deltaTime);
      view.update(deltaTime);
    },
    render: () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.imageSmoothingEnabled = false;
      starBackground.render();
      view.render();
    },
  };
};
