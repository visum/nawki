import { System } from "../types/system";
import { WorldState } from "../world";
import { Vector2D } from "../types/critter";

const NEIGHBOR_RADIUS = 200;

export class CritterNeighborSystem implements System {
  onAdd() { }
  onRemove() { }

  onTick(world: WorldState) {
    const allCritters = Array.from(world.critters.values());

    // do the critter thing
    for (const [_id, critter] of world.critters) {

      // look at nearby critters
      const neighbors = this._getNeighbors(critter, NEIGHBOR_RADIUS, allCritters);

      const [sumX, sumY, sumD] = neighbors.reduce((acc, current) => {
        return [acc[0] + current[0].x, acc[1] + current[0].y, acc[2] + current[1]];
      }, [0, 0, 0]);

      const averageX = sumX / neighbors.length;
      const averageY = sumY / neighbors.length;
      const avgDistance = sumD / neighbors.length;
      const avgAngle = Math.atan2(averageY, averageX);

      // load these values into the critter cells
      const relativeAngle = critter.heading - avgAngle;
      critter.cells[2] = relativeAngle;
      critter.cells[3] = avgDistance;

    }
  }

  private _getNeighbors(critter: Critter, radius: number, allCritters: Critter[]) {
    const results: [Vector2D, number, Critter][] = [];

    for (const c of allCritters) {
      const dx = c.position.x - critter.position.x;
      const dy = c.position.y - critter.position.y;

      const distance = Math.sqrt(dx ** 2 + dy ** 2);

      if (distance <= radius) {
        results.push([{ x: dx, y: dy }, distance, critter]);
      }
    }

    return results;
  }
}
