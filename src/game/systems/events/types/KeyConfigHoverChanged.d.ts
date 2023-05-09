import { BaseEvent } from ".";
import { Key } from "../../input/keyboard";

export type KeyConfigHoverChanged = BaseEvent<
  "KEY_CONFIG_HOVER_CHANGED",
  {
    key: Key | null;
  }
>;
