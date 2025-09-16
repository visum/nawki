import { AquariumRenderer } from './renderer/AquariumRenderer.js';
import { getAdamInstance } from './critters/adam.js';
import { nanoid } from 'nanoid';

import { Simulation } from './simulation.js';
import { getWorld, WorldState } from './world.js';

class App {
  private renderer: AquariumRenderer;
  private isRunning: boolean = true;

  private _simulation: Simulation;
  private _world: WorldState;

  constructor() {
    const canvas = document.getElementById('aquarium-canvas') as HTMLCanvasElement;
    if (!canvas) {
      throw new Error('Canvas element not found');
    }

    this._world = getWorld();
    this._simulation = new Simulation(this._world);

    this.setupControls();
    this.setupEventListeners();
    this.start();
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

  private setupEventListeners(): void {
    window.addEventListener('resize', () => {
      this.renderer.handleResize();
    });

    // Add some critters on click
    this.renderer.getCanvas().addEventListener('click', (e) => {
      const rect = this.renderer.getCanvas().getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;


      const critter = getAdamInstance();
      this._simulation.addCritter(nanoid(), critter);
    });
  }

  private animate = (currentTime: number): void => {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    if (this.isRunning) {
      this.simulation.update(deltaTime * this.timeScale);
    }

    this.renderer.render(this.simulation.getCritters());
    this.updateStats(deltaTime);

    requestAnimationFrame(this.animate);
  };


  public start(): void {

    this.lastTime = performance.now();
    requestAnimationFrame(this.animate);
  }
}

// Start the application
new App();
