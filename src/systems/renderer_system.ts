import { Scene } from "../scene";
import { System } from "../types/system";
import { firstComponentOrThrow, World } from "../world";
import { Entity } from "../world";
import * as THREE from "three";

export class RendererSystem implements System {

  private _scene: Scene;

  private _renderablesInScene = new Set<Entity>();

  constructor(scene: Scene) {
    this._scene = scene;
  }

  onAdd() { }

  onRemove() { }

  onTick(world: World) {
    const renderables = world.getEntitiesWithComponent("renderable");
    const renderablesToRemove = new Set<Entity>(this._renderablesInScene);

    for (const r of renderables) {
      renderablesToRemove.delete(r);
      const mesh = this._getMeshForRenderable(r);

      if (!this._renderablesInScene.has(r)) {
        this._renderablesInScene.add(r);
        this._scene.addMesh(mesh);
      }
      const [x, y] = this._getPositionForEntity(r);

      mesh.position.x = x;
      mesh.position.y = y;
      try {
        mesh.rotation.z = this._getHeadingForEntity(r);
      } catch { }

    }

    for (const r of renderablesToRemove) {
      const mesh = this._getMeshForRenderable(r);
      this._scene.removeMesh(mesh);
    }

    this._scene.render();
  }

  private _getMeshForRenderable(e: Entity) {
    const renderableComponent = firstComponentOrThrow(e, "renderable");
    const mesh = renderableComponent.payload;

    if (!mesh) {
      throw new Error("This entity doesn't have a mesh");
    }

    return mesh as THREE.Mesh;
  }

  private _getPositionForEntity(e: Entity) {
    const position = firstComponentOrThrow(e, "position");
    const x = position.numberValues.get("x") as number;
    const y = position.numberValues.get("y") as number;
    return [x, y];
  }

  private _getHeadingForEntity(e: Entity) {
    const heading = firstComponentOrThrow(e, "heading");
    return heading.numberValues.get("heading") as number;
  }
}
