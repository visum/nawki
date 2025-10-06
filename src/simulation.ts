import { World } from "./world";
import { System } from "./types/system";
import { CritterDefinition } from "./types/critter";

export class Simulation {
  private _world: World;
  private _systems: System[];

  constructor(world: World) {
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

  addCritter(defition: CritterDefinition) {
    let critterAddEntity = this._world.firstEntityByType("critters-to-add");
    if (!critterAddEntity) {
      critterAddEntity = World.getEntity("critters-to-add");
      this._world.entities.push(critterAddEntity);
    }
    const c = World.getComponent("critter");
    c.payload = defition;
    critterAddEntity.components.push(c);
  }

  tick() {
    for (const s of this._systems) {
      s.onTick(this._world);
    }
  }
}
