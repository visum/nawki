import { Critter, Vector2D } from "../types/critter";
import * as THREE from "three";
import { System } from "../types/system";
import { WorldState, Entity, getEntity, getComponent, firstComponentOrThrow, componentNumberValueOrThrow } from "../world";

const FOOD_RADIUS = 200;

export class FoodSystem implements System {

  private _foodToMesh = new Map<Entity, THREE.Mesh>();

  private _foodMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffdd77 });
  private _foodGeometry = new THREE.CircleGeometry(0.1, 12);

  onAdd() { }
  onRemove() { }

  onTick(world: WorldState) {
    const boundaryLeft = world.environment.get("boundary_left");
    const boundaryRight = world.environment.get("boundary_right");
    const boundaryTop = world.environment.get("boundary_top");
    const boundaryBottom = world.environment.get("boundary_bottom");

    if (boundaryLeft == null || boundaryRight == null || boundaryTop == null || boundaryBottom == null) {
      throw new Error("Environment missing values");
    }

    const doAddFood = Math.random() > 0.7;

    if (doAddFood) {
      const width = boundaryRight - boundaryLeft;
      const height = boundaryBottom - boundaryTop;
      const posX = (Math.random() * width) - (width / 2);
      const posY = (Math.random() * height) - (height / 2);

      this._addFood(posX, posY, world)
      // add bit to meshes
    }

    for (const [_, critter] of world.critters) {
      const foodInRange = this._getNearbyFood(critter);

      const eatenFood = foodInRange.filter(([, dist]) => dist < 0.2);

      eatenFood.forEach(([, , f]) => this._removeFood(f, world))

      const notEatenFood = foodInRange.filter(([_, dist]) => dist >= 0.2);

      const [sumX, sumY, sumD] = notEatenFood.reduce((acc, current) => [
        acc[0] + current[0].x, acc[1] + current[0].y, acc[2] + current[1]
      ], [0, 0, 0]);

      const averageX = sumX / notEatenFood.length;
      const averageY = sumY / notEatenFood.length;
      const averageD = sumD / notEatenFood.length;
      const averageAngle = Math.atan2(averageY, averageX);

      const relativeAngle = critter.heading - averageAngle;
      critter.cells[0] = relativeAngle;
      critter.cells[1] = averageD;
    }

  }

  private _addFood(x: number, y: number, world: WorldState) {
    const newFood = getEntity("food");
    const positionC = getComponent("position");
    newFood.components.push(positionC);
    positionC.numberValues.set("x", x);
    positionC.numberValues.set("y", y);

    const mesh = new THREE.Mesh(this._foodGeometry, this._foodMaterial);

    world.renderablesToAdd.push(mesh);
    world.entities.push(newFood);

    this._foodToMesh.set(newFood, mesh);
  }

  private _removeFood(food: Entity, world: WorldState) {
    const mesh = this._foodToMesh.get(food);
    if (mesh) {
      world.renderablesToRemove.push(mesh);
    }

    this._foodToMesh.delete(food);
  }

  private _getNearbyFood(critter: Critter) {
    const results: [Vector2D, number, Entity][] = [];

    for (const f of this._foodToMesh.keys()) {
      const position = firstComponentOrThrow(f, "position");
      const x = componentNumberValueOrThrow(position, "x");
      const y = componentNumberValueOrThrow(position, "y");
      const dx = x - critter.position.x;
      const dy = y - critter.position.y;

      const distance = Math.sqrt(dx ** 2 + dy ** 2);

      if (distance <= FOOD_RADIUS) {
        results.push([{ x: dx, y: dy }, distance, f]);
      }
    }
    return results;
  }
}

