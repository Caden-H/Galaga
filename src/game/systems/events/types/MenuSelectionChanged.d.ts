import { BaseEvent } from ".";
import { GameScreenEnum } from "../../../../types";

export type MenuSelectionChanged = BaseEvent<
  "MENU_SELECTION_CHANGED",
  {
    selection: GameScreenEnum;
  }
>;
