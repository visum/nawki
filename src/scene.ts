import * as THREE from 'three';

export class Scene {
  private _scene: THREE.Scene;
  private _camera: THREE.OrthographicCamera;
  private _renderer: THREE.WebGLRenderer;
  private _canvas: HTMLCanvasElement;

  private _width: number;
  private _height: number;

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
    this._scene = new THREE.Scene();
    this._scene.background = new THREE.Color(0x001122);

    const width = canvas.width;
    const height = canvas.height;

    this._width = width;
    this._height = height;

    this._camera = new THREE.OrthographicCamera(
      -(width / 2), (width / 2), // left, right
      (height / 2), -(height / 2), // top, bottom
      1, 1000 // near, far
    );
    this._camera.position.z = 10;

    // Renderer setup
    this._renderer = new THREE.WebGLRenderer({
      canvas: this._canvas,
      antialias: true
    });
    this._renderer.setSize(width, height);
    this._renderer.setPixelRatio(window.devicePixelRatio);
  }

  init() {
    this._createEnvironment();
  }

  addMesh(mesh: THREE.Mesh) {
    this._scene.add(mesh);
  }

  removeMesh(mesh: THREE.Mesh) {
    this._scene.remove(mesh);
  }

  render() {
    this._renderer.render(this._scene, this._camera);
  }

  get threeScene() {
    return this._scene;
  }

  private _createEnvironment() {
    const floorGeometry = new THREE.PlaneGeometry(this._width, 0.2);
    const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x4a4a2a });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -(this._height / 2);
    this._scene.add(floor);

    // Aquarium walls (transparent)
    const wallMaterial = new THREE.MeshBasicMaterial({
      color: 0x88aaff,
      transparent: true,
      opacity: 0.1
    });

    // Left wall
    const leftWallGeometry = new THREE.PlaneGeometry(0.1, this._height);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.position.x = -(this._width / 2);
    this._scene.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    rightWall.position.x = (this._width / 2);
    this._scene.add(rightWall);

    // Top wall
    const topWallGeometry = new THREE.PlaneGeometry(this._width, 0.1);
    const topWall = new THREE.Mesh(topWallGeometry, wallMaterial);
    topWall.position.y = this._height / 2;
    this._scene.add(topWall);
  }

}
