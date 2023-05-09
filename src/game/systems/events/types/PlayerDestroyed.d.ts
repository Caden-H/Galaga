import { BaseEvent } from ".";

export type PlayerDestroyedEvent = BaseEvent<
  "PLAYER_DESTROYED",
  {
    x: number;
    y: number;
  }
>;
