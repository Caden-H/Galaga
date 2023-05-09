import { EventSystem } from "../../systems/events";
import { KeyConfigHoverChanged } from "../../systems/events/types/KeyConfigHoverChanged";
import { KeyConfigSelectionChanged } from "../../systems/events/types/KeyConfigSelectionChanged";
import {
  createKeyboardSystem,
  defaultKeyMapping,
  Key,
} from "../../systems/input/keyboard";
import { createMouseSystem } from "../../systems/input/mouse";
import { getKeyConfigPosition } from "./render";

export const setupInput = ({
  events,
  onKeyDown,
  canvas,
}: {
  events: EventSystem;
  onKeyDown: (key: string) => void;
  canvas: HTMLCanvasElement;
}) => {
  const keyboard = createKeyboardSystem();
  const mouse = createMouseSystem({ canvas });

  keyboard.subscribe({
    key: "*",
    type: "keydown",
    callback: onKeyDown,
  });

  for (let i = 0; i < Object.keys(defaultKeyMapping).length; i++) {
    const key = Object.keys(defaultKeyMapping)[i];
    const position = getKeyConfigPosition({ canvas, index: i });
    mouse.onClick({
      area: { ...position, type: "box" },
      callback: () => {
        events.publish<KeyConfigSelectionChanged>({
          type: "KEY_CONFIG_SELECTION_CHANGED",
          payload: {
            key: key as Key,
          },
        });
      },
    });
    mouse.onHover({
      area: { ...position, type: "box" },
      in: () => {
        events.publish<KeyConfigHoverChanged>({
          type: "KEY_CONFIG_HOVER_CHANGED",
          payload: {
            key: key as Key,
          },
        });
      },
      out: () => {
        events.publish<KeyConfigHoverChanged>({
          type: "KEY_CONFIG_HOVER_CHANGED",
          payload: {
            key: null,
          },
        });
      },
    });
  }

  return { keyboard, mouse };
};
