import { Vector2D } from "../types/critter";
import * as THREE from "three";
import { System } from "../types/system";
import { World, Entity, firstComponentOrThrow, componentNumberValueOrThrow } from "../world";

const FOOD_RADIUS = 400;

export class FoodSystem implements System {

  private _foodToMesh = new Map<Entity, THREE.Mesh>();

  private _foodMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffdd77 });
  private _foodGeometry = new THREE.CircleGeometry(1, 12);

  onAdd(world: World) {
    this._addFood(10, 0, world);
  }
  onRemove() { }

  onTick(world: World) {
    const boundaryLeft = world.environment.get("boundary_left");
    const boundaryRight = world.environment.get("boundary_right");
    const boundaryTop = world.environment.get("boundary_top");
    const boundaryBottom = world.environment.get("boundary_bottom");

    if (boundaryLeft == null || boundaryRight == null || boundaryTop == null || boundaryBottom == null) {
      throw new Error("Environment missing values");
    }

    // const doAddFood = Math.random() > 0.99;
    const doAddFood = false;

    if (doAddFood) {
      const width = boundaryRight - boundaryLeft;
      const height = boundaryBottom - boundaryTop;
      const posX = (Math.random() * width) - (width / 2);
      const posY = (Math.random() * height) - (height / 2);

      this._addFood(posX, posY, world)
    }


    const critterEntities = world.entities.filter(e => e.type === "critter");

    for (const critterEntity of critterEntities) {

      const foodInRange = this._getNearbyFood(critterEntity);

      if (foodInRange.length === 0) {
        continue;
      }

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

      const headingCpt = firstComponentOrThrow(critterEntity, "heading");
      const heading = componentNumberValueOrThrow(headingCpt, "heading");

      const relativeAngle = heading - averageAngle;

      const foodCpt = firstComponentOrThrow(critterEntity, "food");
      foodCpt.numberValues.set("relativeAngle", relativeAngle);
      foodCpt.numberValues.set("distance", averageD);
    }

  }

  private _addFood(x: number, y: number, world: World) {
    const newFood = World.getEntity("food");
    const positionC = World.getComponent("position");
    newFood.components.push(positionC);
    positionC.numberValues.set("x", x);
    positionC.numberValues.set("y", y);

    const mesh = new THREE.Mesh(this._foodGeometry, this._foodMaterial);
    mesh.position.x = x;
    mesh.position.y = y;

    world.renderablesToAdd.push(mesh);
    world.entities.push(newFood);

    this._foodToMesh.set(newFood, mesh);
  }

  private _removeFood(food: Entity, world: World) {
    const mesh = this._foodToMesh.get(food);
    if (mesh) {
      world.renderablesToRemove.push(mesh);
    }

    this._foodToMesh.delete(food);
  }

  private _getNearbyFood(critter: Entity) {
    const results: [Vector2D, number, Entity][] = [];

    const critterPosition = firstComponentOrThrow(critter, "position");
    const critterX = componentNumberValueOrThrow(critterPosition, "x");
    const critterY = componentNumberValueOrThrow(critterPosition, "y");

    for (const f of this._foodToMesh.keys()) {
      const position = firstComponentOrThrow(f, "position");
      const x = componentNumberValueOrThrow(position, "x");
      const y = componentNumberValueOrThrow(position, "y");
      const dx = x - critterX;
      const dy = y - critterY;

      const distance = Math.sqrt(dx ** 2 + dy ** 2);

      if (distance <= FOOD_RADIUS) {
        results.push([{ x: dx, y: dy }, distance, f]);
      }
    }
    return results;
  }
}

