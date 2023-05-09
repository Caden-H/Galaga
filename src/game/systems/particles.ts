import type Color from "color";
import { Scripts } from "./dynamicImports/scripts";

export type Particle = {
  elapsedTime: number;
  lifetime: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  color: Color<string>;
  direction: {
    x: number;
    y: number;
  };
};

type EffectType = "enemy-destroyed" | "player-destroyed" | "new-ship";
type EffectOptions = {
  type: EffectType;
  x: number;
  y: number;
};

export type ParticleSystem = {
  update: (deltaTime: number) => void;
  addEffect: (options: EffectOptions) => void;
  render: (context: CanvasRenderingContext2D) => void;
};

const mapTypeToColor = (type: EffectType) => {
  switch (type) {
    case "enemy-destroyed":
      return Scripts().color("red");
    case "player-destroyed":
      return Scripts().color("#eeeeff");
    case "new-ship":
      return Scripts().color("green");
  }
};

const mapTypeToCount = (type: EffectType) => {
  switch (type) {
    case "enemy-destroyed":
      return 100;
    case "player-destroyed":
      return 200;
    case "new-ship":
      return 50;
  }
};

const mapTypeToMaxSpeed = (type: EffectType) => {
  switch (type) {
    case "enemy-destroyed":
      return 0.15;
    case "player-destroyed":
      return 0.25;
    case "new-ship":
      return 0.1;
  }
};

const mapTypeToDuration = (type: EffectType) => {
  switch (type) {
    case "enemy-destroyed":
      return { min: 250, random: 500 };
    case "player-destroyed":
      return { min: 750, random: 1000 };
    case "new-ship":
      return { min: 500, random: 250 };
  }
};

export const createParticleSystem = () => {
  let particles: Particle[] = [];

  const handleCreateParticles = (options: {
    type: EffectType;
    x: number;
    y: number;
  }) => {
    const particleCount = mapTypeToCount(options.type);
    const maxSpeed = mapTypeToMaxSpeed(options.type);
    const duration = mapTypeToDuration(options.type);
    const { x, y } = options;
    for (let i = 0; i < particleCount; i++) {
      const particleSize = Math.floor(Math.random() * 2 + 1);
      const particleSpeed = Math.random() * maxSpeed;
      const particleLifetime = Math.random() * duration.random + duration.min;
      const particleDirection = Math.random() * Math.PI * 2;
      const particleDirectionX = Math.cos(particleDirection);
      const particleDirectionY = Math.sin(particleDirection);
      const particle: Particle = {
        elapsedTime: 0,
        lifetime: particleLifetime,
        color: mapTypeToColor(options.type).darken(Math.random() * 0.2),
        x,
        y,
        size: particleSize * (Math.random() + 1),
        speed: particleSpeed,
        direction: {
          x: particleDirectionX,
          y: particleDirectionY,
        },
      };
      particles.push(particle);
    }
  };

  return {
    update: (deltaTime: number) => {
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        particle.x += particle.direction.x * particle.speed * deltaTime;
        particle.y += particle.direction.y * particle.speed * deltaTime;
        particle.elapsedTime += deltaTime;
      }
      particles = particles.filter((p) => p.elapsedTime < p.lifetime);
    },
    render: (context: CanvasRenderingContext2D) => {
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        const percentLifetime = particle.elapsedTime / particle.lifetime;
        context.beginPath();
        const alpha = 1 - percentLifetime;
        const color = `rgba(${particle.color.red()}, ${particle.color.green()}, ${particle.color.blue()}, ${alpha})`;
        context.fillStyle = color;
        context.strokeStyle = color;
        context.fillRect(particle.x, particle.y, particle.size, particle.size);
        context.strokeRect(
          particle.x,
          particle.y,
          particle.size,
          particle.size
        );
        context.closePath();
      }
    },
    addEffect: (options: EffectOptions) => {
      handleCreateParticles({
        type: options.type,
        x: options.x,
        y: options.y,
      });
    },
  };
};
