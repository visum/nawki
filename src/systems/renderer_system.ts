import { Scene } from "../scene";
import { System } from "../types/system";
import { WorldState } from "../world";

export class RendererSystem implements System {

  private _scene: Scene;

  constructor(scene: Scene) {
    this._scene = scene;
  }

  onAdd() { }

  onRemove() { }

  onTick(world: WorldState) {
    for (const m of world.renderablesToAdd) {
      this._scene.addMesh(m);
    }

    for (const m of world.renderablesToRemove) {
      this._scene.removeMesh(m);
    }

    world.renderablesToRemove.length = 0;
    world.renderablesToAdd.length = 0;

    this._scene.render();
  }
}
