import { nanoid } from "nanoid";
import * as THREE from "three";
import { Critter } from "./types/Critter";

export type WorldState = {
  environment: Map<string, number>;
  entities: Entity[];
  renderables: THREE.Mesh[];
  critters: Map<string, Critter>;
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
}

export function getEntity(type: string): Entity {
  return {
    id: nanoid(),
    type,
    components: []
  };
}

export function getComponent(type: string): Component {
  return {
    type,
    numberValues: new Map<string, number>(),
    stringValues: new Map<string, string>()
  };
}

export function getWorld(): WorldState {
  return {
    environment: new Map<string, number>(),
    entities: [],
    renderables: [],
    critters: new Map<string, Critter>()
  }
}
