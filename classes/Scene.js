let t = 0;
class Scene {
  constructor() {
    this.plane;
    this.cubes;
    this.finishLine;
    this.upgradeCubes;
  }

  async initializeScene() {
    this.plane = new Mesh();
    this.cubes = new Mesh();
    this.finishLine = new Mesh();
    this.upgradeCubes = [new Mesh(), new Mesh(), new Mesh()];

    await this.plane.setObj("./resources/plane/plane.obj");
    await this.cubes.setObj("./resources/plane/cubes.obj");
    await this.finishLine.setObj("./resources/plane/finishLine.obj");

    this.upgradeCubes.forEach((uc, i) => {
      uc.setObj("./resources/plane/cubeWithMe" + (i + 1) + ".obj");
    });
  }

  async drawScene(programInfo, world) {
    t += 0.01;
    this.plane.drawObj(programInfo, world);
    this.finishLine.drawObj(programInfo, world);
    this.drawUpgradeCubes(programInfo, world);
    this.drawCubes(programInfo, world);
  }

  drawCubes(programInfo, world) {
    let finalTime = time;
    let i = 2;
    let toAdd = time;

    this.cubes.parts.forEach((c) => {
      let world1 = m4.copy(world);

      if (
        Number.parseInt(c.object.slice(1, 3)) == 15 ||
        Number.parseInt(c.object.slice(1, 3)) == 18
      ) {
        toAdd = time * i;
        i += 2;
      }

      if (
        Number.parseInt(c.object.slice(1, 3)) >= 12 &&
        Number.parseInt(c.object.slice(1, 3)) <= 20
      )
        finalTime = toAdd;
      else finalTime = time;

      world1 = handleTranslation(c.object, world1, finalTime);

      drawMesh(programInfo, c.bufferInfo, world1, c.material);
    });
  }

  drawUpgradeCubes(programInfo, world) {
    let upgradeCubesPosition = [
      [-35, 0.8, 8],
      [-10, 0.8, -8],
      [40, 0.8, -6.5],
    ];

    this.upgradeCubes.forEach((uc, i) => {
      let world1 = m4.copy(world);
      world1 = m4.translate(
        world1,
        upgradeCubesPosition[i][0],
        upgradeCubesPosition[i][1],
        upgradeCubesPosition[i][2]
      );
      world1 = m4.yRotate(world1, degToRad(timeUpgrade));

      if (!isTake) uc.drawObj(programInfo, world1);
      else if (t > 2) {
        isTake = false;
        isSet = false;
        t = 0;
      }
    });
  }

  resetUpgradeCubes() {
    if (isTake) {
      isTake = false;
    }
  }
}
