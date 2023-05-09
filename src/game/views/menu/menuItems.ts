import { GameScreenEnum } from "../../../types";

export const menuItems: Array<{
  label: string;
  value: GameScreenEnum;
}> = [
  { label: "New Game", value: "game" },
  { label: "High Scores", value: "high-scores" },
  { label: "Controls", value: "options" },
  { label: "Credits", value: "credits" },
];
