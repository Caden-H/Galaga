import { EnemyPath } from "./types";

import { CANVAS_WIDTH } from "./types.d";

// start above, go down and to the left, then spiral right and up
export const butterfly1: EnemyPath = [
    { x: CANVAS_WIDTH / 2 - 50, y: -25 },
    { x: CANVAS_WIDTH / 2 , y: 200 },
    { x: CANVAS_WIDTH / 6 * 5 , y: 500 },
    { x: CANVAS_WIDTH / 6 * 5 + 15, y: 555 },
    { x: CANVAS_WIDTH / 6 * 5 , y: 610 },
    { x: CANVAS_WIDTH / 6 * 5 - 15, y: 625 },
    { x: CANVAS_WIDTH / 6 * 5 - 30, y: 630 },
    { x: CANVAS_WIDTH / 6 * 5 - 45, y: 630 },
    { x: CANVAS_WIDTH / 6 * 5 - 60, y: 625 },
    { x: CANVAS_WIDTH / 6 * 5 - 75, y: 610 },
    { x: CANVAS_WIDTH / 2 + 20, y: 400 },
];
