import { GameViewApi } from "../../../types";
import { Audio } from "../../systems/dynamicImports/audio";
import { EventSystem } from "../../systems/events";
import { GameScreenChanged } from "../../systems/events/types/GameScreenChanged";
import { createKeyboardSystem } from "../../systems/input/keyboard";
import { createMouseSystem } from "../../systems/input/mouse";

export const pathMakerScreen = ({
  canvas,
  context,
  events,
}: {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  events: EventSystem;
}): GameViewApi => {
  const keyboard = createKeyboardSystem();
  keyboard.subscribe({
    key: "exit",
    type: "keydown",
    callback: () => {
      Audio().play({ key: "input" });
      events.publish<GameScreenChanged>({
        type: "GAME_SCREEN_CHANGED",
        payload: {
          screen: "menu",
        },
      });
    },
  });

  let coordinates: { x: number; y: number }[] = [];

  keyboard.subscribe({
    key: "fire",
    type: "keydown",
    callback: () => {
      coordinates = [];
      console.log(JSON.stringify(coordinates));
    },
  });

  keyboard.subscribe({
    key: "left",
    type: "keydown",
    callback: () => {
      coordinates = coordinates.slice(0, coordinates.length - 1);
      console.log(JSON.stringify(coordinates));
    },
  });

  const mouse = createMouseSystem({ canvas });

  mouse.onClick({
    area: {
      type: "box",
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
    },
    callback: (x, y) => {
      coordinates.push({ x, y });
      console.log(JSON.stringify(coordinates));
    },
  });

  return {
    dispose: () => {
      keyboard.dispose();
      mouse.dispose();
    },
    update: () => {},
    processInput: (deltaTime) => {
      keyboard.update(deltaTime);
      mouse.update();
    },
    render: () => {
      context.fillStyle = "red";
      if (coordinates.length === 0) return;
      for (const { x, y } of coordinates) context.fillRect(x - 5, y - 5, 10, 10);

      context.strokeStyle = "red";
      context.beginPath();
      context.moveTo(coordinates[0].x, coordinates[0].y);
      for (let i = 1; i < coordinates.length; i++) {
        context.lineTo(coordinates[i].x, coordinates[i].y);
      }
      context.stroke();
      context.closePath();
    },
  };
};
