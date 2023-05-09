import { Scripts } from "../../systems/dynamicImports/scripts";
import { renderTitle } from "../components/text";

export const renderCredits = ({
  context,
  canvas,
  exitKey,
}: {
  context: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  exitKey: string;
}) => {
  context.save();

  renderTitle({ canvas, context, text: "Credits", fontSize: 56 });

  context.textBaseline = "top";
  context.fillStyle = "white";
  context.textAlign = "center";
  context.font = `32px Emulogic, monospace`;

  const lineHeight = context.measureText("m").width * 2.25;

  const { canvasTxt } = Scripts();
  canvasTxt.align = "center";
  canvasTxt.lineHeight = 48;
  canvasTxt.font = `32px Emulogic, monospace`;
  canvasTxt.vAlign = "top";
  canvasTxt.drawText(
    context,
    "by Caden Harris and Kollin Murphy for USU CS5410",
    canvas.width / 8,
    canvas.height / 2 - lineHeight * 2.25,
    (canvas.width * 3) / 4,
    canvas.height / 2
  );

  context.font = `24px Emulogic, monospace`;
  context.textBaseline = "bottom";
  context.fillText(
    `Press ${exitKey} to return`,
    canvas.width / 2,
    canvas.height - 50
  );

  context.restore();
};
