import { BaseEvent } from ".";
import { Enemy } from "../../../views/gameplay/enemies/enemy";

export type PlayerHitEnemy = BaseEvent<
  "PLAYER_HIT_ENEMY",
  {
    enemy: Enemy;
  }
>;
