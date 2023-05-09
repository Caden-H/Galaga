import { Textures } from "../../systems/dynamicImports/textures";
import { EventSystem } from "../../systems/events";
import { BulletHitPlayer } from "../../systems/events/types/BulletHitPlayer";
import { GameOverEvent } from "../../systems/events/types/GameOver";
import { PlayerDestroyedEvent } from "../../systems/events/types/PlayerDestroyed";
import { PlayerFiredEvent } from "../../systems/events/types/PlayerFired";
import { PlayerHitEnemy } from "../../systems/events/types/PlayerHitEnemy";
import { Bullet } from "./bullet";
import {
  SHIP_DESTROYED_ANIMATION_DURATION,
  SHIP_READYING_ANIMATION_DURATION,
} from "./config";
import { Enemy } from "./enemies/enemy";
import { EnemyBullet } from "./enemies/enemyBullet";

const NEW_SHIP_DELAY =
  SHIP_READYING_ANIMATION_DURATION + SHIP_DESTROYED_ANIMATION_DURATION;

export const SHIP_SPRITE_SIZE = 48;
const SHIP_Y_OFFSET = 112;

const SHIP_FIRE_DELAY = 300;

export const createShip = ({
  events,
  canvas,
}: {
  events: EventSystem;
  canvas: HTMLCanvasElement;
}) => {
  const image = Textures().ship;
  const width = SHIP_SPRITE_SIZE;
  const height = SHIP_SPRITE_SIZE;
  let xPosition = canvas.width / 2 - width / 2;
  let yPosition = canvas.height - SHIP_Y_OFFSET;
  // let speed = 5.5;
  let speed = 0.4;
  let active = false;
  let bullets: Bullet[] = [];
  let fireCooldown: number = 0;
  const onDispose: VoidFunction[] = [];
  let stateElapsed = 0;
  let state: "starting" | "preparing" | "playing" | "gameOver" = "starting";

  const fire = () => {
    let charged = false;
    if (!active || fireCooldown > 20) return; // don't fire if ship is dead
    if (fireCooldown > 0 && fireCooldown <= 20) charged = true;
    bullets.push(new Bullet(xPosition, yPosition, events, charged)); // add new bullet to array
    fireCooldown = SHIP_FIRE_DELAY;
  };

  const resetShip = () => {
    xPosition = canvas.width / 2 - width / 2;
    yPosition = canvas.height - SHIP_Y_OFFSET;
    active = true;
  };

  onDispose.push(
    events.subscribe<GameOverEvent>({
      type: "GAME_OVER",
      callback: () => {
        state = "gameOver";
        stateElapsed = 0;
      },
    })
  );

  onDispose.push(
    events.subscribe<PlayerFiredEvent>({
      type: "PLAYER_FIRED",
      callback: () => {
        fire();
      },
    })
  );

  onDispose.push(
    events.subscribe<GameOverEvent>({
      type: "GAME_OVER",
      callback: () => {
        active = false;
        state = "gameOver";
        stateElapsed = 0;
      },
    })
  );

  const dispose = () => {
    onDispose.forEach((fn) => fn());
  };

  const moveLeft = (deltaTime: number) => {
    if (!active) return; // don't move if ship is dead
    xPosition = Math.max(0, xPosition - speed * deltaTime);
  };
  const moveRight = (deltaTime: number) => {
    if (!active) return; // don't move if ship is dead
    xPosition = Math.min(canvas.width - width, xPosition + speed * deltaTime);
  };

  const hit = () => {
    if (!active) return;
    active = false;
    state = "preparing";
    stateElapsed = 0;
    events.publish<PlayerDestroyedEvent>({
      type: "PLAYER_DESTROYED",
      payload: {
        x: xPosition,
        y: yPosition,
      },
    });
  };

  const render = (context: CanvasRenderingContext2D) => {
    // render bullets
    bullets.forEach((bullet) => {
      bullet.render(context);
    });
    // render ship
    if (active) context.drawImage(image, xPosition, yPosition, width, height);
  };

  const update = (
    deltaTime: number,
    enemies: Enemy[],
    enemyBullets: EnemyBullet[]
  ) => {
    if (fireCooldown > 0) fireCooldown -= deltaTime;
    if (fireCooldown < 0) fireCooldown = 0;
    stateElapsed += deltaTime;
    if (
      (state === "preparing" && stateElapsed > NEW_SHIP_DELAY) ||
      (state === "starting" && stateElapsed > SHIP_READYING_ANIMATION_DURATION)
    ) {
      state = "playing";
      resetShip();
    }

    // update bullets
    for (let i = 0; i < bullets.length; i++)
      bullets[i].update(deltaTime, enemies);
    bullets = bullets.filter((bullet) => bullet.active);

    // check for collisions with enemies
    if (!active) return; // don't check for collisions if ship is dead
    enemies.forEach((enemy) => {
      if (
        enemy.active &&
        xPosition < enemy.xPosition + enemy.width &&
        xPosition + width * 0.8 > enemy.xPosition &&
        yPosition < enemy.yPosition + enemy.height &&
        yPosition + height * 0.85 > enemy.yPosition
      ) {
        // collision detected!
        events.publish<PlayerHitEnemy>({
          type: "PLAYER_HIT_ENEMY",
          payload: { enemy },
        });
        hit();
      }

      // check for collisions with enemy bullets
      enemyBullets.forEach((bullet) => {
        if (
          bullet.active &&
          xPosition < bullet.xPosition + bullet.width &&
          xPosition + width * 0.8 > bullet.xPosition &&
          yPosition < bullet.yPosition + bullet.height &&
          yPosition + height * 0.85 > bullet.yPosition
        ) {
          // collision detected!
          hit();
          events.publish<BulletHitPlayer>({
            type: "BULLET_HIT_PLAYER",
            payload: {},
          });
          bullet.active = false;
        }
      });
    });
  };

  return {
    dispose,
    render,
    update,
    moveRight,
    resetShip,
    moveLeft,
    active: () => active,
    xPosition: () => xPosition,
    yPosition: () => yPosition,
    setActive: (value: boolean) => {
      active = value;
    },
  };
};

export type Ship = ReturnType<typeof createShip>;
