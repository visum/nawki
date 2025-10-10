import { System } from "../types/system";
import { componentNumberValueOrThrow, firstComponentOrThrow, World } from "../world";
import * as THREE from "three";
import { CritterBrain } from "./critter_brain";

/*
 *  We need to instantiate a CritterBrain for each of the
 *  critters, and keep in a map.
 *
 *  On each tick, we update the input values, then
 *  read the output values, then decay.
 *
 *  Maybe the CritterBrain holds environmental state as well...
 *
 *  What we really need is just the critter definition, not an instance
 *  of a critter with state.
 *
 *  TODO: Make the critters on the world entities?
 *  for each critterToAdd, instantiate a new CritterBrain
 *
 * */

export class CritterSystem implements System {
  private _critterIdToBrain = new Map<string, CritterBrain>();

  private _critterGeometry: THREE.BufferGeometry;
  private _critterMaterials: THREE.MeshBasicMaterial[] = [];
  private _nextCritterMaterialIndex = 0;

  private _critterIdToMesh = new Map<string, THREE.Mesh>();

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

    this._critterGeometry = new THREE.BufferGeometry();

    const vertices = new Float32Array([
      6, 0.0, 0.0,   // Tip (right)
      -0.1, 3.2, 0.0,  // Top back
      -0.1, -3.2, 0.0  // Bottom back
    ]);

    this._critterGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
  }

  onAdd() { }
  onRemove() { }

  onTick(world: World): void {
    this._removeCritters(world);
    this._addCritters(world);
    // do the critter thing
    const critterEntities = world.entities.filter(e => e.type === "critter");
    for (const ce of critterEntities) {
      const brain = this._critterIdToBrain.get(ce.id);
      if (!brain) {
        continue;
      }

      // assign input values
      brain.setCellValue(CELL_IO_INDEXES.ENERGY, brain.state.energy);
      brain.setCellValue(CELL_IO_INDEXES.HEADING, brain.state.heading);
      brain.setCellValue(CELL_IO_INDEXES.VELOCITY, brain.state.velocity);

      const foodCpt = firstComponentOrThrow(ce, "food");
      const foodDistance = componentNumberValueOrThrow(foodCpt, "distance");
      const foodAngle = componentNumberValueOrThrow(foodCpt, "relativeAngle");

      brain.setCellValue(CELL_IO_INDEXES.FOOD_DISTANCE, foodDistance);
      brain.setCellValue(CELL_IO_INDEXES.FOOD_ANGLE, foodAngle);

      // read outputs
      const accel = brain.readCellValue(CELL_IO_INDEXES.ACCELLERATE);
      const turn = brain.readCellValue(CELL_IO_INDEXES.TURN);

      if (accel != null) {
        brain.state.velocity += accel;
      }

      if (turn != null) {
        brain.state.heading += turn;
      }

      // now process movement
      const heading = brain.state.heading;
      const velocity = brain.state.velocity;

      const dX = Math.cos(heading) * velocity;
      const dY = Math.sin(heading) * velocity;

      brain.state.position.x = dX;
      brain.state.position.y = dY;

      // enforce edges
      const boundLeft = world.environment.get("boundary_left");
      const boundRight = world.environment.get("boundary_right");
      const boundTop = world.environment.get("boundary_top");
      const boundBottom = world.environment.get("boundary_bottom");

      if (boundLeft == null || boundRight == null || boundTop == null || boundBottom == null) {
        throw new Error("Missing environment values");
      }

      if (brain.state.position.x < boundLeft) {
        brain.state.position.x = boundLeft;
      }
      if (brain.state.position.x > boundRight) {
        brain.state.position.x = boundRight;
      }
      if (brain.state.position.y < boundBottom) {
        brain.state.position.y = boundBottom;
      }
      if (brain.state.position.y > boundTop) {
        brain.state.position.y = boundTop;
      }

      const position = firstComponentOrThrow(ce, "position");

      position.numberValues.set("x", brain.state.position.x);
      position.numberValues.set("y", brain.state.position.y);

      const headingComponent = firstComponentOrThrow(ce, "heading");
      headingComponent.numberValues.set("heading", heading);

      // enforce drag
      brain.state.velocity *= world.environment.get('drag') ?? 0;
      brain.decay();

    }
  }

  private _addCritters(world: World) {

    const addEntity = world.firstEntityByType('critters-to-add');
    if (!addEntity) {
      return;
    }

    const critterComponents = addEntity.components.filter(c => c.type === "critter");

    for (const critterComponent of critterComponents) {
      const critterDefinition = critterComponent.payload;
      if (!critterDefinition) {
        continue;
      }
      const entity = World.getEntity("critter");
      const component = World.getComponent("critter_definition");
      const position = World.getComponent("position");
      position.numberValues.set("x", 0);
      position.numberValues.set("y", 0);

      const heading = World.getComponent("heading");
      heading.numberValues.set("heading", 0);

      const velocity = World.getComponent("velocity");
      velocity.numberValues.set("velocity", 0);

      const nearbyFood = World.getComponent("food");
      nearbyFood.numberValues.set("distance", 0);
      nearbyFood.numberValues.set("relativeAngle", 0);

      const renderable = World.getComponent("renderable");

      const brainCpt = World.getComponent("brain");

      entity.components.push(nearbyFood);
      entity.components.push(component);
      entity.components.push(heading);
      entity.components.push(velocity);
      entity.components.push(position);
      entity.components.push(renderable);
      entity.components.push(brainCpt);
      world.entities.push(entity);

      component.payload = critterDefinition;
      const brain = new CritterBrain(entity.id);
      brain.buildFromDefinition(critterDefinition);
      this._critterIdToBrain.set(entity.id, brain);

      brainCpt.payload = brain;

      const material = this._getMaterial();
      const mesh = new THREE.Mesh(this._critterGeometry, material);
      renderable.payload = mesh;
      mesh.position.x = 0;
      mesh.position.y = 0;
      this._critterIdToMesh.set(entity.id, mesh);
    }

    addEntity.components.length = 0;
  }

  private _removeCritters(world: World) {
    const removalEntity = world.firstEntityByType("critters-to-remove");
    if (!removalEntity) {
      return;
    }
    const crittersToRemove = removalEntity.components.filter(c => c.type = "critterId");

    for (const component of crittersToRemove) {
      const cId = component.stringValues.get('id');
      if (!cId) {
        continue;
      }

      world.removeEntityById(cId);
      const mesh = this._critterIdToMesh.get(cId);
      if (mesh) {
        this._critterIdToMesh.delete(cId);
      }
    }
    removalEntity.components.length = 0;
    world.removeEntityById(removalEntity.id);
  }

  private _getMaterial() {
    const material = this._critterMaterials[this._nextCritterMaterialIndex++];
    if (this._nextCritterMaterialIndex >= this._critterMaterials.length) {
      this._nextCritterMaterialIndex = 0;
    }

    return material;
  }
}


export const CELL_IO_INDEXES = {
  // input/senses
  FOOD_ANGLE: 0,
  FOOD_DISTANCE: 1,
  NEIGHBOR_ANGLE: 2,
  NEIGHBOR_DISTANCE: 3,
  ENERGY: 4,
  HEADING: 5,
  VELOCITY: 6,
  // output/behavior
  TURN: 10,
  ACCELLERATE: 11,
};

/*

Memory map:
-- Inputs
[0]: food angle (relative)
[1]: food distance
[2]: neighbor angle (relative)
[3]: neighbor distance
[4]: energy
[5]: heading
[6]: velocity

-- Ouput
[10]: turn
[11]: accel

-- General
[20]
...
[60]
 */
