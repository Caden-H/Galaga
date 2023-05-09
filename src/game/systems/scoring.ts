import { EnemyVariant } from "../views/gameplay/enemies/enemy";
import { EventSystem } from "./events";
import { EnemyDestroyedEvent } from "./events/types/EnemyDestroyed";
import { GameOverEvent } from "./events/types/GameOver";
import {
  getFromStorage,
  removeFromStorage,
  saveToStorage,
} from "./localStorage";

export type HighScore = {
  date: number;
  score: number;
};

const STORAGE_KEY = "usu-galaga-kollin-caden-high-scores-2";
export const MAX_SCORES_TO_SAVE = 5;

export const getHighScores = (): HighScore[] => {
  const highScores = getFromStorage<HighScore[]>({
    key: STORAGE_KEY,
    defaultValue: [],
  });
  highScores.sort((a, b) => b.score - a.score);
  console.log("returning", highScores);
  if (highScores.length == 0) return [{date: 0, score: 0}];
  return highScores;
};

const saveScoreIfHighScore = (score: HighScore): "no-high-score" | "saved" => {
  console.log("score passed in: ", score)
  const scores = getHighScores();
  if (
    scores.length < MAX_SCORES_TO_SAVE ||
    score.score > scores[scores.length - 1].score
  ) {
    const isHighestScore = score.score > scores[0].score;
    const newScores = [...scores, score]
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_SCORES_TO_SAVE);
    saveToStorage<HighScore[]>({
      key: STORAGE_KEY,
      value: newScores,
    });
    return isHighestScore ? "saved" : "no-high-score";
  }
  return "no-high-score";
};

export const resetHighScores = () => {
  removeFromStorage({ key: STORAGE_KEY });
};

type VariantScores = {
  diving: number;
  formation: number;
};

export const createScoreSystem = (
  events: EventSystem,
  options?: {
    attractMode: boolean;
  }
) => {
  const highScores = getHighScores();
  const dispose: VoidFunction[] = [];
  let score = 0;
  let achievedHighScore = false;

  const scores = new Map<EnemyVariant, VariantScores>();
  scores.set("bee", { formation: 50, diving: 100 });
  scores.set("butterfly", { formation: 80, diving: 160 });
  scores.set("boss", { formation: 150, diving: 400 });

  dispose.push(
    events.subscribe<EnemyDestroyedEvent>({
      type: "ENEMY_DESTROYED",
      callback: (event) => {
        const formation = event.payload.enemy.inFormation;
        const variant = event.payload.enemy.variant;
        const escorts = event.payload.enemy.escortCount;
        const variantScore = scores.get(variant);
        if (!variantScore)
          throw new Error("Missing score data for enemy variant");
        const scoreValue = formation
          ? variantScore.formation
          : variantScore.diving * Math.pow(2, escorts);
        score += scoreValue;
      },
    })
  );

  if (!options?.attractMode) {
    dispose.push(
      events.subscribe<GameOverEvent>({
        type: "GAME_OVER",
        callback: () => {
          if (saveScoreIfHighScore({ date: Date.now(), score }) === "saved")
            achievedHighScore = true;
        },
      })
    );
  }

  return {
    dispose: () => dispose.forEach((dispose) => dispose()),
    get score() {
      return score;
    },
    get achievedHighScore() {
      return achievedHighScore;
    },
    get highScore() {
      return highScores[0]?.score ?? 0;
    },
  };
};

export type Score = ReturnType<typeof createScoreSystem>;
