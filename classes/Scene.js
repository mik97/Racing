let t = 0;
let upgradeCubesPosition;
let timeout;
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

    await this.plane.setObj("/resources/plane/plane.obj");
    await this.cubes.setObj("/resources/plane/cubes.obj");
    await this.finishLine.setObj("/resources/plane/finishLine.obj");

    this.upgradeCubes.forEach((uc, i) => {
      uc.setObj("/resources/plane/cubeWithMe" + (i + 1) + ".obj");
    });

    upgradeCubesPosition = [
      [-35, 0.8, 8],
      [-10, 0.8, -8],
      [40, 0.8, -6.5],
    ];
  }

  async drawScene(programInfo, world) {
    t += 0.01;
    this.plane.drawObj(programInfo, world);
    this.finishLine.drawObj(programInfo, world);

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

    this.drawCubes(programInfo, world);
  }

  drawCubes(programInfo, world) {
    let finalTime = time;
    let i = 2;
    toAdd = time;

    this.cubes.parts.forEach((c) => {
      let world1 = m4.copy(world);

      webglUtils.setBuffersAndAttributes(gl, programInfo, c.bufferInfo);

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

      if (world1 != undefined)
        webglUtils.setUniforms(
          programInfo,
          {
            u_world: this.handleTranslation(c.object, world1, finalTime),
          },
          c.material
        );
      else webglUtils.setUniforms(programInfo, {}, c.material);

      webglUtils.drawBufferInfo(gl, c.bufferInfo);
    });
  }

  handleTranslation(name, world, time) {
    if (name.includes("XN")) return m4.translate(world, -time, 0, 0);
    else if (name.includes("XP")) return m4.translate(world, time, 0, 0);
    else if (name.includes("ZN")) return m4.translate(world, 0, 0, -time);
    else if (name.includes("ZP")) return m4.translate(world, 0, 0, time);
    else return world;
  }

  resetUpgradeCubes() {
    if (isTake) {
      isTake = false;
      clearTimeout(timeout);
    }
  }
}
