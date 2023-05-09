import { EventSystem } from "../../../../systems/events";
import { EnemyDestroyedEvent } from "../../../../systems/events/types/EnemyDestroyed";
import { Enemy } from "../enemy";

// waves are to be composed of a formationGrid 
// and enemies on specific timings with paths ending in their grid position

const CANVAS_WIDTH = 768;
const START_Y = 100;
const EXPANDING_SPEED = 0.005;
const MOVING_SPEED = 0.008;

export class FormationGrid {

    enemyGap: { x: number, y: number };
    state: "expanded" | "expanding" | "contracted" | "contracting" | "left" | "right";
    inCenter: boolean;
    rows: number;
    grid: (Enemy | null)[][];
    private onDispose: VoidFunction[];
    gridCenter: number;


    constructor(
        rows: number, 
        grid: Enemy[][],
        events: EventSystem
        ) {
        this.enemyGap = { x: 5, y: 5 };
        this.state = "left";
        this.inCenter = false;
        this.rows = rows | 5;
        this.grid = grid;
        this.gridCenter = (CANVAS_WIDTH / 2);

        this.onDispose = [];
        this.onDispose.push(
            events.subscribe<EnemyDestroyedEvent>({
                type: "ENEMY_DESTROYED",
                callback: (event) => {
                    for (let i = 0; i < this.grid.length; i++) {
                        if (this.grid[i].includes(event.payload.enemy)) {
                            this.grid[i].splice(this.grid[i].indexOf(event.payload.enemy), 1, null);
                            break;
                        }
                    }
                },
            })
        );
    }

    public dispose() {
        this.onDispose.forEach((dispose) => dispose());
    }

    // returns the x y position of an enemy based on the grid
    // the grid will have enemies centered in the middle of the screen, 
    // evently spaced out by the current enemyGap on top and bottom and the size of the enemy
    getPositionInGrid(enemy: Enemy) {
        // find the enemy's position in the grid
        let enemyPosition = 0;
        let enemiesInRow = 0;
        let rowNumber = 0;
        for (let i = 0; i < this.grid.length; i++) {
            if (this.grid[i].includes(enemy)) {
                rowNumber = i;
                enemiesInRow = this.grid[i].length;
                enemyPosition = this.grid[i].indexOf(enemy);
            }
        }

        let gridCenterTop = { x: this.gridCenter + (enemy.width / 15) , y: START_Y };

        let enemyPositionOnScreen = { x: 0, y: 0 };
        if (enemyPosition > enemiesInRow / 2) {
            enemyPositionOnScreen.x = gridCenterTop.x + ((enemyPosition - (enemiesInRow / 2)) * (enemy.width + this.enemyGap.x));
        } else {
            enemyPositionOnScreen.x = gridCenterTop.x - (((enemiesInRow / 2) - enemyPosition) * (enemy.width + this.enemyGap.x));
        }
        enemyPositionOnScreen.y = gridCenterTop.y + (rowNumber * (enemy.height + this.enemyGap.y));

        return enemyPositionOnScreen;
    }

    update(deltaTime: number) {
        // increase and decrease the enemyGap on a set interval to create the breathing effect
        if (this.state == "expanding") {
            this.gridCenter = (CANVAS_WIDTH / 2);
            this.enemyGap.x += EXPANDING_SPEED * deltaTime;
            this.enemyGap.y += EXPANDING_SPEED * deltaTime;
            if (this.enemyGap.x >= 15) {
                this.state = "contracting";
            }
        } else if (this.state == "contracting") {
            this.enemyGap.x -= EXPANDING_SPEED * deltaTime;
            this.enemyGap.y -= EXPANDING_SPEED * deltaTime;
            if (this.enemyGap.x <= 4) {
                this.state = "expanding";
            }
        }

        if (this.state == "right") {
            this.gridCenter += MOVING_SPEED * deltaTime;
            if (this.gridCenter - (CANVAS_WIDTH / 2) >= 30) {
                this.state = "left";
            }
        } else if (this.state == "left") {
            this.gridCenter -= MOVING_SPEED * deltaTime;
            if ((CANVAS_WIDTH / 2) - this.gridCenter >= 30) {
                this.state = "right";
            }
        }
        if (this.gridCenter - (CANVAS_WIDTH / 2) < 14 && (CANVAS_WIDTH / 2) - this.gridCenter < 14) {
            this.inCenter = true;
        } else {
            this.inCenter = false;
        }

        // update all enemies in formation
        this.grid.forEach((row) => { // update enemies depending on state
            row.forEach((enemy) => {
                if (!enemy) return;
                if (enemy.state == "formation") {
                    enemy.update(deltaTime);
                    enemy.xPosition = this.getPositionInGrid(enemy).x;
                    enemy.yPosition = this.getPositionInGrid(enemy).y;
                }
                else if (enemy.state == "diving") {
                    enemy.update(deltaTime);
                }
            })
        })
    }

    // render all enemies in formation
    render(context: CanvasRenderingContext2D) {
        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                this.grid[i][j]?.render(context);
            }
        }
    }
}


