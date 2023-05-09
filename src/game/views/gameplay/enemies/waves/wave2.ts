import { EventSystem } from "../../../../systems/events";
import { NextWave } from "../../../../systems/events/types/NextWave";
import { Bee } from "../bee";
import { Boss } from "../boss";
import { Butterfly } from "../butterfly";
import { Enemy } from "../enemy";
import { beeAttackLeft, beeAttackRight } from "../paths/attacks/beeAttack";
import { bossAttackLeft } from "../paths/attacks/bossAttacks";
import {
  butterflyAttackLeft,
  butterflyAttackRight,
} from "../paths/attacks/butterflyAttack";
import { bee1 } from "../paths/bee1";
import { bee2 } from "../paths/bee2";
import { bee3 } from "../paths/bee3";
import { bossbutterfly1 } from "../paths/bossbutterfly1";
import { butterfly1 } from "../paths/butterfly1";
import { butterfly2 } from "../paths/butterfly2";
import { EnemyPath } from "../paths/types";
import { Attacks } from "./Attacks";
import { FormationGrid } from "./formation";
import { shuffle } from "./shuffle";
import { WaveBonus } from "./waveBonus";

// create a formation grid with enemies that are in the positions of the galaga grid
// 1st row: 4 Bosses; 2nd and 3rd rows: 8 Butterflies; 4th and 5th rows: 10 Bees

const SECOND_SHOT_MIN_DELAY = 200;
const SECOND_SHOT_MAX_DELAY = 300;
const ROW_SEPARATION = 64;
const ATTACK_DELAY = 17 * 1000;

export class Wave2 {
  public formation: FormationGrid;
  public elapsedTime: number;
  public attacking: boolean;
  private events: EventSystem;

  constructor(events: EventSystem) {
    this.events = events;
    this.elapsedTime = 0;
    this.attacking = false;

    this.formation = new FormationGrid(
      5,
      [
        [
          new Boss(events, []),
          new Boss(events, []),
          new Boss(events, []),
          new Boss(events, []),
        ],
        [
          new Butterfly(events),
          new Butterfly(events),
          new Butterfly(events),
          new Butterfly(events),
          new Butterfly(events),
          new Butterfly(events),
          new Butterfly(events),
          new Butterfly(events),
        ],
        [
          new Butterfly(events),
          new Butterfly(events),
          new Butterfly(events),
          new Butterfly(events),
          new Butterfly(events),
          new Butterfly(events),
          new Butterfly(events),
          new Butterfly(events),
        ],
        [
          new Bee(events),
          new Bee(events),
          new Bee(events),
          new Bee(events),
          new Bee(events),
          new Bee(events),
          new Bee(events),
          new Bee(events),
          new Bee(events),
          new Bee(events),
        ],
        [
          new Bee(events),
          new Bee(events),
          new Bee(events),
          new Bee(events),
          new Bee(events),
          new Bee(events),
          new Bee(events),
          new Bee(events),
          new Bee(events),
          new Bee(events),
        ],
      ],
      events
    );

    // first bees
    let enemiesList = [
      this.formation.grid[3][4],
      this.formation.grid[3][5],
      this.formation.grid[4][4],
      this.formation.grid[4][5],
    ];
    this.setEnemyPaths(enemiesList, bee1, 5000, 0, 0, 0.5);

    // first butterflies
    enemiesList = [
      this.formation.grid[1][3],
      this.formation.grid[1][4],
      this.formation.grid[2][3],
      this.formation.grid[2][4],
    ];
    this.setEnemyPaths(enemiesList, butterfly1, 5000, 0, 0, 0.5);

    // bosses from the left
    enemiesList = [
      this.formation.grid[0][0],
      this.formation.grid[0][1],
      this.formation.grid[0][2],
      this.formation.grid[0][3],
    ];
    this.setEnemyPaths(
      enemiesList,
      bossbutterfly1,
      10000,
      0,
      ROW_SEPARATION,
      1
    );

    // butterflies from the left
    enemiesList = [
      this.formation.grid[1][2],
      this.formation.grid[1][5],
      this.formation.grid[2][2],
      this.formation.grid[2][5],
    ];
    this.setEnemyPaths(enemiesList, bossbutterfly1, 10000, 0, 0);

    // butterflies from right 1
    enemiesList = [
      this.formation.grid[1][6],
      this.formation.grid[1][0],
      this.formation.grid[1][7],
      this.formation.grid[1][1],
    ];
    this.setEnemyPaths(enemiesList, butterfly2, 16000, 0, 0);

    enemiesList = [
      this.formation.grid[2][6],
      this.formation.grid[2][0],
      this.formation.grid[2][7],
      this.formation.grid[2][1],
    ];
    this.setEnemyPaths(enemiesList, butterfly2, 16000, 0, ROW_SEPARATION, 1);

    // second bees 1
    enemiesList = [
      this.formation.grid[3][6],
      this.formation.grid[3][2],
      this.formation.grid[3][7],
      this.formation.grid[3][3],
    ];
    this.setEnemyPaths(enemiesList, bee2, 24000, 0, 0);

    // second bees 2
    enemiesList = [
      this.formation.grid[4][6],
      this.formation.grid[4][2],
      this.formation.grid[4][7],
      this.formation.grid[4][3],
    ];
    this.setEnemyPaths(enemiesList, bee2, 24000, ROW_SEPARATION, 0, 1);

    // final bees 1
    enemiesList = [
      this.formation.grid[3][0],
      this.formation.grid[3][8],
      this.formation.grid[3][1],
      this.formation.grid[3][9],
    ];
    this.setEnemyPaths(enemiesList, bee3, 32000, 0, 0, 0.5);

    // final bees 2
    enemiesList = [
      this.formation.grid[4][0],
      this.formation.grid[4][8],
      this.formation.grid[4][1],
      this.formation.grid[4][9],
    ];
    this.setEnemyPaths(enemiesList, bee3, 32000, ROW_SEPARATION, 0, 0.5);
  }

