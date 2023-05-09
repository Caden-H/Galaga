import { BaseEvent } from ".";
import { Key } from "../../input/keyboard";

export type KeyConfigSelectionChanged = BaseEvent<
  "KEY_CONFIG_SELECTION_CHANGED",
  {
    key: Key | null;
  }
>;
