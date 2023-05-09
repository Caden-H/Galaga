import { EventSystem } from "../../systems/events";
import { GameScreenChanged } from "../../systems/events/types/GameScreenChanged";
import { createKeyboardSystem } from "../../systems/input/keyboard";
import { createMouseSystem } from "../../systems/input/mouse";

export const setupAttractInput = ({
  canvas,
  events,
}: {
  canvas: HTMLCanvasElement;
  events: EventSystem;
}) => {
  const keyboard = createKeyboardSystem();
  const mouse = createMouseSystem({ canvas });

  const returnToMenu = () => {
    events.publish<GameScreenChanged>({
      type: "GAME_SCREEN_CHANGED",
      payload: {
        screen: "menu",
      },
    });
  };

  keyboard.subscribe({
    type: "keydown",
    key: "*",
    callback: returnToMenu,
  });

  mouse.onMove({
    callback: returnToMenu,
  });

  mouse.onClick({
    area: {
      type: "box",
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
    },
    callback: returnToMenu,
  });

  return {
    update: (deltaTime: number) => {
      keyboard.update(deltaTime);
      mouse.update();
    },
    dispose: () => {
      keyboard.dispose();
      mouse.dispose();
    },
  };
};