  public isComplete() {
    let complete = true;
    for (let i = 0; i < this.formation.grid.length; i++) {
      for (let j = 0; j < this.formation.grid[i].length; j++) {
        if (this.formation.grid[i][j]) {
          complete = false;
          break;
        }
      }
    }
    return complete;
  }

  private setEnemyPaths(
    enemiesList: (Enemy | null)[],
    path: EnemyPath,
    firstDelay: number,
    dx: number,
    dy: number,
    numberOfShots: number = 0
  ) {
    let delay = firstDelay;
    let shotCount = numberOfShots * enemiesList.length;
    while (enemiesList.length > 0) {
      const willShoot = Math.random() < shotCount / enemiesList.length;
      if (willShoot) shotCount--;
      let nextEnemy = enemiesList.shift();
      if (!nextEnemy) continue;
      nextEnemy!.setPath({
        dx,
        dy,
        path: [...path],
        getFinalPosition: () => {
          return this.formation.getPositionInGrid(nextEnemy!);
        },
        delay,
        numberOfShots: willShoot ? 1 : 0,
      });
      delay += 250;
    }
  }

  update(
    deltaTime: number,
    options: {
      pauseAttack: boolean;
    }
  ) {
    this.formation.update(deltaTime);

    if (!options.pauseAttack) {
      this.elapsedTime += deltaTime;

      if (this.elapsedTime > ATTACK_DELAY - 4000) {
        if (
          this.formation.inCenter &&
          (this.formation.state == "right" || this.formation.state == "left")
        ) {
          this.formation.state = "expanding";
        }
      }

      if (this.elapsedTime > ATTACK_DELAY) {
        this.attacking = true;
      }

      if (this.attacking) {
        // if attacking, run attacks
        this.attacksList.forEach((attacks) => {
          this.runAttacks(attacks, deltaTime);
        });
      }
    }
  }

  render(context: CanvasRenderingContext2D) {
    this.formation.render(context);
  }

  getEnemies(): Enemy[] {
    // return all enemies in a single array
    var enemies: Enemy[] = [];
    this.formation.grid.forEach((row) => {
      row.forEach((enemy) => {
        if (enemy != null) {
          enemies.push(enemy);
        }
      });
    });
    return enemies;
  }

  bee_attacks: Attacks = {
    elapsed: 0,
    restartTime: 8000,
    attack_list: [0, 4000],
    activated_attacks: [],
    0: () => {
      const shotDelay1 = Math.floor(Math.random() * 1500);
      const shotDelay2 = Math.floor(
        Math.random() * SECOND_SHOT_MAX_DELAY + SECOND_SHOT_MIN_DELAY
      );
      // get leftmost active bee on row index 4, or row index 3 if none on row index 4
      let row = 4;
      if (this.formation.grid[4].every((enemy) => !enemy?.active)) row = 3;
      let bee = this.formation.grid[row].find((enemy) => enemy?.active);
      if (bee) bee.attack(beeAttackLeft, [shotDelay1, shotDelay2]);
    },
    4000: () => {
      const shotDelay1 = Math.floor(Math.random() * 1500);
      const shotDelay2 = Math.floor(
        Math.random() * SECOND_SHOT_MAX_DELAY + SECOND_SHOT_MIN_DELAY
      );
      // get rightmost active bee on row index 4
      let row = 4;
      if (this.formation.grid[4].filter((enemy) => enemy?.active).length <= 1)
        row = 3;
      let bee = this.formation.grid[row]
        .reverse()
        .find((enemy) => enemy?.active);
      this.formation.grid[row].reverse(); // reverse back
      if (bee) bee.attack(beeAttackRight, [shotDelay1, shotDelay2]);
    },
  };

