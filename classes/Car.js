let px, py, pz, facing;
let mozzoA, mozzoP, sterzo;
let vx, vy, vz;
let velSterzo,
  velRitornoSterzo,
  accMax,
  attrito,
  raggioRuotaA,
  raggioRuotaP,
  grip,
  attritoX,
  attritoY,
  attritoZ;

class Car {
  constructor() {
    this.chassis = new Mesh();
  }

  async initializeCar() {
    this.set();

    await this.chassis.setObj("./resources/car/car.obj");
  }

  drawCar(world) {
    world = m4.translate(world, px, py, pz);
    world = m4.yRotate(world, degToRad(facing));
    this.drawWheels(meshProgramInfo, world);
  }

  drawWheels(programInfo, world) {
    this.chassis.worldMesh = world;

    this.chassis.parts.forEach((c) => {
      if (!c.object.includes("chassis")) {
        let world1 = m4.copy(world);

        if (c.object.includes("back")) {
          if (c.object.includes("right"))
            world1 = m4.translate(world1, 0.434, 0.21, 0.32);
          else world1 = m4.translate(world1, -0.467, 0.21, 0.32);

          world1 = m4.xRotate(world1, degToRad(mozzoP));
        } else {
          if (c.object.includes("right"))
            world1 = m4.translate(world1, 0.423, 0.2, -0.53);
          else world1 = m4.translate(world1, -0.45, 0.2, -0.53);

          world1 = m4.yRotate(world1, degToRad(sterzo));
          world1 = m4.xRotate(world1, degToRad(mozzoA));
        }

        drawMesh(programInfo, c.bufferInfo, world1, c.material);
      } else {
        drawMesh(programInfo, c.bufferInfo, world, c.material);
      }
    });
  }

  moveCar() {
    let cosf = Math.cos((facing * Math.PI) / 180.0);
    let sinf = Math.sin((facing * Math.PI) / 180.0);

    let vxm = +cosf * vx - sinf * vz;
    let vym = vy;
    let vzm = +sinf * vx + cosf * vz;

    if (key[2]) sterzo += velSterzo;
    if (key[3]) sterzo -= velSterzo;
    sterzo *= velRitornoSterzo;

    if (key[0]) vzm -= accMax;
    if (key[1]) vzm += accMax;

    vxm *= attritoX;
    vym *= attritoY;
    vzm *= attritoZ;

    let da = (180.0 * vzm) / (Math.PI * 0.4);
    mozzoA += da;
    da = (180.0 * vzm) / (Math.PI * 0.41);
    mozzoP += da;

    vx = +cosf * vxm + sinf * vzm;
    vy = vym;
    vz = -sinf * vxm + cosf * vzm;

    facing = facing - vzm * grip * sterzo;

    px += vx;
    py += vy;
    pz += vz;
  }

  set() {
    px = 2;
    py = 0;
    pz = 8;
    facing = 90;
    mozzoA = mozzoP = sterzo = 0;
    vx = vy = vz = 0;

    key = [false, false, false, false];

    velSterzo = 2;
    velRitornoSterzo = 0.93;

    accMax = 0.002;

    attritoZ = 0.991;
    attritoX = 0.8;
    attritoY = 1.0;

    raggioRuotaA = 0.25;
    raggioRuotaP = 0.3;

    grip = 0.45;
  }

  getCarCoords() {
    let carCoords = { xMin: 0, xMax: 0, zMin: 0, zMax: 0 };

    this.chassis.parts.forEach((w) => {
      if (w.object.includes("back_wheel_right")) {
        let coords = objCoords(w.p);
        carCoords.xMax = coords.xMax + 0.434;
        carCoords.zMax = coords.zMax + 0.32;
      }

      if (w.object.includes("front_wheel_left")) {
        let coords = objCoords(w.p);
        carCoords.xMin = coords.xMin - 0.45;
        carCoords.zMin = coords.zMin - 0.53;
      }
    });

    return carCoords;
  }
}
