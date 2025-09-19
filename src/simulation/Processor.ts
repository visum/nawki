import { Environment } from "../types/Environment.js";
import { Critter } from "../types/Critter.js";
import { Plugin } from "./plugins/plugin.js";

const DRAG = 0.8;

export class Processor {
  private _valueBuffer: number[] = [];

  process(critter: Critter, environment: Environment, critters: Critter[], plugins: Plugin[]) {
    // clear out the value buffer
    for (const i in critter.cells) {
      this._valueBuffer[i] = 0;
    }
    // apply environmental drag
    critter.velocity.x *= DRAG;
    critter.velocity.y *= DRAG;


    // stage one: write environmental values to the critter
    const nearbyCritters = this.getNearbycritters(critter, 3, critters);

    let nearestPositiveX = 60;
    let nearestNegativeX = 60;
    let nearestPositveY = 60;
    let nearestNegativeY = 60;

    for (const neighbor of nearbyCritters) {
      const [x, y] = this.getDistanceComponents(critter, neighbor);
      if (x > 0 && x < nearestPositiveX) {
        nearestPositiveX = x;
      }
      if (x < 0 && Math.abs(x) < nearestNegativeX) {
        nearestNegativeX = Math.abs(x);
      }
      if (y > 0 && y < nearestPositveY) {
        nearestPositveY = y;
      }
      if (y < 0 && Math.abs(y) < nearestNegativeY) {
        nearestNegativeY = Math.abs(y);
      }
    }
    /*
        const wallDistancePX = environment.boundaries.x[1] - critter.position.x;
        const wallDistanceNX = Math.abs(environment.boundaries.x[0] - critter.position.x);
        const wallDistancePY = environment.boundaries.y[1] - critter.position.y;
        const wallDistanceNY = Math.abs(environment.boundaries.y[0] - critter.position.y);
    
        nearestPositiveX = Math.min(wallDistancePX, nearestPositiveX);
        nearestNegativeX = Math.min(wallDistanceNX, nearestNegativeX);
        nearestPositveY = Math.min(wallDistancePY, nearestPositveY);
        nearestNegativeY = Math.min(wallDistanceNY, nearestNegativeY);
    */

    critter.cells[4] = nearestPositiveX;
    critter.cells[5] = nearestNegativeX;
    critter.cells[6] = nearestPositveY;
    critter.cells[7] = nearestNegativeY;

    for (const p of plugins) {
      typeof p.processCritter === "function" && p.processCritter(critter)
    }

    // stage two: evaluate critter network and store new values
    // in the value buffer
    for (const link of critter.links) {
      const { source, target, fn } = link;
      this._valueBuffer[target] = this._valueBuffer[target] + fn(critter.cells[source]);
    }

    // stage three: apply output values to the environment
    const moveX = critter.cells[9];
    const moveY = critter.cells[10];

    // A really simple intertia implementation that is probably wrong
    const intertia = 0.02;

    const newTargetVelocityX = critter.velocity.x += moveX;
    const newTargetVelocityY = critter.velocity.y += moveY;
    critter.velocity.x = critter.velocity.x + (newTargetVelocityX - critter.velocity.x) * intertia;
    critter.velocity.y = critter.velocity.y + (newTargetVelocityY - critter.velocity.y) * intertia;

    // spped limit
    // critter.velocity.x = critter.velocity.x > 0 ? Math.min(critter.velocity.x, 0.1) : Math.max(critter.velocity.x, -0.1);
    // critter.velocity.y = critter.velocity.y > 0 ? Math.min(critter.velocity.y, 0.1) : Math.max(critter.velocity.y, -0.1);

    const newX = critter.position.x + critter.velocity.x;
    const newY = critter.position.y + critter.velocity.y;

    if (newX > environment.boundaries.x[0] && newX < environment.boundaries.x[1]) {
      critter.position.x = newX;
    }

    if (newY > environment.boundaries.y[0] && newY < environment.boundaries.y[1]) {
      critter.position.y = newY;
    }

    // stage 4: copy buffer values back into the critter
    for (let i in this._valueBuffer) {
      critter.cells[i] = this._valueBuffer[i];
    }
  }

  private getNearbycritters(critter: Critter, radius: number, critters: Critter[]): Critter[] {
    return critters.filter(other => {
      if (other.id === critter.id) return false;

      const distance = this.getCritterDistance(critter, other);

      return distance < radius;
    });
  }

  private getCritterDistance(c1: Critter, c2: Critter) {
    const dx = c2.position.x - c1.position.x;
    const dy = c2.position.y - c1.position.y;
    return Math.sqrt(dx ** 2 + dy ** 2);
  }

  getDistance(
    a: [x: number, y: number],
    b: [x: number, y: number]
  ): [direction: number, distance: number] {
    // Calculate the difference vector
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];

    // Calculate distance using Pythagorean theorem
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate direction (angle in radians from point a to point b)
    // atan2 returns angle from -π to π, where 0 is positive x-axis
    const direction = Math.atan2(dy, dx);

    return [direction, distance];
  }

  getDistanceComponents(c1: Critter, c2: Critter) {
    const x = c2.position.x - c1.position.x;
    const y = c2.position.y - c1.position.y;

    return [x, y];
  }
}


/*

Memory map:
-- Inputs
[0]: food angle (relative)
[1]: food distance
[2]: neighbor angle (relative)
[3]: neighbor distance
[4]: energy
[5]: heading

-- Ouputs
[9]: MoveX
[10]: MoveY


-- General
[11]
...
[60]
 */
