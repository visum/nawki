import { Simulation } from './simulation.js';
import { getWorld, WorldState } from './world.js';

import { RendererSystem } from './systems/renderer_system.js';

import { Scene } from './scene.js';

class App {
  private isRunning: boolean = true;

  private _simulation: Simulation;
  private _world: WorldState;
  private _scene: Scene;

  constructor() {
    const canvas = document.getElementById('aquarium-canvas') as HTMLCanvasElement;
    if (!canvas) {
      throw new Error('Canvas element not found');
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this._scene = new Scene(canvas);

    this._world = getWorld();

    this._world.environment.set('boundary_left', -(canvas.width / 2));
    this._world.environment.set('boundary_right', canvas.width / 2);
    this._world.environment.set('boundary_top', canvas.height / 2);
    this._world.environment.set('boundary_bottom', -(canvas.height / 2));

    this._simulation = new Simulation(this._world);

    this._simulation.addSystem(new RendererSystem(this._scene));

    this.setupControls();
    this.start();

    // TODO set up handling resize to resize the tank or scale the rendering
  }

  private setupControls(): void {
    const pauseBtn = document.getElementById('pause-btn') as HTMLButtonElement;
    const stepBtn = document.getElementById('step-btn') as HTMLButtonElement;

    pauseBtn?.addEventListener('click', () => {
      this.isRunning = !this.isRunning;
      pauseBtn.textContent = this.isRunning ? 'Pause' : 'Resume';
    });

    stepBtn?.addEventListener('click', () => {
      this._simulation.tick();
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
