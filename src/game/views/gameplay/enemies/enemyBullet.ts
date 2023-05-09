import { Textures } from "../../../systems/dynamicImports/textures";
import { Ship, SHIP_SPRITE_SIZE } from "../ship";

const SPRITE_SIZE = 48;
const ERROR_FACTOR = 10;
const MAX_LIFE = 8000;

export class EnemyBullet {
  image: HTMLImageElement;
  width: number;
  height: number;
  xPosition: number;
  yPosition: number;
  active: boolean;
  speed: number;
  direction: { x: number; y: number };
  elapsedTime: number;

  constructor(x: number, y: number, ship: Ship) {
    this.elapsedTime = 0;
    this.image = Textures().projectiles.theirs;
    this.width = SPRITE_SIZE;
    this.height = SPRITE_SIZE;
    this.xPosition = x;
    this.yPosition = y;
    this.active = true;
    this.speed = 0.4;

    // calculate unit direction from x,y to ship
    const direction = {
      x:
        ship.xPosition() +
        SHIP_SPRITE_SIZE / 2 -
        x +
        Math.random() * ERROR_FACTOR,
      y: ship.yPosition() + SHIP_SPRITE_SIZE / 2 - y,
    };
    const magnitude = Math.sqrt(
      direction.x * direction.x + direction.y * direction.y
    );
    this.direction = {
      x: direction.x / magnitude,
      y: direction.y / magnitude,
    };
  }

  render(context: CanvasRenderingContext2D) {
    if (!this.active) return;
    context.save();
    context.translate(
      this.xPosition + this.width / 2,
      this.yPosition + this.height / 2
    );
    context.rotate(
      Math.atan2(this.direction.y, this.direction.x) + Math.PI / 2
    );
    context.drawImage(
      this.image,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );
    context.restore();
  }

  update(deltaTime: number) {
    if (!this.active) return;
    this.elapsedTime += deltaTime;
    if (this.elapsedTime > MAX_LIFE || this.yPosition > 1500)
      this.active = false;
    if (this.active) {
      this.xPosition += this.direction.x * this.speed * deltaTime;
      this.yPosition += this.direction.y * this.speed * deltaTime;
    }
  }
}
