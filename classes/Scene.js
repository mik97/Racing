class Scene {
  constructor() {
    this.plane;
  }

  async initializeScene() {
    this.plane = new Mesh();

    await this.plane.setObj("/resources/plane/plane.obj");
  }

  async drawScene(programInfo, world) {
    this.plane.drawObj(programInfo, world);
  }
}
