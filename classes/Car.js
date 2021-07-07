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
  attritoZ; // attriti
// let key;

class Car {
  constructor() {
    this.chassis = new Mesh();
    this.wheels = [];
  }

  async initializeCar(urls) {
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

    this.setWheels();

    // await this.chassis.setObj("/resources/go-kart/kart_chassis.obj");
    await this.chassis.setObj("/resources/go-kart/wheels.obj");

    // for (let i = 0; i < this.wheels.length; i++)
    //   await this.wheels[i].setObj(urls[i]);
  }

  setWheels() {
    for (let i = 0; i < 4; i++) this.wheels[i] = new Mesh();
  }

  drawCar(world) {
    world = m4.translate(world, px, py, pz);
    world = m4.yRotate(world, degToRad(facing));
    this.drawWheels(meshProgramInfo, world);
    // this.chassis.drawObj(meshProgramInfo, world);
    // this.drawWheelsP(world, this.wheels.slice(0, 2));
    // this.drawWheelsA(world, this.wheels.slice(2, 4));
  }

  drawWheels(programInfo, world) {
    this.chassis.worldMesh = world;
    this.chassis.parts.forEach((c) => {
      if (!c.object.includes("chassis")) {
        let world1 = m4.copy(world);
        world1 = m4.translate(world1, 0, 0, 0);
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
        webglUtils.setBuffersAndAttributes(gl, programInfo, c.bufferInfo);

        if (world1 != undefined)
          webglUtils.setUniforms(
            programInfo,
            {
              u_world: world1,
            },
            c.material
          );
        else webglUtils.setUniforms(programInfo, {}, c.material);

        webglUtils.drawBufferInfo(gl, c.bufferInfo);
      } else {
        webglUtils.setBuffersAndAttributes(gl, programInfo, c.bufferInfo);

        if (world != undefined)
          webglUtils.setUniforms(
            programInfo,
            {
              u_world: world,
            },
            c.material
          );
        else webglUtils.setUniforms(programInfo, {}, c.material);

        webglUtils.drawBufferInfo(gl, c.bufferInfo);
      }
    });
  }

  drawWheelsP(world, wheelsP) {
    wheelsP.forEach((w, index) => {
      let world1 = m4.copy(world);

      if (index == 0) world1 = m4.translate(world1, 0.434, 0.21, 0.32);
      else world1 = m4.translate(world1, -0.467, 0.21, 0.32);

      world1 = m4.xRotate(world1, degToRad(mozzoP));

      w.drawObj(meshProgramInfo, world1);
    });
  }

  drawWheelsA(world, wheelsA) {
    wheelsA.forEach((w, index) => {
      let world1 = m4.copy(world);

      if (index == 0) world1 = m4.translate(world1, 0.423, 0.2, -0.53);
      else world1 = m4.translate(world1, -0.45, 0.2, -0.53);

      world1 = m4.yRotate(world1, degToRad(sterzo));
      world1 = m4.xRotate(world1, degToRad(mozzoA));

      w.drawObj(meshProgramInfo, world1);
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

  reset() {
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
}
