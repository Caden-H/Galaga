import { GameView } from "../../../types";
import { createBulletSystem } from "../../systems/bullets";
import { BulletHitEnemy } from "../../systems/events/types/BulletHitEnemy";
import { EnemyDestroyedEvent } from "../../systems/events/types/EnemyDestroyed";
import { GameOverEvent } from "../../systems/events/types/GameOver";
import { NextWave } from "../../systems/events/types/NextWave";
import { PlayerDestroyedEvent } from "../../systems/events/types/PlayerDestroyed";
import { Lives } from "../../systems/lives";
import { createScoreSystem } from "../../systems/scoring";
import { setupParticles } from "../components/particles";
import {
  SHIP_DESTROYED_ANIMATION_DURATION,
  SHIP_READYING_ANIMATION_DURATION,
} from "./config";
import { Wave1 } from "./enemies/waves/wave1";
import { setupGameInput } from "./input";
import { renderGame } from "./render";
import { createShip } from "./ship";
import { setupSound } from "./sound";
import { GameplayState } from "./types";

export const gameplayScreen: GameView = ({ canvas, events }) => {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not get canvas context");

  const ship = createShip({ canvas, events });

  const state: GameplayState = {
    elapsedTime: 0,
    shotsFired: 0,
    shotsHit: 0,
    score: createScoreSystem(events),
    state: "readying",
    lives: new Lives(events, canvas, context),
    canvas,
    ship,
    enemies: [],
    wave: new Wave1(events),
    waveCount: 1,
    bullets: createBulletSystem({ events, ship }),
    displayWaveForMs: 3000,
  };

  const dispose: VoidFunction[] = [];
  const sound = setupSound(events);
  const particles = setupParticles(events);
  const { keyboard } = setupGameInput({ ship: state.ship, events, state });

  dispose.push(
    events.subscribe<GameOverEvent>({
      type: "GAME_OVER",
      callback: () => {
        state.state = "gameover";
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
    events.subscribe<PlayerDestroyedEvent>({
      type: "PLAYER_DESTROYED",
      callback: () => {
        if (state.state === "gameover") return;
        state.state = "waiting";
        state.elapsedTime = 0;
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

  const waveEnemies = state.wave.getEnemies();
  state.enemies = state.enemies.concat(waveEnemies);

  return {
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
            state.ship.resetShip();
          }
          break;
      }

      state.bullets.update(deltaTime);
      state.ship.update(deltaTime, state.enemies, state.bullets.get());
      particles.update(deltaTime);

      for (let i = 0; i < state.enemies.length; i++)
        state.enemies[i].update(deltaTime);

      state.wave.update(deltaTime, {
        pauseAttack: state.state !== "playing",
      });

      if (state.wave.isComplete()) {
        state.wave = state.wave.nextWave();
        state.enemies = state.wave.getEnemies();
      }
    },
    render: () => {
      state.ship.render(context);
      state.lives.render(state.ship.active());
      particles.render(context);
      state.wave.render(context);
      state.bullets.render(context);
      // state.enemies[0].render(context); // DEBUG ONLY
      renderGame({
        context,
        canvas,
        score: state.score.score,
        highScore: state.score.highScore,
        achievedHighScore: state.score.achievedHighScore,
        shotsFired: state.shotsFired,
        shotsHit: state.shotsHit,
        state: state.state,
        wave: { count: state.waveCount, showing: state.displayWaveForMs > 0 },
      });
    },
    processInput: (deltaTime) => {
      keyboard.update(deltaTime);
    },
    dispose: () => {
      state.ship.dispose();
      particles.dispose();
      sound.dispose();
      keyboard.dispose();
      sound.dispose();
      state.lives.dispose();
      state.score.dispose();
      state.bullets.dispose();

      for (let i = 0; i < dispose.length; i++) dispose[i]();
    },
  };
};
