import { GameViewApi } from "../../../types";
import { createBulletSystem } from "../../systems/bullets";
import { EventSystem } from "../../systems/events";
import { BulletHitEnemy } from "../../systems/events/types/BulletHitEnemy";
import { EnemyDestroyedEvent } from "../../systems/events/types/EnemyDestroyed";
import { GameOverEvent } from "../../systems/events/types/GameOver";
import { GameScreenChanged } from "../../systems/events/types/GameScreenChanged";
import { NextWave } from "../../systems/events/types/NextWave";
import { PlayerDestroyedEvent } from "../../systems/events/types/PlayerDestroyed";
import { PlayerFiredEvent } from "../../systems/events/types/PlayerFired";
import { Lives } from "../../systems/lives";
import { createScoreSystem } from "../../systems/scoring";
import { setupParticles } from "../components/particles";
import {
  SHIP_DESTROYED_ANIMATION_DURATION,
  SHIP_READYING_ANIMATION_DURATION,
} from "../gameplay/config";
import { Enemy } from "../gameplay/enemies/enemy";
import { EnemyBullet } from "../gameplay/enemies/enemyBullet";
import { Wave } from "../gameplay/enemies/waves/wave";
import { Wave1 } from "../gameplay/enemies/waves/wave1";
import { renderGame } from "../gameplay/render";
import { createShip, SHIP_SPRITE_SIZE } from "../gameplay/ship";
import { setupSound } from "../gameplay/sound";
import type { GameplayState } from "../gameplay/types";
import { setupAttractInput } from "./input";

const FIRE_THRESHOLD = 8;
const FIRE_COOLDOWN = 500;
const HALF_SHIP_SIZE = SHIP_SPRITE_SIZE / 2;
const RUN_AWAY_THRESHOLD = 200;
const RESTART_AFTER = 5000;

