import { System } from "../types/system";
import { WorldState } from "../world";
import { Critter } from "../types/critter";
import * as THREE from "three";

const DRAG = 0.9;

export class CritterSystem implements System {
  private _crittersToAdd = new Set<Critter>();
  private _crittersToRemove = new Set<Critter>();

  private _valueBuffer: number[] = [];

  private _critterGeometry = new THREE.CircleGeometry(0.1, 12);
  private _critterMaterials: THREE.MeshBasicMaterial[] = [];
  private _nextCritterMaterialIndex = 0;

  private _critterToMesh = new Map<Critter, THREE.Mesh>();

  private _colors = [
    0xff6b6b, // Red
    0x4ecdc4, // Teal
    0x45b7d1, // Blue
    0x96ceb4, // Green
    0xffeaa7, // Yellow
    0xdda0dd, // Plum
    0xf0a3a3, // Pink
    0xa8e6cf  // Mint
  ];

  constructor() {
    this._critterMaterials = this._colors.map(color => new THREE.MeshBasicMaterial({ color }));
  }

  addCritter(critter: Critter) {
    this._crittersToAdd.add(critter);
  }

  removeCritter(critter: Critter) {
    this._crittersToRemove.add(critter);
  }

  onAdd() { }
  onRemove() { }

  onTick(world: WorldState): void {
    this._removeCritters(world);
    this._addCritters(world);
    // do the critter thing
    for (const [_id, critter] of world.critters) {
      // zero out the buffer
      for (const i in this._valueBuffer) {
        this._valueBuffer[i] = 0;
      }

      // process critter connections
      for (const link of critter.links) {
        const { source, target, fn } = link;
        this._valueBuffer[target] = this._valueBuffer[target] + fn(critter.cells[source]);
      }

      // copy values out of the buffer
      for (const i in critter.cells) {
        critter.cells[i] = this._valueBuffer[i];
      }

      critter.heading += critter.cells[10];
      critter.velocity += critter.cells[11];

      // now process movement
      const heading = critter.heading;
      const velocity = critter.velocity;

      const dX = Math.cos(heading) * velocity;
      const dY = Math.sin(heading) * velocity;

      critter.position.x = dX;
      critter.position.y = dY;

      // enforce edges
      const boundLeft = world.environment.get("boundary_left");
      const boundRight = world.environment.get("boundary_right");
      const boundTop = world.environment.get("boundary_top");
      const boundBottom = world.environment.get("boundary_bottom");

      if (boundLeft == null || boundRight == null || boundTop == null || boundBottom == null) {
        throw new Error("Missing environment values");
      }

      if (critter.position.x < boundLeft) {
        critter.position.x = boundLeft;
      }
      if (critter.position.x > boundRight) {
        critter.position.x = boundRight;
      }
      if (critter.position.y < boundBottom) {
        critter.position.y = boundBottom;
      }
      if (critter.position.y < boundTop) {
        critter.position.y = boundTop;
      }

      // enforce drag
      critter.velocity *= DRAG;

    }
  }

  private _addCritters(world: WorldState) {
    for (const critter of this._crittersToAdd) {
      world.critters.set(critter.id, critter);
      const material = this._getMaterial();
      const mesh = new THREE.Mesh(this._critterGeometry, material);
      world.renderablesToAdd.push(mesh);
      this._critterToMesh.set(critter, mesh);
    }
    this._crittersToAdd.clear();
  }

  private _removeCritters(world: WorldState) {
    for (const c of this._crittersToRemove) {
      world.critters.delete(c.id);
      const mesh = this._critterToMesh.get(c);
      if (mesh != null) {
        world.renderablesToRemove.push(mesh);
        this._critterToMesh.delete(c);
      }
    }
    this._crittersToRemove.clear();
  }

  private _getMaterial() {
    const material = this._critterMaterials[this._nextCritterMaterialIndex++];
    if (this._nextCritterMaterialIndex >= this._critterMaterials.length) {
      this._nextCritterMaterialIndex = 0;
    }
    return material;
  }
}

/*

Memory map:
-- Inputs
[0]: food angle (relative)
[1]: food distance
[2]: neighbor angle (relative)
[3]: neighbor distance
[4]: energy
[5]: heading

-- Ouput
[10]: turn
[11]: accel

-- General
[11]
...
[60]
 */
