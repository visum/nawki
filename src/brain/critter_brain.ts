import { CritterDefinition, Vector2D } from "../types/critter";

// Generates a map of the critter's brain, modeling
// the nodes and connections, and propagating values
// as values are updated.

export type CellParameters = {
  threshold: number;
  decay: number;
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
    velocity: Vector2D,
    heading: number,
    energy: number,
    position: Vector2D
  } = {
      velocity: { x: 0, y: 0 },
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
      this.addCellAt(cells[i], i);
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

  addCellAt(params: CellParameters, index: number) {
    this._cells[index] = new Cell(params)
  }

  addLink(params: LinkParameters) {
    const source = this._cells[params.source];
    const target = this._cells[params.target];

    if (source != null && target != null) {
      source.addLink({ id: `${params.source}-${params.target}`, factor: params.factor, target, source });
    }
  }

  removeLink(params: LinkParameters) {
    const source = this._cells[params.source];
    if (source != null) {
      const id = `${params.source}-${params.target}`;
      source.removeLink(id);
    }
  }

  setCellValue(cellIndex: number, value: number | null) {
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
  private _staticValue: number | null = null;
  private _value: number | null = null;
  private _threshold: number;
  private _decay: number = 1;
  private _links = new Map<string, Link>();
  private _gates = new Map<string, Link>();

  constructor({ threshold, decay }: CellParameters) {
    this._threshold = threshold;
    this._decay = decay;
  }

  get isActive() {
    return this._value != null && Math.abs(this._value) > this._threshold;
  }

  read(): number | null {
    if (this._value != null && Math.abs(this._value) >= this._threshold) {
      return this._staticValue == null ? this._value : this._staticValue;
    }

    return null;
  }

  addLink(link: Link) {
    this._links.set(link.id, link);
  }

  removeLink(id: string) {
    this._links.delete(id);
  }

  set(value: number | null, notify = true) {
    this._value = value;
    if (notify) {
      this.notify();
    }
  }

  recieve(value: number | null, notify = true) {
    if (value === null) {
      return;
    }

    if (this._value == null) {
      this._value = value;
    } else {
      this._value = Math.abs(this._value) < Math.abs(value) ? value : this._value;
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
      if (link.gate) {
        if (link.gate.isActive) {
          link.target.recieve(value != null ? value * link.factor : value);
        }
      } else {
        link.target.recieve(value != null ? value * link.factor : value);
      }
    }
    // process gates
    // might we be double-notifying here?
    // The source node would already be checking this gate
    // we really only want to trigger a gate if the gate value changed, right?
    if (this.isActive) {
      for (const gateLink of this._gates.values()) {
        const gateSourceValue = gateLink.source.read();
        gateLink.target.recieve(gateSourceValue != null ? gateSourceValue * gateLink.factor : gateSourceValue);
      }
    }
  }
}

type Link = {
  id: string,
  factor: number,
  source: Cell,
  target: Cell,
  gate?: Cell
}
