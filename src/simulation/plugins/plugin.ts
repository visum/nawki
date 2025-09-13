import { Critter } from "../../types/Critter";

export interface Plugin {
  beforeTick?(): void;
  afterTick?(): void;
  processCritter?(critter: Critter): void;
}
