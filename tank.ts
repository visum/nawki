import { Environment } from "./environment";
import { Critter } from "./critter";
import { Processor } from "./processor";

export class Tank {
  private _critters: Critter[] = [];
  private _processor = new Processor();
  private _environment: Environment;

  constructor(tank: Tank, critters: Critter[], environment: Environment) {
    this._critters = critters;

    this._environment = environment
  }
  addCritter(critter: Critter) {

  }

  removeCritter(critter: Critter) {
    const i = this._critters.indexOf(critter);
    if (i > -1) {
      this._critters.splice(i, 1);
    }
  }

  private _tick() {
    for (const c of this._critters) {
      this._processor.process(c, this._environment);
    }
  }
}
