import { EventSystem } from "../../systems/events";
import { EnemyDestroyedEvent } from "../../systems/events/types/EnemyDestroyed";
import { PlayerDestroyedEvent } from "../../systems/events/types/PlayerDestroyed";
import { createParticleSystem } from "../../systems/particles";

export const setupParticles = (events: EventSystem) => {
  const { update, render, addEffect } = createParticleSystem();

  const dispose: VoidFunction[] = [];

  dispose.push(
    events.subscribe<PlayerDestroyedEvent>({
      type: "PLAYER_DESTROYED",
      callback: (event) =>
        addEffect({
          type: "player-destroyed",
          x: event.payload.x,
          y: event.payload.y,
        }),
    })
  );

  dispose.push(
    events.subscribe<EnemyDestroyedEvent>({
      type: "ENEMY_DESTROYED",
      callback: (event) => {
        addEffect({
          type: "enemy-destroyed",
          x: event.payload.x,
          y: event.payload.y,
        });
      },
    })
  );

  return {
    update,
    render,
    dispose: () => {
      dispose.forEach((fn) => fn());
    },
  };
};
