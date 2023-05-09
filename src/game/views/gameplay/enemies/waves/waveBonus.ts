import { EventSystem } from "../../../../systems/events";
import { NextWave } from "../../../../systems/events/types/NextWave";
import { Bee } from "../bee";
import { Boss } from "../boss";
import { Enemy } from "../enemy"; "../paths/attacks/bossAttacks";

import { bonus1Left, bonus1Right } from "../paths/attacks_bonus/1.bees";
import { bonus2 } from "../paths/attacks_bonus/2.bossAndBees";
import { bonus3 } from "../paths/attacks_bonus/3.bees";
import { bonus4Left, bonus4Right } from "../paths/attacks_bonus/4.bees";

import { EnemyPath } from "../paths/types";

import { Wave1 } from "./wave1";

const WAVE_DURATION = 35000

export class WaveBonus {
  public elapsedTime: number;
  private events: EventSystem;
  public enemies: Enemy[][];

  constructor(events: EventSystem) {
    this.events = events;
    this.elapsedTime = 0;
    this.enemies = [
        [new Bee(events), new Bee(events), new Bee(events), new Bee(events)], // 0
        [new Bee(events), new Bee(events), new Bee(events), new Bee(events)], // 1
        [new Boss(events, []), new Bee(events), new Boss(events, []), new Bee(events), 
        new Boss(events, []), new Bee(events), new Boss(events, []), new Bee(events)], // 2
        [new Bee(events), new Bee(events), new Bee(events), new Bee(events), 
         new Bee(events), new Bee(events), new Bee(events), new Bee(events)], // 3
        [new Bee(events), new Bee(events), new Bee(events), new Bee(events),
         new Bee(events), new Bee(events), new Bee(events), new Bee(events)], // 4
        [new Bee(events), new Bee(events), new Bee(events), new Bee(events),
         new Bee(events), new Bee(events), new Bee(events), new Bee(events)], // 5
    ];
    
    this.setEnemyPaths(this.enemies[0], bonus1Left, 4000);
    this.setEnemyPaths(this.enemies[1], bonus1Right, 4000);
    this.setEnemyPaths(this.enemies[2], bonus2, 10000);
    this.setEnemyPaths(this.enemies[3], bonus3, 16000);
    this.setEnemyPaths(this.enemies[4], bonus4Right, 22000);
    this.setEnemyPaths(this.enemies[5], bonus4Left, 28000);

  }

  private setEnemyPaths(
    enemiesList: (Enemy | null)[],
    path: EnemyPath,
    firstDelay: number,
  ) {
    let delay = firstDelay;

    for (let i = 0; i < enemiesList.length; i++) {
      if (!enemiesList[i]) continue;
      enemiesList[i]!.setPath({
        dx: 0,
        dy: 0,
        path: path,
        delay: delay,
        speed: 0.5,
        numberOfShots: 0,
    });
      delay += 150;
    }
  }
  
  public isComplete() {
    if (this.elapsedTime > WAVE_DURATION) {
        return true;
    } else {
        return false;
    }
  }

  update(
    deltaTime: number,
    options: {
      pauseAttack: boolean;
    }
  ) {

    if (!options.pauseAttack) {
      this.elapsedTime += deltaTime;
    }
  }

  render(context: CanvasRenderingContext2D) {
    // render all enemies
    this.getEnemies().forEach((enemy) => {
        if (!enemy || !enemy.active) return;
        enemy.render(context);
    });

  }

  getEnemies(): Enemy[] {
    // return all enemies in a single array
    let enemies: Enemy[] = [];
    // get every enemy in this.enemies
    for (let i = 0; i < this.enemies.length; i++) {
      for (let j = 0; j < this.enemies[i].length; j++) {
        if (this.enemies[i][j]) enemies.push(this.enemies[i][j]);
      }
    }
    return enemies;
  }


  public nextWave() {
    this.events.publish<NextWave>({
        type: "NEXT_WAVE",
        payload: {
          wave: this,
        },
    });

    return new Wave1(this.events);
  }
}