  butterfly_attack_chance = 1;
  butterfly_attacks: Attacks = {
    elapsed: 0,
    restartTime: 7000,
    attack_list: [500],
    activated_attacks: [],
    500: () => {
      const shotDelay1 = Math.floor(Math.random() * 1500);
      const shotDelay2 = Math.floor(
        Math.random() * SECOND_SHOT_MAX_DELAY + SECOND_SHOT_MIN_DELAY
      );
      let row = 2;
      if (this.formation.grid[row].every((enemy) => !enemy?.active)) row = 1;
      // choose a random active butterfly in the row
      const activeButterflies = this.formation.grid[row].filter(
        (enemy) => enemy?.active
      ) as Butterfly[];
      shuffle(activeButterflies);
      let butterfly = activeButterflies[0];
      let positionInRow = this.formation.grid[row].indexOf(butterfly!);
      let path = positionInRow < 5 ? butterflyAttackLeft : butterflyAttackRight;
      if (butterfly)
        butterfly.attack(path, [shotDelay1, shotDelay2], 10, 0.14, true);
    },
  };

  boss_attack_chance = 0.5;
  boss_attacks: Attacks = {
    elapsed: 0,
    restartTime: 9000,
    attack_list: [4000],
    activated_attacks: [],
    4000: () => {
      const shotDelay1 = Math.floor(Math.random() * 1500);
      const shotDelay2 = Math.floor(
        Math.random() * SECOND_SHOT_MAX_DELAY + SECOND_SHOT_MIN_DELAY
      );

      let row = 0;
      const activeBosses = this.formation.grid[row].filter(
        (enemy) => enemy?.active
      ) as Boss[];
      if (activeBosses.length === 0) return;
      shuffle(activeBosses);
      let boss = activeBosses[0];
      let positionInRow = this.formation.grid[row].indexOf(boss!);
      let path = positionInRow < 2 ? bossAttackLeft : bossAttackLeft;

      // escorts
      // get the two butterflies closest to the boss that are in index 2 through 6
      let nearestButterflies = this.formation.grid[1]
        .slice(1, 6)
        .filter((enemy) => enemy?.active)
        .sort((a, b) => {
          let aDistance = Math.abs(a!.xPosition - boss!.xPosition);
          let bDistance = Math.abs(b!.xPosition - boss!.xPosition);
          return aDistance - bDistance;
        })
        .slice(0, Math.floor(Math.random() * 2) + 1);

      boss.escorts = nearestButterflies as Butterfly[];
      // for each escort
      boss.escorts.forEach((escort) => {
        let shootOnDelay = 0;
        let willShoot = Math.random() < this.boss_attack_chance;
        if (willShoot) {
          shootOnDelay = Math.floor(Math.random() * 1500);
        }
        escort.attack(path, shootOnDelay ? [shootOnDelay] : [], 10, 0.14, true);
      });
      if (boss) boss.attack(path, [shotDelay1, shotDelay2], 10, 0.14, true);
    },
  };

  attacksList = [this.bee_attacks, this.butterfly_attacks, this.boss_attacks];

  runAttacks(attacks: Attacks, deltaTime: number) {
    attacks.elapsed += deltaTime;
    if (attacks.elapsed > attacks.restartTime) {
      attacks.elapsed = 0;
      attacks.activated_attacks = [];
    }
    attacks.attack_list.forEach((attackTime) => {
      if (
        attacks.elapsed >= attackTime &&
        !attacks.activated_attacks.includes(attackTime)
      ) {
        attacks.activated_attacks.push(attackTime);
        attacks[attackTime]();
      }
    });
  }

  public nextWave() {
    this.events.publish<NextWave>({
      type: "NEXT_WAVE",
      payload: {
        wave: this,
      },
    });
    return new WaveBonus(this.events);
  }
}
