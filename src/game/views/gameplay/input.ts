import { EventSystem } from "../../systems/events";
import { GameScreenChanged } from "../../systems/events/types/GameScreenChanged";
import { PlayerFiredEvent } from "../../systems/events/types/PlayerFired";
import { createKeyboardSystem } from "../../systems/input/keyboard";
import { Ship } from "./ship";
import { GameplayState } from "./types";

export const setupGameInput = ({
  ship,
  events,
  state,
}: {
  ship: Ship;
  events: EventSystem;
  state: GameplayState;
}) => {
  const keyboard = createKeyboardSystem();

  keyboard.subscribe({
    key: "exit",
    type: "keydown",
    callback: () => {
      events.publish<GameScreenChanged>({
        type: "GAME_SCREEN_CHANGED",
        payload: {
          screen: "menu",
        },
      });
    },
  });

  keyboard.subscribe({
    key: "left",
    type: "repeat",
    callback: (_, deltaTime) => {
      ship.moveLeft(deltaTime);
    },
  });
  keyboard.subscribe({
    key: "right",
    type: "repeat",
    callback: (_, deltaTime) => {
      ship.moveRight(deltaTime);
    },
  });
  keyboard.subscribe({
    key: "fire",
    type: "keydown",
    callback: () => {
      if (state.state !== 'playing') return;
      state.shotsFired++;
      events.publish<PlayerFiredEvent>({
        type: "PLAYER_FIRED",
        payload: {
          x: ship.xPosition(),
          y: ship.yPosition(),
        },
      });
    },
  });

  return {
    keyboard,
  };
};
