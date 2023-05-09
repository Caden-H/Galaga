import { GameScreenEnum, GameView, GameViewApi } from "../../../types";
import { Audio } from "../../systems/dynamicImports/audio";
import { GameScreenChanged } from "../../systems/events/types/GameScreenChanged";
import { MenuSelectionChanged } from "../../systems/events/types/MenuSelectionChanged";
import { getFromStorage } from "../../systems/localStorage";
import { createAnimatedSprite } from "../components/animatedSprite";
import { setupMenuInput } from "./input";
import { renderMenu } from "./render";
import { MenuTextures } from "./textures";

const INITIAL_STATE_KEY = "galaga-menu-initial-state";
const TIME_TO_SHOW_ATTRACT_SCREEN = 10000;

export const menuScreen: GameView = ({
  canvas,
  context,
  events,
}): GameViewApi => {
  const state = {
    currentSelection: getFromStorage<GameScreenEnum>({
      key: INITIAL_STATE_KEY,
      defaultValue: "game",
    }),
    selectionConfirmed: false,
    selectionSprite: createAnimatedSprite({
      texture: MenuTextures().enemies[4],
      frames: 2,
      frameDuration: 500,
    }),
    inactiveTime: 0,
  };

  const {
    keyboard,
    mouse,
    dispose: disposeInput,
  } = setupMenuInput(events, canvas);
  const audio = Audio();

  // fire initial menu selection event to set initial state in subscribers
  events.publish<MenuSelectionChanged>({
    type: "MENU_SELECTION_CHANGED",
    payload: {
      selection: state.currentSelection,
    },
  });

  const disposeSelectionChanged = events.subscribe<MenuSelectionChanged>({
    type: "MENU_SELECTION_CHANGED",
    callback: (event) => {
      state.currentSelection = event.payload.selection;
    },
  });

  const disposeScreenChanged = events.subscribe<GameScreenChanged>({
    type: "GAME_SCREEN_CHANGED",
    callback: () => {
      if (state.inactiveTime < TIME_TO_SHOW_ATTRACT_SCREEN)
        audio.play({ key: "input" });
    },
  });

  mouse.onMove({
    callback: () => {
      state.inactiveTime = 0;
    },
  });

  keyboard.subscribe({
    key: "*",
    type: "keydown",
    callback: () => {
      state.inactiveTime = 0;
    },
  });

  return {
    dispose: () => {
      disposeInput();
      keyboard.dispose();
      mouse.dispose();
      
      disposeScreenChanged();
      disposeSelectionChanged();
    },
    processInput: (deltaTime) => {
      keyboard.update(deltaTime);
      mouse.update();
    },
    update: (deltaTime) => {
      state.inactiveTime += deltaTime;
      state.selectionSprite.update(deltaTime);

      if (state.inactiveTime >= TIME_TO_SHOW_ATTRACT_SCREEN) {
        events.publish<GameScreenChanged>({
          type: "GAME_SCREEN_CHANGED",
          payload: {
            screen: "attract",
          },
        });
      }
    },
    render: () => {
      renderMenu({
        canvas,
        context,
        currentSelection: state.currentSelection,
        selectionSprite: state.selectionSprite,
      });
    },
  };
};
