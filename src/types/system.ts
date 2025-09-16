import { WorldState } from "../world";

export interface System {
  onAdd(world: WorldState): void;
  onTick(world: WorldState): void;
  onRemove(world: WorldState): void;
}
