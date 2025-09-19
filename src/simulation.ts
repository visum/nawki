import { WorldState } from "./world";
import { System } from "./types/system";
import { Critter } from "./types/critter";

export class Simulation {
  private _world: WorldState;
  private _systems: System[];

  constructor(world: WorldState) {
    this._world = world;
    this._systems = [];
  }

  addSystem(system: System) {
    this._systems.push(system);
    system.onAdd(this._world);
  }

  removeSystem(system: System) {
    const systemIndex = this._systems.indexOf(system);
    if (systemIndex > -1) {
      this._systems.splice(systemIndex, 1);
    }
    system.onRemove(this._world);
  }

  addCritter(id: string, critter: Critter) {
    this._world.critters.set(id, critter);
  }

  tick() {
    for (const s of this._systems) {
      s.onTick(this._world);
    }
  }
}
