import { nanoid } from "nanoid";

export type WorldState = {
  environment: Map<string, number>;
  entities: Entity[];
};

export type Entity = {
  id: string;
  type: string;
  components: Component[]
}

export type Component = {
  type: string;
  numberValues: Map<string, number | null>;
  stringValues: Map<string, string>;
  payload?: any;
}

export function firstComponentOrThrow(entity: Entity, componentType: string) {
  const cpt = entity.components.find(c => c.type === componentType);
  if (cpt == null) {
    throw new Error(`Component ${componentType} not found on entity ${entity.type}`);
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
  if (value === undefined) {
    throw new Error("Number value not found on component");
  }
  return value;
}

export class World implements WorldState {
  environment = new Map<string, number>();
  entities: Entity[] = [];

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
      numberValues: new Map<string, number | null>(),
      stringValues: new Map<string, string>(),
    }
  }

  getEntityById(id: string) {
    return this.entities.find(e => e.id == id);
  }

  getEntitiesWithComponent(componentType: string) {
    const result = new Set<Entity>();
    for (const e of this.entities) {
      if (e.components.some(c => c.type === componentType)) {
        result.add(e);
      }
    }
    return Array.from(result);
  }

  removeEntityById(id: string) {
    const i = this.entities.findIndex(e => e.id === id);

    if (i > -1) {
      this.entities.splice(i, 1);
    }
  }

  firstEntityByType(type: string) {
    return this.entities.find(e => e.type === type);
  }
}
