
export interface Vector2D {
  x: number;
  y: number;
}

// a cell integrates and represents values
// it may have a threshold:
//   if the aggregate value is < the threshold, the cell value is 0
// it may have a static value:
//   if the value is null, it will forward the aggregated value
//   if the value is set and the threshold is reached, the value will be constant
//
// I/O cells:
//   The world will attempt to write to cells at specific indexes. If the cell
//   is present, it will receive the value, and other cells may then respond.
//
//   The world will attempt to read from cells at specific locations. If a cell
//   is present, the world will respond as appropriate.
//
//   This way, critters can opt-in to specific sensations and actions.

export type CritterDefinition = {
  cells: Record<number, Cell>;
  links: Link[];
};

type Cell = {
  staticValue: number | null;
  threshold: number;
  decay: number; // <= 1.0
}

type Link = {
  source: number;
  target: number;
  factor: number;
};

