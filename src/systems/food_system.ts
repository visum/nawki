import { Vector2D } from "../types/critter";
import * as THREE from "three";
import { System } from "../types/system";
import { World, Entity, firstComponentOrThrow, componentNumberValueOrThrow } from "../world";

const FOOD_RADIUS = 400;
const EATEN_DISTANCE = 3;

export class FoodSystem implements System {

  private _foodToMesh = new Map<Entity, THREE.Mesh>();

  private _foodMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffdd77 });
  private _foodGeometry = new THREE.CircleGeometry(1, 12);

  onAdd(_world: World) {
    this._addFood(10, 10, _world);
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
      const foodCpt = firstComponentOrThrow(critterEntity, "food");

      if (foodInRange.length === 0) {
        foodCpt.numberValues.set("relativeAngle", null);
        foodCpt.numberValues.set("proximity", null);
        continue;
      }

      const eatenFood = foodInRange.filter(([, dist]) => dist < EATEN_DISTANCE);

      eatenFood.forEach(([, , f]) => this._removeFood(f, world))

      const notEatenFood = foodInRange.filter(([_, dist]) => dist >= EATEN_DISTANCE);
      if (notEatenFood.length === 0) {
        continue;
      }

      const nearestFood = notEatenFood.sort(([, aDist], [, bDist]) => aDist - bDist)[0];

      const x = nearestFood[0].x;
      const y = nearestFood[0].y;
      const angle = Math.atan2(y, x);

      const headingCpt = firstComponentOrThrow(critterEntity, "heading");
      const heading = componentNumberValueOrThrow(headingCpt, "heading") as number;

      const relativeAngle = angle - heading;

      foodCpt.numberValues.set("relativeAngle", relativeAngle);
      const proximity = Math.max(-nearestFood[1] + 200, 0);
      foodCpt.numberValues.set("proximity", proximity);
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

    const renderableComponent = World.getComponent("renderable");
    renderableComponent.payload = mesh;

    newFood.components.push(renderableComponent);

    world.entities.push(newFood);

    this._foodToMesh.set(newFood, mesh);
  }

  private _removeFood(food: Entity, world: World) {
    this._foodToMesh.delete(food);
    world.removeEntityById(food.id);
  }

  private _getNearbyFood(critter: Entity) {
    const results: [Vector2D, number, Entity][] = [];

    const critterPosition = firstComponentOrThrow(critter, "position");
    const critterX = componentNumberValueOrThrow(critterPosition, "x") as number;
    const critterY = componentNumberValueOrThrow(critterPosition, "y") as number;

    for (const f of this._foodToMesh.keys()) {
      const position = firstComponentOrThrow(f, "position");
      const x = componentNumberValueOrThrow(position, "x") as number;
      const y = componentNumberValueOrThrow(position, "y") as number;
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

