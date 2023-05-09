export const renderTitle = ({
  canvas,
  context,
  text,
  fontSize = 96,
}: {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  text: string;
  fontSize?: number;
}) => {
  context.save();

  context.textBaseline = "top";
  context.textAlign = "center";
  context.fillStyle = "white";
  context.font = `${fontSize}px Emulogic, monospace`;
  context.fillText(text, canvas.width / 2, Math.floor(canvas.height * 0.1));

  context.restore();
};
