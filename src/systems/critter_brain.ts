import { CritterDefinition, Vector2D } from "../types/critter";

// Generates a map of the critter's brain, modeling
// the nodes and connections, and propagating values
// as values are updated.

export type CellParameters = {
  staticValue: number | null;
  threshold: number;
  decay: number;
};

export type LinkParameters = {
  source: number;
  target: number;
  factor: number;
}

export class CritterBrain {
  private _cells: Record<number, Cell> = {};

  private _definition: CritterDefinition = { cells: [], links: [] };

  private _id: string = "";

  private _state: {
    velocity: number,
    heading: number,
    energy: number,
    position: Vector2D
  } = {
      velocity: 0,
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
      source.addLink({ id: `${params.source}-${params.target}`, factor: params.factor, target });
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
  private _staticValue: number | null = null;
  private _value: number = 0;
  private _threshold: number;
  private _decay: number = 1;
  private _links = new Map<string, Link>();

  constructor({ staticValue, threshold, decay }: CellParameters) {
    this._staticValue = staticValue;
    this._threshold = threshold;
    this._decay = decay;
  }

  read(): number {
    if (Math.abs(this._value) >= this._threshold) {
      return this._staticValue == null ? this._value : this._staticValue;
    }

    return 0;
  }

  addLink(link: Link) {
    this._links.set(link.id, link);
  }

  removeLink(id: string) {
    this._links.delete(id);
  }

  set(value: number, notify = true) {
    this._value = value;
    if (notify) {
      this.notify();
    }
  }

  integrate(value: number, notify = true) {
    this._value += value;
    if (notify) {
      this.notify();
    }
  }

  decay() {
    this._value *= (1 - this._decay);
  }

  notify() {
    const value = this.read();
    for (const link of this._links.values()) {
      link.target.integrate(value);
    }
  }
}

type Link = {
  id: string,
  factor: number,
  target: Cell,
}
