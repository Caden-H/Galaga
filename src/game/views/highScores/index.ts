import { GameViewApi } from "../../../types";
import { Audio } from "../../systems/dynamicImports/audio";
import { EventSystem } from "../../systems/events";
import { GameScreenChanged } from "../../systems/events/types/GameScreenChanged";
import { createKeyboardSystem } from "../../systems/input/keyboard";
import { getHighScores, resetHighScores } from "../../systems/scoring";
import { renderHighScores } from "./render";

export const highScoresScreen = ({
  canvas,
  context,
  events,
}: {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  events: EventSystem;
}): GameViewApi => {
  let highScores = getHighScores();

  const input = createKeyboardSystem();
  input.subscribe({
    key: "exit",
    type: "keydown",
    callback: () => {
      Audio().play({ key: "input" });
      events.publish<GameScreenChanged>({
        type: "GAME_SCREEN_CHANGED",
        payload: {
          screen: "menu",
        },
      });
    },
  });

  input.subscribe({
    key: "fire",
    type: "keydown",
    callback: () => {
      resetHighScores();
      highScores = getHighScores();
    },
  });

  return {
    dispose: () => {
      input.dispose();
    },
    update: () => {},
    render: () => {
      renderHighScores({
        context,
        canvas,
        highScores,
        exitKey: input.getMapping().exit,
      });
    },
    processInput: (deltaTime) => {
      input.update(deltaTime);
    },
  };
};
