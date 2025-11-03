import { CritterDefinition, Vector2D } from "../types/critter";

// Generates a map of the critter's brain, modeling
// the nodes and connections, and propagating values
// as values are updated.

/*

# Critter Brain Architecture

## Components

**Cells** have two properties:
- **threshold**: Activation threshold (compared against absolute value)
- **decay**: Multiplicative decay rate applied each tick (e.g., 0.1 means value → value * 0.9)

**Links** have four properties:
- **source**: Index of source cell
- **target**: Index of target cell  
- **factor**: Multiplier applied to value (can be negative)
- **gate**: Optional reference to a gate cell index (null if ungated)

## Behavior

**Value updates:**
- When a cell receives input, new value = whichever has larger absolute value (current vs incoming), preserving sign
- Each tick, all cells decay: `value *= (1 - decay)`

**Propagation:**
- A cell fires its links when it receives new input that changes its value
- Links only fire if `abs(source_cell.value) > source_cell.threshold`
- Gated links only fire if `abs(gate_cell.value) > gate_cell.threshold`
- Outgoing value through link: `source_cell.value * factor`

**Special cells:**
- **Input cells**: World writes sensory data here each tick (e.g., food_distance, neighbor_heading)
- **Output cells**: World reads action requests from here (e.g., turn, accelerate)
- **Constant cell**: One input cell always holds 1.0 for generating static outputs

**Execution:** Event-driven propagation within each tick - input updates cascade through the network until settled, then outputs are read.

 */


export type CellParameters = {
  threshold: number;
  decay: number;
  index: number;
};

export type LinkParameters = {
  source: number;
  target: number;
  factor: number;
  gateCell?: number;
}

export class CritterBrain {
  private _cells: Record<number, Cell> = {};

  private _definition: CritterDefinition = { cells: [], links: [] };

  private _id: string = "";

  private _state: {
    velocity: { speed: number, direction: number },
    heading: number,
    energy: number,
    position: Vector2D
  } = {
      velocity: { speed: 0, direction: 0 },
      heading: 0,
      energy: 0,
      position: { x: 0, y: 0 }
    }

  constructor(id: string) {
    this._id = id;
  }

  buildFromDefinition(definition: CritterDefinition) {
    this._definition = definition;
    const { cells, links } = definition;
    for (const c of Object.keys(cells)) {
      const i = Number(c);
      this.addCellAt({ ...cells[i], index: i });
    }

    for (const l of links) {
      this.addLink(l);
    }
  }

  get state() {
    return this._state;
  }

  get id() {
    return this._id;
  }

  get definition() {
    return this._definition;
  }

  addCellAt(params: CellParameters) {
    this._cells[params.index] = new Cell(params)
  }

  addLink(params: LinkParameters) {
    const source = this._cells[params.source];
    const target = this._cells[params.target];
    let gate;
    if (params.gateCell != null) {
      gate = this._cells[params.gateCell];
    }

    if (source != null && target != null) {
      const link: Link = { id: `${params.source}-${params.target}`, factor: params.factor, target, source };
      if (gate != null) {
        link.gateCell = gate;
        gate.addGatedLink(link);
      }
      source.addLink(link);
    }
  }

  removeLink(params: LinkParameters) {
    const source = this._cells[params.source];
    if (source != null) {
      const id = `${params.source}-${params.target}`;
      source.removeLink(id);
    }
  }

  setCellValue(cellIndex: number, value: number) {
    const c = this._cells[cellIndex];
    if (c != null) {
      c.set(value);
    }
  }

  readCellValue(cellIndex: number): number | null {
    const c = this._cells[cellIndex];
    if (c != null) {
      return c.read();
    }
    return null;
  }

  decay() {
    for (const c of Object.values(this._cells)) {
      c.decay();
    }
  }
}

// we'll have a list of links and a list of cells
// Should we instantiate the cells here?


class Cell {
  private _index: number;
  private _value: number | null = null;
  private _threshold: number;
  private _decay: number = 1;
  private _links = new Map<string, Link>();
  private _gatedLinks: Set<Link> = new Set();

  constructor({ threshold, decay, index }: CellParameters) {
    this._threshold = threshold;
    this._decay = decay;
    this._index = index;
  }

  get isActive() {
    return this._value != null && Math.abs(this._value) >= this._threshold;
  }

  read(): number | null {
    if (this._value != null && Math.abs(this._value) >= this._threshold) {
      return this._value;
    }

    return null;
  }

  addLink(link: Link) {
    this._links.set(link.id, link);
  }

  removeLink(id: string) {
    this._links.delete(id);
  }

  addGatedLink(link: Link) {
    this._gatedLinks.add(link);
  }

  removeGatedLink(link: Link) {
    this._gatedLinks.delete(link);
  }

  set(value: number | null, notify = true) {
    this._value = value;
    if (notify) {
      this.notify();
    }
  }

  write(value: number | null, notify = true) {
    if (value === null) {
      return;
    }
    if (value === this._value) {
      return; // only notify if value changes
    }
    if (this._value == null) {
      this._value = value;
    }
    if (this._value < value) {
      this._value = value;
    }
    if (notify) {
      this.notify();
    }
  }

  decay() {
    if (this._value == null || this._decay === 0) {
      return;
    }
    this._value *= (1 - this._decay);
    this.notify();
  }

  notify() {
    const value = this.read();
    for (const link of this._links.values()) {
      if (link.gateCell == null || (link.gateCell != null && link.gateCell.isActive)) {
        link.target.write(value);
      }
    }
    for (const link of this._gatedLinks.values()) {
      if (this.isActive) {
        link.target.write(link.source.read());
      }
    }
  }
}

type Link = {
  id: string,
  factor: number,
  source: Cell,
  target: Cell,
  gateCell?: Cell;
}
