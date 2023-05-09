import { BaseEvent } from ".";
import { Enemy } from "../../../views/gameplay/enemies/enemy";

export type EnemyDestroyedEvent = BaseEvent<
  "ENEMY_DESTROYED",
  {
    enemy: Enemy;
    x: number;
    y: number;
  }
>;
