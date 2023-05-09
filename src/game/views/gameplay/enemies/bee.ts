import { Textures } from "../../../systems/dynamicImports/textures";
import { EventSystem } from "../../../systems/events";
import { createAnimatedSprite } from "../../components/animatedSprite";
import { Enemy } from "./enemy";

const SPRITE_SIZE = 48;

export class Bee extends Enemy {
  constructor(events: EventSystem) {
    super(events);
    this.sprite = createAnimatedSprite({
      texture: Textures().enemies[4],
      frames: 2,
      frameDuration: 500,
    });
    this.width = SPRITE_SIZE;
    this.height = SPRITE_SIZE;
    // this.xPosition = Math.random() * 1000; // for testing, will change later
  }

  public override get variant() {
    return "bee" as const;
  }
}
