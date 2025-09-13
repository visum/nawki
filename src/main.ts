import { AquariumRenderer } from './renderer/AquariumRenderer.js';
import { Simulation } from './simulation/Simulation.js';
import { getAdamInstance } from './critters/adam.js';
import { Environment } from './types/Environment.js';
import { Food } from './simulation/plugins/food.js';
import { FoodRenderer } from './renderer/food_renderer.js';

class App {
  private renderer: AquariumRenderer;
  private simulation: Simulation;
  private isRunning: boolean = true;
  private timeScale: number = 1;
  private lastTime: number = 0;
  private frameCount: number = 0;
  private fpsTime: number = 0;

  private envrionment: Environment = {
    boundaries: {
      x: [-100, 100], y: [-100, 100],
    },
    buckets: new Map<string, any>()
  };


  constructor() {
    const canvas = document.getElementById('aquarium-canvas') as HTMLCanvasElement;
    if (!canvas) {
      throw new Error('Canvas element not found');
    }

    this.renderer = new AquariumRenderer(canvas);

    const foodPlugin = new Food(this.envrionment);
    const foodRenderer = new FoodRenderer(foodPlugin, this.renderer.scene);
    this.renderer.addPlugin(foodRenderer);
    this.simulation = new Simulation(this.envrionment, [foodPlugin]);

    this.setupControls();
    this.setupEventListeners();
    this.start();
  }

  private setupControls(): void {
    const pauseBtn = document.getElementById('pause-btn') as HTMLButtonElement;
    const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
    const stepBtn = document.getElementById('step-btn') as HTMLButtonElement;

    pauseBtn?.addEventListener('click', () => {
      this.isRunning = !this.isRunning;
      pauseBtn.textContent = this.isRunning ? 'Pause' : 'Resume';
    });

    resetBtn?.addEventListener('click', () => {
      this.simulation.reset();
    });

    stepBtn?.addEventListener('click', () => {
      const currentTime = performance.now();
      const deltaTime = currentTime - this.lastTime;
      this.lastTime = currentTime;


      this.simulation.update(deltaTime * this.timeScale);
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
      critter.position.x = x * this.envrionment.boundaries.x[1];
      critter.position.y = y * this.envrionment.boundaries.y[1];

      critter.id = this.simulation.getCritterCount();


      this.simulation.addCritter(critter);
    });
  }

  private updateStats(deltaTime: number): void {
    this.frameCount++;
    this.fpsTime += deltaTime;

    if (this.fpsTime >= 1000) { // Update FPS every second
      const fps = Math.round(this.frameCount / (this.fpsTime / 1000));
      document.getElementById('fps')!.textContent = fps.toString();
      this.frameCount = 0;
      this.fpsTime = 0;
    }

    document.getElementById('critter-count')!.textContent = this.simulation.getCritterCount().toString();
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
