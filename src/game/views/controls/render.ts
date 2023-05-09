import { Scripts } from "../../systems/dynamicImports/scripts";
import { Key, KeyMapping } from "../../systems/input/keyboard";
import { renderTitle } from "../components/text";

export const getKeyConfigPosition = ({
  canvas,
  index,
}: {
  canvas: HTMLCanvasElement;
  index: number;
}) => {
  const x = canvas.width / 2 - 30;
  const width = canvas.width / 3;
  const y = canvas.height / 4 + index * 75;
  const height = 50;
  return { x, y, width, height };
};

const renderKeyConfig = ({
  context,
  canvas,
  key,
  mapping,
  index,
  hover,
  editing,
}: {
  context: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  key: Key;
  mapping: KeyMapping;
  index: number;
  hover: boolean;
  editing: boolean;
}) => {
  const position = getKeyConfigPosition({ canvas, index });
  const color = Scripts().color;
  context.fillStyle = editing
    ? color("green").lighten(0.4).hex()
    : hover
    ? color("white").darken(0.2).hex()
    : "white";
  context.fillRect(position.x, position.y, position.width, position.height);
  context.font = `24px Emulogic, monospace`;
  context.fillStyle = "black";
  context.textAlign = "center";
  context.fillText(
    mapping[key],
    position.x + position.width / 2,
    position.y + position.height / 2
  );
  context.font = `32px Emulogic, monospace`;
  context.fillStyle = "white";
  context.textAlign = "right";
  context.textBaseline = "middle";
  context.fillText(key, position.x - 25, position.y + position.height / 2);
};

export const renderControlsScreen = ({
  canvas,
  context,
  mapping,
  hover,
  editing,
  exitKey,
}: {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  mapping: KeyMapping;
  hover: Key | null;
  editing: Key | null;
  exitKey: string;
}) => {
  renderTitle({ canvas, context, text: "Controls", fontSize: 56 });

  for (let i = 0; i < Object.keys(mapping).length; i++) {
    const key = Object.keys(mapping)[i] as Key;
    renderKeyConfig({
      context,
      canvas,
      key,
      mapping,
      index: i,
      hover: hover === key && !editing,
      editing: editing === key,
    });
  }

  const info = editing ? "Press a key" : "Click to edit";
  context.font = `24px Emulogic, monospace`;
  context.fillStyle = "white";
  context.textAlign = "center";
  context.fillText(info, canvas.width / 2, canvas.height - 175);
  if (!editing)
    context.fillText(
      `Press ${exitKey} to return`,
      canvas.width / 2,
      canvas.height - 50
    );
};
