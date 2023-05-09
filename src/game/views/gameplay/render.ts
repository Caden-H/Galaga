import { GameplayState } from "./types";

export const renderGame = ({
  context,
  canvas,
  score,
  highScore,
  state,
  achievedHighScore,
  shotsFired,
  shotsHit,
  wave,
}: {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  score: number;
  highScore: number;
  state: GameplayState["state"];
  achievedHighScore: boolean;
  shotsFired: number;
  shotsHit: number;
  wave: { count: number; showing: boolean };
}) => {
  context.save();
  context.font = `24px Emulogic, monospace`;
  context.fillStyle = "white";
  context.textAlign = "left";
  context.textBaseline = "top";
  context.fillText(`${score}`, 100, 40);

  context.textAlign = "center";
  context.fillStyle = "red";
  context.fillText("HIGH SCORE", canvas.width / 2, 10);
  context.fillStyle = "white";
  const actualHighScore = Math.max(score, highScore);
  context.fillText(`${actualHighScore}`, canvas.width / 2, 40);

  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `36px Emulogic, monospace`;
  switch (state) {
    case "readying":
      context.fillText("READY", canvas.width / 2, canvas.height / 2);
      break;
    case "gameover":
      context.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
      context.font = `24px Emulogic, monospace`;
      if (achievedHighScore)
        context.fillText(
          "NEW HIGH SCORE",
          canvas.width / 2,
          canvas.height / 2 + 40
        );
      context.fillText(
        `${shotsFired} shots fired`,
        canvas.width / 2,
        canvas.height / 2 + 80
      );
      context.fillText(
        `${shotsHit} shots hit`,
        canvas.width / 2,
        canvas.height / 2 + 120
      );
      const percentHit = Math.round((shotsHit / shotsFired) * 100) || 0;
      context.fillText(
        `${percentHit}% shots hit`,
        canvas.width / 2,
        canvas.height / 2 + 160
      );
      context.textBaseline = "bottom";
      context.fillText("press escape", canvas.width / 2, canvas.height - 10);
      break;
  }

  if (wave.showing) {
    
    context.fillStyle = "lightblue";
    context.fillText(
      wave.count % 3 == 0 ? ("CHALLENGE") : ("STAGE " + wave.count), 
      canvas.width / 2, 
      canvas.height / 2 - 50);
  }


  context.restore();
};
