import { Audio } from "../../systems/dynamicImports/audio";
import { EventSystem } from "../../systems/events";
import { EnemyDestroyedEvent } from "../../systems/events/types/EnemyDestroyed";
import { PlayerDestroyedEvent } from "../../systems/events/types/PlayerDestroyed";
import { PlayerFiredEvent } from "../../systems/events/types/PlayerFired";

export const setupSound = (events: EventSystem) => {
  const audio = Audio();

  audio.play({
    key: "background",
    loop: true,
    volume: 0.2,
  });

  const dispose: VoidFunction[] = [];

  dispose.push(
    events.subscribe<PlayerFiredEvent>({
      type: "PLAYER_FIRED",
      callback: () => {
        audio.play({
          key: "fire",
        });
      },
    })
  );

  dispose.push(
    events.subscribe<PlayerDestroyedEvent>({
      type: "PLAYER_DESTROYED",
      callback: () => {
        audio.play({
          key: "player-die",
        });
      },
    })
  );

  dispose.push(
    events.subscribe<EnemyDestroyedEvent>({
      type: "ENEMY_DESTROYED",
      callback: () => {
        audio.play({
          key: "enemy-die",
        });
      },
    })
  );

  return {
    dispose: () => {
      dispose.forEach((fn) => fn());
      audio.stopAll();
    },
  };
};
