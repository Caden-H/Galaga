import { BaseEvent } from ".";

export type EnemyFiredEvent = BaseEvent<
  "ENEMY_FIRED",
  {
    x: number;
    y: number;
  }
>;
