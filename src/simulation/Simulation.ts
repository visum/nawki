import type { Critter, Vector2D } from '../types/Critter';
import { Environment } from '../types/Environment';
import { Processor } from './Processor';

export class Simulation {
  private critters: Critter[] = [];
  private time: number = 0;
  private processor: Processor = new Processor();

  private environment: Environment = {
    boundaries: {
      x: [-10, 10], y: [-10, 10],
    },
    foodPositions: new Map<number, Vector2D>()
  };

  constructor() {
    // Initialize empty simulation
  }

  addCritter(critter: Critter) {
    this.critters.push(critter);
  }

  public update(deltaTime: number): void {
    this.time += deltaTime;

    this.critters.forEach(critter => {
      this.updateCritter(critter, deltaTime);
    });

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
    this.processor.process(critter, this.environment, this.critters);
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
