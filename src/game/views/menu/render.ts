import { GameScreenEnum } from "../../../types";
import { BoundingBox } from "../../systems/input/mouse";
import { AnimatedSprite } from "../components/animatedSprite";
import { renderTitle } from "../components/text";
import { menuItems } from "./menuItems";

const SELECTION_COLOR = "#007700";
const SPRITE_SIZE = 48;

export const getMenuItemPosition = (
  i: number,
  canvas: HTMLCanvasElement
): BoundingBox => {
  const textStart = canvas.height * 0.3;
  const textEnd = canvas.height * 0.8;
  const lineHeight = (textEnd - textStart) / (menuItems.length + 2);
  return {
    x: canvas.width / 4,
    y: textStart + (i + 1) * lineHeight,
    width: canvas.width / 2,
    height: lineHeight,
    type: "box",
  };
};

export const renderMenu = ({
  canvas,
  context,
  currentSelection,
  selectionSprite,
}: {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  currentSelection: GameScreenEnum;
  selectionSprite: AnimatedSprite;
}) => {
  context.save();

  renderTitle({ canvas, context, text: "Galaga" });

  context.font = `32px Emulogic, monospace`;
  context.textAlign = "center";
  context.textBaseline = "middle";

  context.save();
  for (let i = 0; i < menuItems.length; i++) {
    const { label, value } = menuItems[i];
    const box = getMenuItemPosition(i, canvas);
    context.fillStyle = value === currentSelection ? SELECTION_COLOR : "white";
    if (value === currentSelection) {
      selectionSprite.render({
        context,
        x: box.x - SPRITE_SIZE,
        y: box.y + box.height / 2 - SPRITE_SIZE / 2,
        width: SPRITE_SIZE,
        height: SPRITE_SIZE,
        rotation: 3 * Math.PI / 2,
      });
      selectionSprite.render({
        context,
        x: box.x + box.width + SPRITE_SIZE,
        y: box.y + box.height / 2 - SPRITE_SIZE / 2,
        width: SPRITE_SIZE,
        height: SPRITE_SIZE,
        rotation: 3 * Math.PI / 2,
      });
    }
    context.fillText(label, box.x + box.width / 2, box.y + box.height / 2);
  }
  context.restore();

  context.textAlign = "center";
  context.font = `32px Emulogic, monospace`;
  context.fillStyle = "white";
  context.textBaseline = "bottom";

  context.fillText(
    "© 2023 Caden Harris",
    canvas.width / 2,
    canvas.height - 100
  );
  context.fillText("& Kollin Murphy", canvas.width / 2, canvas.height - 50);

  context.restore();
};
