const STAR_COUNT = 250;
const MAX_STAR_SIZE = 10;

export const createStarBackground = ({
  canvas,
  context,
}: {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
}) => {
  let flickers = [] as Array<{ index: number; opacity: number; ms: number }>;

  const particles = Array.from({ length: STAR_COUNT }, () => {
    const distance = Math.random() * 30 + 1; // 1-300
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.ceil(MAX_STAR_SIZE / distance),
      speed: 0.25 / distance,
      opacity: Math.random() * 0.3 + 0.1,
    };
  });

  return {
    render: () => {
      context.fillStyle = "black";
      context.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        context.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        context.beginPath();
        context.fillRect(particle.x, particle.y, particle.size, particle.size);
        context.closePath();
      }
    },
    update: (deltaTime: number) => {
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        particle.y += particle.speed * deltaTime;
        if (particle.y > canvas.height) {
          particle.x = Math.random() * canvas.width;
          particle.y = -particle.size;
        }

        // randomly change the opacity to simulate a flickering star
        if (Math.random() < 0.01) {
          flickers.push({
            index: i,
            opacity: particle.opacity,
            ms: 100,
          });
          particle.opacity = Math.random() * 0.3 + 0.1;
        }
      }

      for (let i = 0; i < flickers.length; i++) {
        const flicker = flickers[i];
        flicker.ms -= deltaTime;
        if (flicker.ms <= 0) particles[flicker.index].opacity = flicker.opacity;
      }
      flickers = flickers.filter((flicker) => flicker.ms > 0);
    },
  };
};

export type StarBackground = ReturnType<typeof createStarBackground>;
