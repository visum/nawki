import { Critter, Vector2D } from "../../types/Critter";
import { Environment } from "../../types/Environment";
import { Plugin } from "./plugin";

export type FoodPiece = {
  id: string;
  position: Vector2D;
  age: number;
};

const EATEN_PROXIMITY = 0.2;

export class Food implements Plugin {

  private _nextId = 0;
  private _foodPieces = new Set<FoodPiece>();
  private _environment: Environment;

  constructor(environment: Environment) {
    this._environment = environment;
  }

  getFoodPieces() {
    return Array.from(this._foodPieces);
  }

  processCritter(critter: Critter): void {
    const foodToRemove = new Set<FoodPiece>();
    // find nearby food
    // set registers in critter
    // [0]: Food +x
    // [1]: Food -x
    // [2]: Food +y
    // [3]: Food -y
    let dPx = 60;
    let dNx = 60;
    let dPy = 60;
    let dNy = 60;

    let closestPiece: FoodPiece | null = null;
    let closestDistance = 60;
    for (const f of this._foodPieces) {
      const { x, y } = this._getDistanceComponents(critter.position, f.position);
      const distance = Math.sqrt(x ** 2 + y ** 2);
      if (distance < EATEN_PROXIMITY) {
        foodToRemove.add(f);
        continue;
      }
      if (closestPiece === null || distance < closestDistance) {
        closestPiece = f;
        closestDistance = distance;
      }
    }

    for (const f of foodToRemove) {
      this._foodPieces.delete(f);
    }


    if (closestPiece == null) {
      return;
    }
    // if not within range, ignore
    if (closestDistance > 30) {
      return;
    }

    const { x, y } = this._getDistanceComponents(critter.position, closestPiece.position);

    if (x >= 0 && x < dPx) {
      dPx = x;
    }
    if (x <= 0 && Math.abs(x) < dNx) {
      dNx = Math.abs(x);
    }
    if (y >= 0 && y < dPy) {
      dPy = y;
    }
    if (y <= 0 && Math.abs(y) < dNy) {
      dNy = Math.abs(y);
    }

    critter.cells[0] = dPx;
    critter.cells[1] = dNx;
    critter.cells[2] = dPy;
    critter.cells[3] = dNy;
  }

  afterTick(): void {
    if (Math.random() < 0.01) {
      this._foodPieces.add({
        id: String(this._nextId++),
        position: this._getRandomPosition(),
        age: 0
      })
    }

    for (const p of this._foodPieces) {
      p.age += 1;
      if (p.age > 30000) {
        this._foodPieces.delete(p);
      }
    }
  }

  private _getRandomPosition(): Vector2D {
    const sizeX = this._environment.boundaries.x[1] - this._environment.boundaries.x[0];
    const sizeY = this._environment.boundaries.y[1] - this._environment.boundaries.y[0];

    const x = (Math.random() * sizeX) - sizeX / 2;
    const y = (Math.random() * sizeY) - sizeY / 2;

    return { x, y };
  }

  private _getDistanceComponents(a: Vector2D, b: Vector2D) {
    const x = b.x - a.x;
    const y = b.y - a.y;
    return { x, y };
  }
}
