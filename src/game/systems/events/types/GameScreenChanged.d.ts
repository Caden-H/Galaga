import { BaseEvent } from ".";
import { GameScreenEnum } from "../../../../types";

export type GameScreenChanged = BaseEvent<
  "GAME_SCREEN_CHANGED",
  {
    screen: GameScreenEnum;
  }
>;
