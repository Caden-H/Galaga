import { Textures } from "../../../systems/dynamicImports/textures";
import { EventSystem } from "../../../systems/events";
import { EnemyDestroyedEvent } from "../../../systems/events/types/EnemyDestroyed";
import { createAnimatedSprite } from "../../components/animatedSprite";
import { Enemy } from "./enemy";

const SPRITE_SIZE = 48;

export class Boss extends Enemy {
  // Boss has two states, damaged and undamaged, so it can take two hits
  private damaged: boolean = false;
  public escorts: Enemy[];
  private onDisposeBoss: VoidFunction[] = [];

  constructor(events: EventSystem, escorts: Enemy[]) {
    super(events);
    this.escorts = escorts;
    this.sprite = createAnimatedSprite({
      texture: Textures().enemies[1],
      frames: 2,
      frameDuration: 500,
    });
    this.width = SPRITE_SIZE;
    this.height = SPRITE_SIZE;

    this.onDisposeBoss.push(
      events.subscribe<EnemyDestroyedEvent>({
        type: "ENEMY_DESTROYED",
        callback: (event) => {
          if (this.escorts.includes(event.payload.enemy))
            this.escorts.splice(this.escorts.indexOf(event.payload.enemy), 1);
        },
      })
    );
  }

  public override dispose(): void {
    this.onDisposeBoss.forEach((dispose) => dispose());
    super.dispose();
  }

  hit(): void {
    if (!this.damaged) {
      // if first hit, change to damaged sprite
      this.damaged = true;
      this.sprite = createAnimatedSprite({
        texture: Textures().enemies[2],
        frames: 2,
        frameDuration: 500,
      });
    } else super.hit();
  }

  update(deltaTime: number): void {
    super.update(deltaTime);
    // remove escorts if boss is hovering or dead
    if (this.escorts.length > 0) {
      if (this.state == "formation" || !this.active) {;
        this.escorts = [];
      }
    }
  }

  public override get variant() {
    return "boss" as const;
  }

  public override get escortCount() {
    return this.escorts.length;
  }
}
