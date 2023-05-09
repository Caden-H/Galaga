import { BaseEvent } from ".";

export type PlayerFiredEvent = BaseEvent<
  "PLAYER_FIRED",
  {
    x: number;
    y: number;
  }
>;
