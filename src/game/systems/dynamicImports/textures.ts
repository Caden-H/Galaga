export type TextureMap = {
  enemies: {
    1: HTMLImageElement;
    2: HTMLImageElement;
    3: HTMLImageElement;
    4: HTMLImageElement;
  };
  projectiles: {
    mine: HTMLImageElement;
    theirs: HTMLImageElement;
  };
  ship: HTMLImageElement;
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

export const initializeTextures = async () => {
  const [
    enemy1,
    enemy2,
    enemy3,
    enemy4,
    myProjectile,
    myShip,
    theirProjectile,
  ] = await Promise.all(
    [
      "1.png",
      "2.png",
      "3.png",
      "4.png",
      "my-projectile.png",
      "ship.png",
      "their-projectile.png",
    ].map((src) => loadTexture(`./assets/img/${src}`))
  ).catch((error) => {
    console.error(error);
    throw new Error("Could not load textures");
  });
  const map: TextureMap = {
    enemies: {
      1: enemy1,
      2: enemy2,
      3: enemy3,
      4: enemy4,
    },
    projectiles: {
      mine: myProjectile,
      theirs: theirProjectile,
    },
    ship: myShip,
  };
  textures = map;
};

let textures: TextureMap | undefined;

export const Textures = () => textures!;
