export type MenuTextureMap = {
  enemies: {
    4: HTMLImageElement;
  };
};

const loadTexture = (src: string): Promise<HTMLImageElement> => {
  const texture = new Image();
  texture.src = src;
  return new Promise((resolve, reject) => {
    texture.onload = () => {
      resolve(texture);
    };
    texture.onerror = () => {
      reject(`Could not load texture ${src}`);
    };
  });
};

export const initializeMenuTextures = async () => {
  const [enemy4] = await Promise.all(
    ["4.png"].map((src) => loadTexture(`./assets/img/${src}`))
  ).catch((error) => {
    console.error(error);
    throw new Error("Could not load textures");
  });
  const map: MenuTextureMap = {
    enemies: {
      4: enemy4,
    },
  };
  textures = map;
};

let textures: MenuTextureMap | undefined;

export const MenuTextures = () => textures!;
