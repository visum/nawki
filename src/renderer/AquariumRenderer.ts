import * as THREE from 'three';
import type { Critter } from '../types/Critter';

export class AquariumRenderer {
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private canvas: HTMLCanvasElement;
  private critterMeshes: Map<number, THREE.Mesh> = new Map();
  private critterGeometry: THREE.CircleGeometry;
  private critterMaterials: THREE.MeshBasicMaterial[];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.init();
  }

  private init(): void {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x001122);

    // Camera setup (orthographic for 2D aquarium view)
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.OrthographicCamera(
      -10 * aspect, 10 * aspect, // left, right
      10, -10, // top, bottom
      1, 1000 // near, far
    );
    this.camera.position.z = 10;

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Create aquarium background and walls
    this.createAquariumEnvironment();

    // Setup critter rendering materials
    this.setupCritterMaterials();
  }

  private createAquariumEnvironment(): void {
    // Aquarium floor
    const floorGeometry = new THREE.PlaneGeometry(20, 0.2);
    const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x4a4a2a });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -10;
    this.scene.add(floor);

    // Aquarium walls (transparent)
    const wallMaterial = new THREE.MeshBasicMaterial({
      color: 0x88aaff,
      transparent: true,
      opacity: 0.1
    });

    // Left wall
    const leftWallGeometry = new THREE.PlaneGeometry(0.1, 20);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.position.x = -10;
    this.scene.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    rightWall.position.x = 10;
    this.scene.add(rightWall);

    // Top wall
    const topWallGeometry = new THREE.PlaneGeometry(20, 0.1);
    const topWall = new THREE.Mesh(topWallGeometry, wallMaterial);
    topWall.position.y = 10;
    this.scene.add(topWall);

    // Add some ambient lighting effect
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

  }
  private setupCritterMaterials(): void {
    this.critterGeometry = new THREE.CircleGeometry(0.1, 12);

    // Create different colored materials for variety
    const colors = [
      0xff6b6b, // Red
      0x4ecdc4, // Teal
      0x45b7d1, // Blue
      0x96ceb4, // Green
      0xffeaa7, // Yellow
      0xdda0dd, // Plum
      0xf0a3a3, // Pink
      0xa8e6cf  // Mint
    ];

    this.critterMaterials = colors.map(color =>
      new THREE.MeshBasicMaterial({ color })
    );
  }

  public render(critters: Critter[]): void {
    // Update existing critter meshes or create new ones
    const currentCritterIds = new Set<number>();

    critters.forEach((critter, index) => {
      currentCritterIds.add(critter.id);

      let mesh = this.critterMeshes.get(critter.id);

      if (!mesh) {
        // Create new critter mesh
        const materialIndex = index % this.critterMaterials.length;
        mesh = new THREE.Mesh(this.critterGeometry, this.critterMaterials[materialIndex]);
        this.critterMeshes.set(critter.id, mesh);
        this.scene.add(mesh);
      }

      // Update critter position and rotation
      mesh.position.x = critter.position.x;
      mesh.position.y = critter.position.y;

      // Rotate critter based on velocity direction
      if (critter.velocity.x !== 0 || critter.velocity.y !== 0) {
        mesh.rotation.z = Math.atan2(critter.velocity.y, critter.velocity.x);
      }

      mesh.scale.setScalar(1);
    });

    // Remove meshes for critters that no longer exist
    this.critterMeshes.forEach((mesh, id) => {
      if (!currentCritterIds.has(id)) {
        this.scene.remove(mesh);
        this.critterMeshes.delete(id);
      }
    });
    // Render the scene
    this.renderer.render(this.scene, this.camera);
  }

  public handleResize(): void {
    const aspect = window.innerWidth / window.innerHeight;

    this.camera.left = -5 * aspect;
    this.camera.right = 5 * aspect;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public dispose(): void {
    this.critterMeshes.forEach(mesh => {
      this.scene.remove(mesh);
    });
    this.critterMeshes.clear();

    this.critterGeometry.dispose();
    this.critterMaterials.forEach(material => material.dispose());

    this.renderer.dispose();
  }
}
