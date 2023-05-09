import { BaseEvent } from ".";
import { Enemy } from "../../../views/gameplay/enemies/enemy";

export type BulletHitEnemy = BaseEvent<
  "BULLET_HIT_ENEMY",
  {
    enemy: Enemy;
  }
>;
