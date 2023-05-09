import { HighScore, MAX_SCORES_TO_SAVE } from "../../systems/scoring";
import { renderTitle } from "../components/text";
import {format} from 'date-fns';

export const renderHighScores = ({
  context,
  canvas,
  highScores,
  exitKey,
}: {
  highScores: HighScore[];
  context: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  exitKey: string;
}) => {
  context.save();

  renderTitle({ canvas, context, text: "High Scores", fontSize: 56 });

  context.textBaseline = "top";
  context.fillStyle = "white";
  context.textAlign = "center";

  context.font = `24px Emulogic, monospace`;
  const scoreLineHeight = context.measureText("m").width * 2;
  const scores = highScores;

  for (let i = 0; i < MAX_SCORES_TO_SAVE; i++) {
    const score = scores[i];
    const y = canvas.height * 0.34 + scoreLineHeight * i;
    if (score)
      context.fillText(
        `${format(new Date(score.date), 'yyyy-MM-dd')}: ${score.score} points`,
        canvas.width / 2,
        y
      );
    else context.fillText("-", canvas.width / 2, y);
  }

  context.font = `24px Emulogic, monospace`;
  context.textBaseline = "bottom";
  context.fillText(
    `Press ${exitKey} to return`,
    canvas.width / 2,
    canvas.height - 50
  );

  context.restore();
};
