import { EnemyPath } from "./types";

// start above, go down and to the left, then spiral right and up
export const curve0Path: EnemyPath = [
  { x: 0, y: 0 },
  { x: -100, y: 100 },
  { x: -100, y: 300 },
  { x: -50, y: 350 },
  { x: -25, y: 350 },
  { x: 0, y: 325 },
  { x: 50, y: 300 },
];