export const attractScreen = ({
  canvas,
  context,
  events,
}: {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  events: EventSystem;
}): GameViewApi => {
  const input = setupAttractInput({
    canvas,
    events,
  });

  const particles = setupParticles(events);
  const ship = createShip({ canvas, events });
  const sound = setupSound(events);
  const state = {
    elapsedTime: 0,
    ship,
    lives: new Lives(events, canvas, context),
    enemies: [] as Enemy[],
    elapsedSinceFire: 0,
    wave: new Wave1(events) as Wave,
    bullets: createBulletSystem({ events, ship }),
    waveCount: 1,
    state: "playing" as GameplayState["state"],
    score: createScoreSystem(events, { attractMode: true }),
    shotsFired: 0,
    shotsHit: 0,
    displayWaveForMs: 3000,
  };

  state.ship.setActive(true);
  state.enemies = state.wave.getEnemies();

  const dispose: VoidFunction[] = [];

  dispose.push(
    events.subscribe<EnemyDestroyedEvent>({
      type: "ENEMY_DESTROYED",
      callback: (event) => {
        const index = state.enemies.findIndex((e) => e === event.payload.enemy);
        state.enemies[index].dispose();
        state.enemies.splice(index, 1);
      },
    })
  );

  dispose.push(
    events.subscribe<GameOverEvent>({
      type: "GAME_OVER",
      callback: () => {
        state.state = "gameover";
        state.elapsedTime = 0;
      },
    })
  );

  dispose.push(
    events.subscribe<PlayerDestroyedEvent>({
      type: "PLAYER_DESTROYED",
      callback: () => {
        if (state.state === "gameover") return;
        state.state = "readying";
        state.elapsedTime = 0;
      },
    })
  );

  dispose.push(
    events.subscribe<BulletHitEnemy>({
      type: "BULLET_HIT_ENEMY",
      callback: () => {
        state.shotsHit++;
      },
    })
  );

  dispose.push(
    events.subscribe<NextWave>({
      type: "NEXT_WAVE",
      callback: () => {
        state.waveCount++;
        state.displayWaveForMs = 3000;
      },
    })
  );

  return {
    dispose: () => {
      state.lives.dispose();
      state.bullets.dispose();
      state.score.dispose();
      ship.dispose();
      particles.dispose();
      sound.dispose();
      input.dispose();
      dispose.forEach((fn) => fn());
    },
    update: (deltaTime) => {
      state.elapsedTime += deltaTime;
      state.displayWaveForMs -= deltaTime;

      switch (state.state) {
        case "waiting":
          if (state.elapsedTime >= SHIP_DESTROYED_ANIMATION_DURATION) {
            state.elapsedTime -= SHIP_DESTROYED_ANIMATION_DURATION;
            state.state = "readying";
          }
          break;
        case "readying":
          if (state.elapsedTime >= SHIP_READYING_ANIMATION_DURATION) {
            state.elapsedTime -= SHIP_READYING_ANIMATION_DURATION;
            state.state = "playing";
          }
          break;
        case "gameover":
          if (state.elapsedTime >= RESTART_AFTER) {
            state.elapsedTime = 0;
            events.publish<GameScreenChanged>({
              type: "GAME_SCREEN_CHANGED",
              payload: {
                screen: "attract",
              },
            });
          }
      }

      particles.update(deltaTime);
      state.bullets.update(deltaTime);
      state.ship.update(deltaTime, state.enemies, state.bullets.get());
      state.wave.update(deltaTime, {
        pauseAttack: !state.ship.active(),
      });
      state.enemies.forEach((enemy) => enemy.update(deltaTime));
      state.elapsedSinceFire += deltaTime;

      if (state.state === "playing") {
        const activeEnemies = state.enemies.filter(
          (enemy) =>
            enemy.xPosition > 0 &&
            enemy.xPosition + enemy.width < canvas.width &&
            enemy.yPosition > 0 &&
            enemy.yPosition + enemy.height < canvas.height
        );

        // fire if there is an enemy directly above
        const directlyAboveEnemy = activeEnemies.find((enemy) => {
          return (
            enemy.yPosition + enemy.height / 2 <
              state.ship.yPosition() + HALF_SHIP_SIZE &&
            Math.abs(
              enemy.xPosition +
                enemy.width / 2 -
                (state.ship.xPosition() + HALF_SHIP_SIZE)
            ) < FIRE_THRESHOLD
          );
        });
        if (directlyAboveEnemy && state.elapsedSinceFire > FIRE_COOLDOWN) {
          state.elapsedSinceFire = 0;
          state.shotsFired++;
          events.publish<PlayerFiredEvent>({
            type: "PLAYER_FIRED",
            payload: {
              x: state.ship.xPosition(),
              y: state.ship.yPosition(),
            },
          });
        } else {
          const nearbyEnemies = activeEnemies
            .map((enemy) => {
              const distanceX = Math.abs(
                enemy.xPosition +
                  enemy.width / 2 -
                  (state.ship.xPosition() + HALF_SHIP_SIZE)
              );
              const distanceY = Math.abs(
                enemy.yPosition +
                  enemy.height / 2 -
                  (state.ship.yPosition() + HALF_SHIP_SIZE)
              );
              const distance = Math.sqrt(
                distanceX * distanceX + distanceY * distanceY
              );
              return { enemy, distance };
            })
            .filter(({ distance }) => {
              return distance < RUN_AWAY_THRESHOLD;
            });

          const nearbyBullets = state.bullets
            .get()
            .map((bullet) => {
              const distanceX = Math.abs(
                bullet.xPosition +
                  bullet.width / 2 -
                  (state.ship.xPosition() + HALF_SHIP_SIZE)
              );
              const distanceY = Math.abs(
                bullet.yPosition +
                  bullet.height / 2 -
                  (state.ship.yPosition() + HALF_SHIP_SIZE)
              );
              const distance = Math.sqrt(
                distanceX * distanceX + distanceY * distanceY
              );
              return { bullet, distance };
            })
            .filter(({ distance }) => {
              return distance < RUN_AWAY_THRESHOLD;
            });

          if (nearbyEnemies.length > 0 || nearbyBullets.length > 0) {
            const closestEnemy = nearbyEnemies.reduce(
              (acc, enemy) => {
                if (enemy.distance < acc.distance) return enemy;
                return acc;
              },
              { enemy: null as Enemy | null, distance: Infinity }
            );
            const closestBullet = nearbyBullets.reduce(
              (acc, bullet) => {
                if (bullet.distance < acc.distance) return bullet;
                return acc;
              },
              { bullet: null as EnemyBullet | null, distance: Infinity }
            );
            const closest =
              closestEnemy.distance < closestBullet.distance
                ? closestEnemy?.enemy
                : closestBullet?.bullet;
            if (closest) {
              if (
                closest.xPosition + closest.width / 2 >
                state.ship.xPosition() + HALF_SHIP_SIZE
              ) {
                state.ship.moveLeft(deltaTime / 2);
              } else {
                state.ship.moveRight(deltaTime / 2);
              }
            }
          } else {
            const closestEnemyAbove = activeEnemies.reduce(
              (acc, enemy) => {
                const distance = Math.abs(
                  enemy.xPosition +
                    enemy.width / 2 -
                    (state.ship.xPosition() + HALF_SHIP_SIZE)
                );
                if (distance < acc.distance) return { enemy, distance };
                return acc;
              },
              { enemy: null as Enemy | null, distance: Infinity }
            );
            if (closestEnemyAbove.enemy) {
              if (
                closestEnemyAbove.enemy.xPosition +
                  closestEnemyAbove.enemy.width / 2 >
                state.ship.xPosition() + HALF_SHIP_SIZE
              ) {
                state.ship.moveRight(deltaTime / 2);
              } else {
                state.ship.moveLeft(deltaTime / 2);
              }
            }
          }
        }

        if (state.wave.isComplete()) {
          state.wave = state.wave.nextWave();
          state.enemies = state.wave.getEnemies();
        }
      }
    },
    processInput: (deltaTime) => {
      input.update(deltaTime);
    },
    render: () => {
      renderGame({
        context,
        canvas,
        state: state.state,
        achievedHighScore: state.score.achievedHighScore,
        score: state.score.score,
        highScore: state.score.highScore,
        shotsFired: state.shotsFired,
        shotsHit: state.shotsHit,
        wave: { count: state.waveCount, showing: state.displayWaveForMs > 0 },
      });
      particles.render(context);
      state.ship.render(context);
      state.lives.render(state.ship.active());
      state.wave.render(context);
      state.bullets.render(context);
    },
  };
};
