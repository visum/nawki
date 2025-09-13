import * as THREE from 'three';
import { Food } from '../simulation/plugins/food';
import { RenderPlugin } from './render_plugin';

export class FoodRenderer implements RenderPlugin {
  private _foodPlugin: Food;
  private _scene: THREE.Scene;

  private _foodMeshes = new Map<string, THREE.Mesh>();

  private _foodMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffdd7 });
  private _foodGeometry = new THREE.CircleGeometry(0.1, 12);

  constructor(foodPlugin: Food, scene: THREE.Scene) {
    this._scene = scene;
    this._foodPlugin = foodPlugin;
  }

  render() {
    const foodPieces = this._foodPlugin.getFoodPieces();
    const currentFoodIds = new Set<string>();
    for (const piece of foodPieces) {
      currentFoodIds.add(piece.id);
      let mesh = this._foodMeshes.get(piece.id);
      if (!mesh) {
        mesh = new THREE.Mesh(this._foodGeometry, this._foodMaterial);
        this._foodMeshes.set(piece.id, mesh);
        this._scene.add(mesh);
      }

      mesh.position.y = piece.position.y;
      mesh.position.x = piece.position.x;

      mesh.scale.setScalar(2);
    }

    for (const [id, mesh] of this._foodMeshes.entries()) {
      if (!currentFoodIds.has(id)) {
        this._scene.remove(mesh);
        this._foodMeshes.delete(id);
      }
    }

  }
}
