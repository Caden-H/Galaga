import { initializeAudio } from "./audio";
import { initializeScripts } from "./scripts";
import { initializeTextures } from "./textures";

let initialized = false;

export const initializeDynamicImports = async () => {
  if (initialized) return;
  initialized = true;
  await Promise.all([
    initializeTextures(),
    initializeAudio(),
    initializeScripts(),
  ]);
};
