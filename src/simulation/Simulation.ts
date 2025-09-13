import type { Critter } from '../types/Critter';
import { Environment } from '../types/Environment';
import { Processor } from './Processor';
import { Plugin } from './plugins/plugin';

export class Simulation {
  private critters: Critter[] = [];
  private time: number = 0;
  private processor: Processor = new Processor();
  private environment: Environment;

  private _plugins: Plugin[] = [];

  constructor(environment: Environment, plugins: Plugin[] = []) {
    // Initialize empty simulation
    this._plugins = plugins;
    this.environment = environment;
  }

  addCritter(critter: Critter) {
    this.critters.push(critter);
  }

  public update(deltaTime: number): void {
    this.time += deltaTime;
    for (const plug of this._plugins) {
      if (typeof plug.beforeTick === 'function') {
        plug.beforeTick();
      }
    }

    this.critters.forEach(critter => {
      this.updateCritter(critter, deltaTime);

      for (const plug of this._plugins) {
        if (typeof plug.processCritter === 'function') {
          plug.processCritter(critter);
        }
      }
    });

    for (const plug of this._plugins) {
      if (typeof plug.afterTick === 'function') {
        plug.afterTick();
      }
    }
  }

  private updateCritter(critter: Critter, deltaTime: number): void {
    const dt = deltaTime / 1000; // Convert to seconds
    // Simple behavioral AI
    this.applyBehaviors(critter);

    // Update position based on velocity
    critter.position.x += critter.velocity.x * dt;
    critter.position.y += critter.velocity.y * dt;
  }

  private applyBehaviors(critter: Critter): void {
    this.processor.process(critter, this.environment, this.critters, this._plugins);
  }

  public getCritters(): Critter[] {
    return [...this.critters]; // Return copy to prevent external mutation
  }

  public getCritterCount(): number {
    return this.critters.length;
  }

  public getTime(): number {
    return this.time;
  }

  public reset(): void {
    this.critters = [];
    this.time = 0;
  }
}
