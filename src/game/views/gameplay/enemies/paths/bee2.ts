import { EnemyPath } from "./types";
import { CANVAS_WIDTH } from "./types.d";

// start from bottom left side
export const bee2: EnemyPath = [
    { x: CANVAS_WIDTH/2 + 20, y: -40 },
    { x: CANVAS_WIDTH/2 + 20, y: 140 },
    { x: CANVAS_WIDTH/2 - 20, y: 190 },
    { x: 100, y: 360 },
    { x: 80, y: 430 },
    { x: 100, y: 500 },
    { x: 140, y: 550 },
    { x: 200, y: 580 },
    { x: 260, y: 580 },
    { x: 320, y: 550 },
    { x: 360, y: 500 },
];
