import { EventSystem } from "../../../systems/events";
import { BulletHitEnemy } from "../../../systems/events/types/BulletHitEnemy";
import { EnemyDestroyedEvent } from "../../../systems/events/types/EnemyDestroyed";
import { EnemyFiredEvent } from "../../../systems/events/types/EnemyFired";
import { PlayerHitEnemy } from "../../../systems/events/types/PlayerHitEnemy";
import { AnimatedSprite } from "../../components/animatedSprite";
import { EnemyPath } from "./paths/types";

export const SPRITE_SIZE = 48;

type Point = {
  x: number;
  y: number;
};

export type EnemyVariant = "bee" | "boss" | "butterfly";

export class Enemy {
  private events: EventSystem;
  protected sprite: AnimatedSprite | null;
  public width: number;
  public height: number;
  public xPosition: number;
  public yPosition: number;

  public active: boolean;
  public state: "diving" | "formation";
  private speed: number;

  private points: Array<
    Point & { distance: number; direction: Point; lastPoint: Point }
  >;
  private direction: Point;
  private segmentElapsed: number;
  private delayRemaining: number;
  private onDispose: VoidFunction[];
  private shootInMs = Infinity;
  private nextShots: number[] = [];
  private getFinalPosition?: () => Point;

  private makeUnitDirection(direction: Point): Point {
    const magnitude = Math.sqrt(
      direction.x * direction.x + direction.y * direction.y
    );
    return {
      x: direction.x / magnitude,
      y: direction.y / magnitude,
    };
  }

  constructor(events: EventSystem) {
    this.events = events;
    this.sprite = null;
    this.width = SPRITE_SIZE;
    this.height = SPRITE_SIZE;
    this.xPosition = -1000;
    this.yPosition = -1000;

    this.active = true;
    this.state = "diving";
    this.speed = 0.25;

    this.points = [];
    this.segmentElapsed = 0;
    this.direction = { x: 0, y: 0 };
    this.delayRemaining = 0;
    this.onDispose = [];

    this.onDispose.push(
      this.events.subscribe<BulletHitEnemy>({
        type: "BULLET_HIT_ENEMY",
        callback: (event) => {
          if (event.payload.enemy === this) this.hit();
        },
      })
    );
    this.onDispose.push(
      this.events.subscribe<PlayerHitEnemy>({
        type: "PLAYER_HIT_ENEMY",
        callback: (event) => {
          if (event.payload.enemy === this) this.hit();
        },
      })
    );
  }

  dispose() {
    this.onDispose.forEach((fn) => fn());
  }

  hit() {
    // handle enemy being hit
    if (!this.active) return; // don't hit if inactive
    this.active = false;
    this.events.publish<EnemyDestroyedEvent>({
      type: "ENEMY_DESTROYED",
      payload: {
        x: this.xPosition + this.width / 2,
        y: this.yPosition + this.height / 2,
        enemy: this,
      },
    });
  }

  shoot() {
    // handle enemy shooting
    this.events.publish<EnemyFiredEvent>({
      type: "ENEMY_FIRED",
      payload: {
        x: this.xPosition + this.width / 2,
        y: this.yPosition + this.height / 2,
      },
    });
    // this.bullets.push(new enemyBullet(this.xPosition, this.yPosition, this.events));
  }

  update(deltaTime: number) {
    if (this.active) {
      this.updatePosition(deltaTime);
      this.sprite?.update(deltaTime);
      this.shootInMs -= deltaTime;
      if (this.shootInMs <= 0) {
        this.shoot();
        const nextShot = this.nextShots.shift();
        this.shootInMs = nextShot || Infinity;
      }
    }

    // if below bottom of screen move to top
    if (this.yPosition > 1040) {
      this.yPosition = -50;
    }
  }

  render(context: CanvasRenderingContext2D) {
    const rotation = Math.atan2(this.direction.y, this.direction.x);
    // if (!this.active) return; // don't render if inactive
    this.sprite?.render({
      context,
      x: this.xPosition,
      y: this.yPosition,
      width: this.width,
      height: this.height,
      rotation,
    });

    // this.bullets.forEach((bullet) => bullet.render(context));

    // BEGIN DEBUG CODE
    // if (this.state === "diving" && this.DEBUG_PATH) {
    //   context.strokeStyle = "green";
    //   context.lineWidth = 4;
    //   context.beginPath();
    //   context.moveTo(this.xPosition, this.yPosition);
    //   this.points.forEach((point) => {
    //     context.lineTo(point.x, point.y);
    //   });
    //   context.stroke();
    // }
    // context.strokeStyle = this.state === 'diving' ? 'green' : 'red';
    // context.lineWidth = 4;
    // context.beginPath();
    // context.rect(this.xPosition, this.yPosition, this.width, this.height);
    // context.stroke();
    // END DEBUG CODE
  }

