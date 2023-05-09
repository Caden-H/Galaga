import { GameScreenEnum } from "../../../types";
import { EventSystem } from "../../systems/events";
import { GameScreenChanged } from "../../systems/events/types/GameScreenChanged";
import { MenuSelectionChanged } from "../../systems/events/types/MenuSelectionChanged";
import { createKeyboardSystem } from "../../systems/input/keyboard";
import { createMouseSystem } from "../../systems/input/mouse";
import { menuItems } from "./menuItems";
import { getMenuItemPosition } from "./render";

export const setupMenuInput = (
  events: EventSystem,
  canvas: HTMLCanvasElement
) => {
  const keyboard = createKeyboardSystem();
  const mouse = createMouseSystem({ canvas });

  let currentMenuItem: GameScreenEnum;

  for (let i = 0; i < menuItems.length; i++) {
    const item = menuItems[i];
    const box = getMenuItemPosition(i, canvas);
    mouse.onHover({
      area: box,
      in: () => {
        events.publish<MenuSelectionChanged>({
          type: "MENU_SELECTION_CHANGED",
          payload: {
            selection: item.value,
          },
        });
      },
      out: () => {},
    });
    mouse.onClick({
      area: box,
      callback: () => {
        events.publish<GameScreenChanged>({
          type: "GAME_SCREEN_CHANGED",
          payload: {
            screen: item.value,
          },
        });
      },
    });
  }

  const disposeSelectionChanged = events.subscribe<MenuSelectionChanged>({
    type: "MENU_SELECTION_CHANGED",
    callback: (event) => {
      currentMenuItem = event.payload.selection;
    },
  });

  keyboard.subscribe({
    key: "up",
    type: "keydown",
    callback: () => {
      const index = menuItems.findIndex((m) => m.value === currentMenuItem);
      const nextIndex = index === 0 ? menuItems.length - 1 : index - 1;
      events.publish<MenuSelectionChanged>({
        type: "MENU_SELECTION_CHANGED",
        payload: {
          selection: menuItems[nextIndex].value,
        },
      });
    },
  });

  keyboard.subscribe({
    key: "down",
    type: "keydown",
    callback: () => {
      const index = menuItems.findIndex((m) => m.value === currentMenuItem);
      const nextIndex = index === menuItems.length - 1 ? 0 : index + 1;
      events.publish<MenuSelectionChanged>({
        type: "MENU_SELECTION_CHANGED",
        payload: {
          selection: menuItems[nextIndex].value,
        },
      });
    },
  });

  keyboard.subscribe({
    key: "select",
    type: "keydown",
    callback: () => {
      events.publish<GameScreenChanged>({
        type: "GAME_SCREEN_CHANGED",
        payload: {
          screen: currentMenuItem,
        },
      });
    },
  });

  return {
    keyboard,
    mouse,
    dispose: disposeSelectionChanged,
  };
};
