import { createGame } from "./game";
import { initializeDynamicImports } from "./game/systems/dynamicImports";
import { initializeMenuTextures } from "./game/views/menu/textures";
import "./style.css";

(async () => {
  await initializeMenuTextures();
  const startTime = performance.now();
  let previousTime = startTime;

  const game = createGame({
    canvas: document.querySelector("#canvas-game") as HTMLCanvasElement,
  });

  const gameLoop = (currentTime: number) => {
    const deltaTime = currentTime - previousTime;
    previousTime = currentTime;
    game.processInput(deltaTime);
    game.update(deltaTime);
    game.render();
    requestAnimationFrame(gameLoop);
  };

  requestAnimationFrame(gameLoop);

  // load dynamic imports in the background
  initializeDynamicImports();
})();
