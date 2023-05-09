import { Textures } from "../../../systems/dynamicImports/textures";
import { Enemy } from "./enemy";
import { createAnimatedSprite } from "../../components/animatedSprite";
import { EventSystem } from "../../../systems/events";

const SPRITE_SIZE = 48;

export class Butterfly extends Enemy {
  constructor(events: EventSystem) {
    super(events);
    this.sprite = createAnimatedSprite({
      texture: Textures().enemies[3],
      frames: 2,
      frameDuration: 500,
    });
    this.width = SPRITE_SIZE;
    this.height = SPRITE_SIZE;
    // this.xPosition = Math.random() * 1000; // for testing, will change later
  }

  public override get variant() {
    return "butterfly" as const;
  }
}
