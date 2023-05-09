import { GameViewApi } from "../../../types";
import { Audio } from "../../systems/dynamicImports/audio";
import { EventSystem } from "../../systems/events";
import { GameScreenChanged } from "../../systems/events/types/GameScreenChanged";
import { KeyConfigHoverChanged } from "../../systems/events/types/KeyConfigHoverChanged";
import { KeyConfigSelectionChanged } from "../../systems/events/types/KeyConfigSelectionChanged";
import { Key } from "../../systems/input/keyboard";
import { setupInput } from "./input";
import { renderControlsScreen } from "./render";

export const controlsScreen = ({
  canvas,
  context,
  events,
}: {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  events: EventSystem;
}): GameViewApi => {
  const { keyboard, mouse } = setupInput({
    events,
    canvas,
    onKeyDown: (key) => {
      if (!state.editing) return;
      keyboard.setMapping({
        [state.editing]: key,
      });
      mapping = keyboard.getMapping();
      state.editing = null;
    },
  });
  let mapping = keyboard.getMapping();

  const state = {
    hovering: null as Key | null,
    editing: null as Key | null,
  };

  keyboard.subscribe({
    key: "exit",
    type: "keydown",
    callback: () => {
      if (state.editing) return;
      Audio().play({ key: "input" });
      events.publish<GameScreenChanged>({
        type: "GAME_SCREEN_CHANGED",
        payload: {
          screen: "menu",
        },
      });
    },
  });

  const disposeHover = events.subscribe<KeyConfigHoverChanged>({
    type: "KEY_CONFIG_HOVER_CHANGED",
    callback: (event) => {
      state.hovering = event.payload.key;
    },
  });

  const disposeSelection = events.subscribe<KeyConfigSelectionChanged>({
    type: "KEY_CONFIG_SELECTION_CHANGED",
    callback: (event) => {
      if (state.editing === event.payload.key) {
        state.editing = null;
        return;
      }
      state.editing = event.payload.key;
    },
  });

  return {
    dispose: () => {
      disposeHover();
      disposeSelection();
      keyboard.dispose();
      mouse.dispose();
    },
    update: () => {},
    render: () => {
      renderControlsScreen({
        context,
        canvas,
        mapping,
        hover: state.hovering,
        editing: state.editing,
        exitKey: keyboard.getMapping().exit,
      });
    },
    processInput: (deltaTime) => {
      keyboard.update(deltaTime);
      mouse.update();
    },
  };
};
