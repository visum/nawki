import { Simulation } from './simulation.js';
import { World } from './world.js';
import { Adam } from './critters/adam.js';

import { RendererSystem } from './systems/renderer_system.js';

import { Scene } from './scene.js';
import { CritterSystem } from './systems/critter_system.js';
import { FoodSystem } from './systems/food_system.js';

class App {
  private isRunning: boolean = true;

  private _simulation: Simulation;
  private _world: World;
  private _scene: Scene;

  constructor() {
    const canvas = document.getElementById('aquarium-canvas') as HTMLCanvasElement;
    if (!canvas) {
      throw new Error('Canvas element not found');
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this._scene = new Scene(canvas);
    this._scene.init();

    this._world = new World();

    (window as any).world = this._world;

    this._world.environment.set('boundary_left', -(canvas.width / 2));
    this._world.environment.set('boundary_right', canvas.width / 2);
    this._world.environment.set('boundary_top', canvas.height / 2);
    this._world.environment.set('boundary_bottom', -(canvas.height / 2));
    this._world.environment.set('drag', 0.9);

    this._simulation = new Simulation(this._world);

    this._simulation.addSystem(new RendererSystem(this._scene));
    // this._simulation.addSystem(new CritterNeighborSystem());
    this._simulation.addSystem(new FoodSystem());

    this._simulation.addSystem(new CritterSystem());


    this.setupControls();
    this.start();

    // TODO set up handling resize to resize the tank or scale the rendering
  }

  private setupControls(): void {
    const pauseBtn = document.getElementById('pause-btn') as HTMLButtonElement;
    const stepBtn = document.getElementById('step-btn') as HTMLButtonElement;
    const canvas = document.getElementById('aquarium-canvas') as HTMLCanvasElement;

    pauseBtn?.addEventListener('click', () => {
      this.isRunning = !this.isRunning;
      pauseBtn.textContent = this.isRunning ? 'Pause' : 'Resume';
    });

    stepBtn?.addEventListener('click', () => {
      this._simulation.tick();
    });

    canvas?.addEventListener('click', (event) => {
      const canvasRect = canvas.getBoundingClientRect();
      const canvasX = event.clientX - canvasRect.x;
      const canvasY = event.clientY - canvasRect.y;
      const x = canvasX - canvasRect.width / 2;
      const y = -(canvasY - canvasRect.height / 2);
      this._simulation.addCritter(Adam, { x, y });
    });
  }

  private animate = (): void => {
    if (this.isRunning) {
      this._simulation.tick();
    }

    requestAnimationFrame(this.animate);
  };


  public start(): void {
    requestAnimationFrame(this.animate);
  }
}

// Start the application
new App();
