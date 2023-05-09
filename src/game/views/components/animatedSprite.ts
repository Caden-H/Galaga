export const createAnimatedSprite = ({
  texture,
  frames,
  frameDuration,
}: {
  texture: HTMLImageElement;
  frames: number;
  frameDuration: number;
}) => {
  let currentFrame = 0;
  let frameCounter = 0;
  const textureWidth = texture.width / frames;
  const textureHeight = texture.height;

  return {
    update: (deltaTime: number) => {
      frameCounter += deltaTime;
      if (frameCounter >= frameDuration) {
        frameCounter -= frameDuration;
        currentFrame = (currentFrame + 1) % frames;
      }
    },
    render: ({
      context,
      x,
      y,
      width,
      height,
      rotation,
    }: {
      context: CanvasRenderingContext2D;
      x: number;
      y: number;
      width: number;
      height: number;
      rotation: number;
    }) => {
      // TODO: fix rotation
      context.save();
      context.translate(x + width / 2, y + height / 2);
      context.rotate(rotation + Math.PI / 2);
      context.drawImage(
        texture,
        textureWidth * currentFrame,
        0,
        textureWidth,
        textureHeight,
        -width / 2,
        -height / 2,
        width,
        height
      );
      context.restore();
    },
  };
};

export type AnimatedSprite = ReturnType<typeof createAnimatedSprite>;
