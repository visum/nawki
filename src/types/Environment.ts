
import { Vector2D } from "./Critter";

export type Environment = {
  boundaries: { x: [number, number], y: [number, number] }
  buckets: Map<string, any>;
};