  setPath({
    path,
    dx,
    dy,
    delay,
    speed,
    numberOfShots,
    getFinalPosition,
  }: {
    path: Point[];
    dx?: number;
    dy?: number;
    delay?: number;
    speed?: number;
    numberOfShots: number;
    getFinalPosition?: () => Point;
  }) {
    if (this.points.length > 0) return; // ignore if already has path
    this.getFinalPosition = getFinalPosition;
    this.speed = speed || this.speed;
    // this.xPosition = path[0].x + (dx || 0);
    // this.yPosition = path[0].y + (dy || 0);
    this.delayRemaining = delay || 0;
    this.segmentElapsed = 0;
    if (numberOfShots > 0) {
      const pathDistance = path.reduce((distance, point, index) => {
        if (index === 0) return distance;
        const lastPoint = path[index - 1];
        return (
          distance +
          Math.sqrt(
            (point.x - lastPoint.x) * (point.x - lastPoint.x) +
              (point.y - lastPoint.y) * (point.y - lastPoint.y)
          )
        );
      }, 0);
      const shootTime = (Math.random() * (pathDistance / 4)) / this.speed;
      this.shootInMs = shootTime + (delay || 0);
    }
    this.points = path.slice(1).map((point, index) => {
      const lastPoint = path[index];
      const distance = Math.sqrt(
        (point.x - lastPoint.x) * (point.x - lastPoint.x) +
          (point.y - lastPoint.y) * (point.y - lastPoint.y)
      );
      const direction = this.makeUnitDirection({
        x: point.x - lastPoint.x,
        y: point.y - lastPoint.y,
      });
      return {
        x: point.x + (dx || 0),
        y: point.y + (dy || 0),
        distance,
        direction,
        lastPoint: {
          x: lastPoint.x + (dx || 0),
          y: lastPoint.y + (dy || 0),
        },
      };
    });
  }

  private resetRotation() {
    // slowly rotate back to this.direction = { x: 0, y: -1 } to face upwards towards x = 0, y = -1
    let rotation = this.makeUnitDirection(this.direction);
    const rotationSpeed = 0.02;
    if (rotation.x > 0) rotation.x -= rotationSpeed;
    if (rotation.x < 0) rotation.x += rotationSpeed;
    if (rotation.y > -1) rotation.y -= rotationSpeed;
    if (rotation.y < -1) rotation.y += rotationSpeed;
    this.direction = this.makeUnitDirection(rotation);

  }

  private updatePosition(deltaTime: number) {
    // if below bottom of screen move to top
    if (this.yPosition > 1034) {
      // shift all points up by 1040
      this.yPosition -= 1034;
      this.points.forEach((point) => {
        point.y -= 1034;
        point.lastPoint.y -= 1034;
      });
    }

    if (this.delayRemaining > 0) {
      this.delayRemaining -= deltaTime;
      this.state = "diving";
      return;
    }
    if (this.points.length === 0) {
      if (this.getFinalPosition) {
        const finalPosition = this.getFinalPosition();
        const distanceToFinalPosition = Math.sqrt(
          (finalPosition.x - this.xPosition) *
            (finalPosition.x - this.xPosition) +
            (finalPosition.y - this.yPosition) *
              (finalPosition.y - this.yPosition)
        );
        if (distanceToFinalPosition > 2) {
          this.setPath({
            path: [
              { x: this.xPosition, y: this.yPosition },
              this.getFinalPosition(),
            ],
            numberOfShots: 0,
            delay: 0,
            dx: 0,
            dy: 0,
          });
        } else {
          this.getFinalPosition = undefined;
        }
      } else {
        this.resetRotation();
        // this.direction = { x: 0, y: -1 }; // face upward after reaching end of path
        this.state = "formation";
      }
      return;
    }
    const nextPoint = this.points[0];
    const distanceToTravel = this.speed * deltaTime;
    const distanceRemaining = nextPoint.distance - this.segmentElapsed;
    this.direction = nextPoint.direction;
    if (distanceRemaining < distanceToTravel) {
      this.segmentElapsed = 0;
      this.xPosition = nextPoint.x;
      this.yPosition = nextPoint.y;
      this.points.shift();
    } else {
      this.segmentElapsed += distanceToTravel;
      const percentTravelled = this.segmentElapsed / nextPoint.distance;
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      this.xPosition = lerp(
        nextPoint.lastPoint.x,
        nextPoint.x,
        percentTravelled
      );
      this.yPosition = lerp(
        nextPoint.lastPoint.y,
        nextPoint.y,
        percentTravelled
      );
      1;
    }
  }

  public attack(
    path: EnemyPath,
    shootOnDelay?: number[],
    delay?: number,
    speed?: number,
    loopOffScreen = false
  ) {
    if (!this.active) return;
    this.state = "diving";
    this.setPath({
      dx: this.xPosition,
      dy: this.yPosition,
      path: [...path, { x: 0, y: !loopOffScreen ? 0 : 1034 }],
      delay: delay || 0,
      speed: speed || 0.2,
      numberOfShots: 0,
    });

    if (shootOnDelay && shootOnDelay.length > 0) {
      this.shootInMs = shootOnDelay[0];
      this.nextShots = shootOnDelay.slice(1);
    }
  }

  public get inFormation() {
    return this.state === "formation";
  }

  public get variant(): EnemyVariant {
    throw new Error("Not implemented");
  }

  public get escortCount(): number {
    return 0;
  }
}
