
import { Vector2D } from "./Critter";

export type Environment = {
  foodPositions: Map<number, Vector2D>;
  boundaries: { x: [number, number], y: [number, number] }
};
