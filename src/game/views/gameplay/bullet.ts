import { Textures } from "../../systems/dynamicImports/textures";
import { EventSystem } from "../../systems/events";
import { BulletHitEnemy } from "../../systems/events/types/BulletHitEnemy";
import { Enemy } from "./enemies/enemy";

const SPRITE_SIZE = 48;

export class Bullet {
  private events: EventSystem;
  image: HTMLImageElement;
  width: number;
  height: number;
  xPosition: number;
  yPosition: number;
  active: boolean;
  speed: number;
  charged: boolean; // super charge bullets that are timed well

  constructor(x: number, y: number, events: EventSystem, charged?: boolean) {
    this.image = Textures().projectiles.mine;
    this.width = SPRITE_SIZE;
    this.height = SPRITE_SIZE;
    this.xPosition = x;
    this.yPosition = y;
    this.active = true;
    this.speed = 1;
    this.events = events;
    this.charged = charged || false;
  }

  render(context: CanvasRenderingContext2D) {
    context.drawImage(
      this.image,
      this.xPosition - (this.charged ? this.width * 0.25 : 0),
      this.yPosition - (this.charged ? this.height * 0.25 : 0),
      this.width * (this.charged ? 1.5 : 1),
      this.height * (this.charged ? 1.5 : 1)
    );
  }

  update(deltaTime: number, enemies: Enemy[]) {
    if (this.yPosition < 0 - this.height) this.active = false;
    if (this.active) this.yPosition -= this.speed * deltaTime;

    // check for collision with enemies
    enemies.forEach((enemy) => {
      let centerX = this.xPosition + this.width / 2;
      let centerY = this.yPosition + this.height / 2;
      if (
        centerX - this.width * .25 < enemy.xPosition + enemy.width * 0.75 &&
        centerX + this.width * .25 > enemy.xPosition + enemy.width * 0.25 &&
        centerY < enemy.yPosition + enemy.height * 0.9 &&
        centerY + this.height * .25 > enemy.yPosition
      ) {
        this.events.publish<BulletHitEnemy>({
          type: "BULLET_HIT_ENEMY",
          payload: {
            enemy,
          },
        });
        // charged bullets go through enemies
        if (!this.charged) this.active = false; 
      }
    });
  }
}
