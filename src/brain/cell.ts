export interface Cell {
  read(): number | null;
  setInput(index: number, value: number): void;
  tick(): void;
  addLink(link: Link): void;
  removeLink(link: Link): void;
  notify(): void;
}

export type Link = {
  id: string;
  target: Cell;
}
