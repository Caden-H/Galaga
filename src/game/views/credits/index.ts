import { GameViewApi } from "../../../types";
import { Audio } from "../../systems/dynamicImports/audio";
import { EventSystem } from "../../systems/events";
import { GameScreenChanged } from "../../systems/events/types/GameScreenChanged";
import { createKeyboardSystem } from "../../systems/input/keyboard";
import { renderCredits } from "./render";

export const creditsScreen = ({
  canvas,
  context,
  events,
}: {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  events: EventSystem;
}): GameViewApi => {
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

  return {
    dispose: () => {
      input.dispose();
    },
    update: () => {},
    processInput: (deltaTime) => {
      input.update(deltaTime);
    },
    render: () => {
      renderCredits({ context, canvas, exitKey: input.getMapping().exit });
    },
  };
};
