import { nanoid } from "nanoid";
import * as THREE from "three";

export type WorldState = {
  environment: Map<string, number>;
  entities: Entity[];
  renderablesToAdd: THREE.Mesh[];
  renderablesToRemove: THREE.Mesh[];
};

export type Entity = {
  id: string;
  type: string;
  components: Component[]
}

export type Component = {
  type: string;
  numberValues: Map<string, number>;
  stringValues: Map<string, string>;
  payload?: any;
}

export function firstComponentOrThrow(entity: Entity, componentType: string) {
  const cpt = entity.components.find(c => c.type === componentType);
  if (cpt == null) {
    throw new Error("Component not found on that entity");
  }
  return cpt;
}

export function componentStringValueOrThrow(component: Component, name: string) {
  const value = component.stringValues.get(name);
  if (name == "") {
    throw new Error("String value not found on component");
  }
  return value;
}

export function componentNumberValueOrThrow(component: Component, name: string) {
  const value = component.numberValues.get(name);
  if (value == null) {
    throw new Error("Number value not found on component");
  }
  return value;
}

export class World implements WorldState {
  environment = new Map<string, number>();
  entities: Entity[] = [];
  renderablesToAdd: THREE.Mesh[] = [];
  renderablesToRemove: THREE.Mesh[] = [];

  static getEntity(type: string): Entity {
    return {
      id: nanoid(),
      type,
      components: []
    }
  }

  static getComponent(type: string): Component {
    return {
      type,
      numberValues: new Map<string, number>(),
      stringValues: new Map<string, string>(),
    }
  }

  getEntityById(id: string) {
    return this.entities.find(e => e.id == id);
  }

  removeEntityById(id: string) {
    const i = this.entities.findIndex(e => e.id === id);

    if (i > -1) {
      this.entities.slice(i, 1);
    }
  }

  firstEntityByType(type: string) {
    return this.entities.find(e => e.type === type);
  }
}
