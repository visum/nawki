
export interface Vector2D {
  x: number;
  y: number;
}

export type Critter = {
  id: string;
  cells: number[];
  links: Link[];
  velocity: number;
  heading: number; // in rad
  position: Vector2D;
};

export type Link = {
  source: number;
  target: number;
  fn: (input: number) => number;
};

