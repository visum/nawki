
export interface Vector2D {
  x: number;
  y: number;
}

export type Critter = {
  id: string;
  cells: number[];
  links: Link[];
  energy: number;
  heading: number;
  velocity: number;
  position: Vector2D;
};

export type Link = {
  source: number;
  target: number;
  fn: (input: number) => number;
};

