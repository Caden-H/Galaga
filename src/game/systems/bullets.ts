import { EnemyBullet } from "../views/gameplay/enemies/enemyBullet";
import { Ship } from "../views/gameplay/ship";
import { EventSystem } from "./events";
import { EnemyFiredEvent } from "./events/types/EnemyFired";

export const createBulletSystem = ({
  events,
  ship,
}: {
  events: EventSystem;
  ship: Ship;
}) => {
  let bullets: EnemyBullet[] = [];
  const dispose: VoidFunction[] = [];

  const update = (deltaTime: number) => {
    bullets.forEach((bullet) => {
      bullet.update(deltaTime);
    });
    bullets = bullets.filter((bullet) => bullet.active);
  };

  dispose.push(
    events.subscribe<EnemyFiredEvent>({
      type: "ENEMY_FIRED",
      callback: (event) => {
        if (ship.active())
          bullets.push(new EnemyBullet(event.payload.x, event.payload.y, ship));
      },
    })
  );

  return {
    update,
    dispose: () => {
      dispose.forEach((dispose) => dispose());
    },
    get: () => bullets,
    render: (context: CanvasRenderingContext2D) => {
      bullets.forEach((bullet) => {
        bullet.render(context);
      });
    },
  };
};

export type BulletSystem = ReturnType<typeof createBulletSystem>;
