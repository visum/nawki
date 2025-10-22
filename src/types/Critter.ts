
export interface Vector2D {
  x: number;
  y: number;
}


export type CritterDefinition = {
  cells: Record<number, Cell>;
  links: Link[];
};

type Cell = {
  threshold: number;
  decay: number; // <= 1.0
}

type Link = {
  source: number;
  target: number;
  factor: number;
  gateCell?: number;
};

