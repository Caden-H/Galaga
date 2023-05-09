import type canvasTxt from "canvas-txt";
import type color from "color";
import type { attractScreen } from "../../views/attract";
import type { creditsScreen } from "../../views/credits";
import type { gameplayScreen } from "../../views/gameplay";
import type { highScoresScreen } from "../../views/highScores";
import type { controlsScreen } from "../../views/controls";

type Scripts = {
  canvasTxt: typeof canvasTxt;
  color: typeof color;
  screens: {
    credits: typeof creditsScreen;
    highScores: typeof highScoresScreen;
    controls: typeof controlsScreen;
    gameplay: typeof gameplayScreen;
    attract: typeof attractScreen;
  };
};

export const initializeScripts = async () => {
  const [
    canvasTxt,
    color,
    creditsScreen,
    highScoresScreen,
    controlsScreen,
    gameplayScreen,
    attractScreen,
  ] = await Promise.all([
    import("canvas-txt"),
    import("color"),
    import("../../views/credits"),
    import("../../views/highScores"),
    import("../../views/controls"),
    import("../../views/gameplay"),
    import("../../views/attract"),
  ]).catch((error) => {
    console.error(error);
    throw new Error("Could not load scripts");
  });
  scripts = {
    canvasTxt: canvasTxt.default,
    color: color.default,
    screens: {
      credits: creditsScreen.creditsScreen,
      highScores: highScoresScreen.highScoresScreen,
      controls: controlsScreen.controlsScreen,
      gameplay: gameplayScreen.gameplayScreen,
      attract: attractScreen.attractScreen,
    },
  };
};

let scripts: Scripts | undefined;

export const Scripts = () => scripts!;
