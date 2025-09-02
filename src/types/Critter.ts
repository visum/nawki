import { Entity } from "./Entity";

export interface Vector2D {
  x: number;
  y: number;
}

export type Critter = Entity & {
  cells: number[];
  links: Link[];
  velocity: Vector2D;
};

export type Link = {
  source: number;
  target: number;
  fn: (input: number) => number;
};

