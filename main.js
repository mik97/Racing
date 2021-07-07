let canvas, gl, vertexShaderSource, fragmentShaderSource;

let buttonA, buttonI, arrowSx, arrowDx, e, first, third, controller;

let meshProgramInfo;

let car, urls, sky, scene;

let touchCoord;

let firstPerson;

let time = 0,
  toAdd;

let timeUpgrade = 0;
let isTake = false;
let isSet = false;

let key,
  slowlyCube = false,
  isInvisible = false,
  stopCube = false,
  isStarted = false,
  upgradeChoice = -1;

let theta = degToRad(90),
  phi = degToRad(70);
let d = 3;
let drag,
  cameraRotationY = 0,
  cameraRotationX = 0,
  isRotateX = false,
  isRotateY = false;

let collision = false,
  change = false;

let xMin, xMax, zMin, zMax;

let gameover, increase;
let canvas2, gl2d, canvas3, gl3;

let check1, check2m, div;

let oldTextures = [];
async function main() {
  canvas = document.getElementById("canvas");
  gl = canvas.getContext("webgl2");
  canvas2 = document.querySelector("#overlay");
  gl2d = canvas2.getContext("2d");
  canvas3 = document.querySelector("#overlay3");
  gl3 = canvas3.getContext("2d");

  // let container = document.getElementById("innerContainer");
  buttonI = document.getElementById("img1");
  buttonA = document.getElementById("img2");
  arrowSx = document.getElementById("img3");
  arrowDx = document.getElementById("img4");
  e = document.getElementById("e");
  first = document.getElementById("firstPerson");
  third = document.getElementById("thirdPerson");
  gameover = document.getElementById("gameover");

  if (navigator.userAgent.match(/Android/)) {
    buttonI.hidden = false;
    buttonA.hidden = false;
    arrowSx.hidden = false;
    arrowDx.hidden = false;
    e.hidden = false;
    first.hidden = false;
    third.hidden = false;
  }

  handleTouch(buttonI, 83);
  handleTouch(buttonA, 87);
  handleTouch(arrowSx, 65);
  handleTouch(arrowDx, 68);
  handleTouch(e, 69);

  firstPerson = false;

  handleFirstOrThirdP(first, true);
  handleFirstOrThirdP(third, false);

  if (!gl) return;

  canvas.onmousedown = mouseDown;
  canvas.onmouseup = mouseUp;
  canvas.onmouseout = mouseUp;
  canvas.onmousemove = mouseMove;
  canvas.onwheel = mouseWheel;
  canvas.ontouchstart = touchStart;
  canvas.ontouchmove = touchMove;
  canvas.ontouchend = touchEnd;

  check1 = document.getElementById("texture");
  check2 = document.getElementById("bump");
  div = document.getElementById("overlay2");

  check1.onclick = () => {
    textureOnClick(car.chassis, oldTextures[0]);
    textureOnClick(scene.plane, oldTextures[1]);
    scene.upgradeCubes.forEach((uc) => {
      textureOnClick(uc, oldTextures[3]);
      textureOnClick(uc, oldTextures[4]);
      textureOnClick(uc, oldTextures[5]);
    });
  };
  check2.onclick = () => {
    bumpOnClick(car.chassis, oldTextures[0]);
    bumpOnClick(scene.plane, oldTextures[1]);
    bumpOnClick(scene.cubes, oldTextures[2]);
  };

  window.addEventListener("load", () => {
    setTimeout(() => {
      const loadingScreen = document.querySelector(".loadingScreen");
      loadingScreen.className = "loadingScreen hidden";
      const loader = document.querySelector(".loader");
      loader.className = "loader hidden";
    }, 3000);
  });

  window.addEventListener("keydown", keyDown, true);
  window.addEventListener("keyup", keyUp, true);

  vertexShaderSource = await (
    await fetch("./shaders/vertexShader.vs.glsl")
  ).text();
  fragmentShaderSource = await (
    await fetch("./shaders/fragmentShader.fs.glsl")
  ).text();

  meshProgramInfo = webglUtils.createProgramInfo(gl, [
    vertexShaderSource,
    fragmentShaderSource,
  ]);

  urls = [
    "/resources/go-kart/kart_wheel_back_right2.obj",
    "/resources/go-kart/kart_wheel_back_left2.obj",
    "/resources/go-kart/kart_wheel_front_right2.obj",
    "/resources/go-kart/kart_wheel_front_left2.obj",
  ];

  sky = new Sky();

  scene = new Scene();

  car = new Car();

  await scene.initializeScene();

  await sky.initializeSky();

  await car.initializeCar(urls);

  oldTextures.push(this.getOld(car.chassis));
  oldTextures.push(this.getOld(scene.plane));
  oldTextures.push(this.getOld(scene.cubes));
  scene.upgradeCubes.forEach((uc) => {
    oldTextures.push(this.getOld(uc));
  });

  render();
}

function getOld(mesh) {
  let oldDiffuseMap, oldSpecularMap, oldNormalMap;
  let olds = [];
  for (const { material } of mesh.parts) {
    oldDiffuseMap = material.diffuseMap;
    oldSpecularMap = material.specularMap;
    oldNormalMap = material.normalMap;
    olds.push({ oldDiffuseMap, oldSpecularMap, oldNormalMap });
  }
  return olds;
}

function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

let toIncrement, time2, toIncrement2;

async function render() {
  gl2d.clearRect(0, 0, gl2d.canvas.width, gl2d.canvas.height);

  if (!isInvisible && !slowlyCube && !stopCube)
    gl3.clearRect(0, 0, gl2d.canvas.width, gl2d.canvas.height);

  if (key[5]) firstPerson = false;

  if (key[6]) firstPerson = true;

  if (!collision && !stopCube) {
    if (time <= 0.1) {
      toIncrement = true;
    } else if (time >= 1.8) {
      toIncrement = false;
    }

    if (slowlyCube) {
      increase = 0.002;
      setTimeout(() => {
        slowlyCube = false;
      }, 4000);
    } else increase = 0.005;

    if (toIncrement) time += increase;
    else time -= increase;
  }

  timeUpgrade += 1;

  webglUtils.resizeCanvasToDisplaySize(canvas);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.enable(gl.DEPTH_TEST);

  let target = [0, 0, 0];

  let position = thirdPersonCameraPosition();

  let deg;

  if (firstPerson) deg = 30;
  else deg = 60;

  const projectionMatrix = m4.perspective(
    degToRad(deg),
    canvas.width / canvas.height,
    1,
    2000
  );

  const up = [0, 1, 0];
  // theta = degToRad(facing);
  let camera = m4.lookAt(position, target, up);
  let viewMatrix = m4.inverse(camera);

  viewMatrix = m4.yRotate(viewMatrix, degToRad(-facing));
  // if (isRotateY) viewMatrix = m4.yRotate(viewMatrix, degToRad(cameraRotationX));
  // if (isRotateX) viewMatrix = m4.xRotate(viewMatrix, degToRad(cameraRotationY));

  viewMatrix[12] = 0;
  viewMatrix[13] = 0;
  viewMatrix[14] = 0;
  let viewDirectionProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
  sky.drawSky(m4.inverse(viewDirectionProjectionMatrix));

  viewMatrix = m4.inverse(camera);
  // viewMatrix = m4.xRotate(viewMatrix, degToRad(20));
  if (firstPerson) {
    viewMatrix = m4.xRotate(viewMatrix, degToRad(-10));
    viewMatrix = m4.translate(viewMatrix, 0, -0.3, 2.6);
    d = 3.5;
    phi = degToRad(70);
    theta = degToRad(90);
    position = thirdPersonCameraPosition();
  }

  // if (isRotateY) viewMatrix = m4.yRotate(viewMatrix, degToRad(cameraRotationX));
  // if (isRotateX) viewMatrix = m4.xRotate(viewMatrix, degToRad(cameraRotationY));

  // first-person
  viewMatrix = m4.yRotate(viewMatrix, degToRad(-facing));
  viewMatrix = m4.translate(viewMatrix, -px, -py, -pz);

  let worldMatrix = m4.identity();

  const sharedUniforms = {
    u_projection: projectionMatrix,
    u_view: viewMatrix,
    u_world: worldMatrix,
    u_viewWorldPosition: position,
    L: m4.normalize([-1, 3, 5]),
  };

  gl.useProgram(meshProgramInfo.program);

  webglUtils.setUniforms(meshProgramInfo, sharedUniforms);

  if (stopCube) {
    time = 0;
    scene.drawCubes(meshProgramInfo, worldMatrix);
    setTimeout(() => {
      stopCube = false;
    }, 4000);
  }

  await scene.drawScene(meshProgramInfo, worldMatrix);

  car.drawCar(worldMatrix);

  let planeCoords = objCoords(scene.plane.position);

  let carCoords = { xMin, xMax, zMin, zMax };

  car.chassis.parts.forEach((w) => {
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

  // let carCoords = objCoords(car.chassis.position);

  let cubeCoords = [];

  if (!isInvisible) {
    scene.cubes.parts.forEach((c, i) => {
      cubeCoords.push(objCoords(c.p));
    });

    cubeCoords.forEach((c, i) => {
      let deltaX = 0,
        deltaZ = 0;
      let name = scene.cubes.parts[i].object;
      let nameToNumber = Number.parseInt(name.slice(1, 3));

      if (name.includes("XN")) deltaX = -time;
      else if (name.includes("XP")) deltaX = time;
      else if (name.includes("ZN")) deltaZ = -time;
      else if (name.includes("ZP")) deltaZ = time;
      else if (nameToNumber >= 15 && nameToNumber <= 17) deltaZ = -time * 4;
      else if (nameToNumber >= 18 && nameToNumber <= 20) deltaZ = -time * 4;
      if (
        carCoords.xMin + px <= c.xMax + deltaX - 0.2 &&
        carCoords.xMax + px >= c.xMin + deltaX &&
        carCoords.zMin + pz <= c.zMax + deltaZ - 0.2 &&
        carCoords.zMax + pz >= c.zMin + deltaZ
      ) {
        collision = true;
      }
    });
  } else {
    setTimeout(() => {
      isInvisible = false;
    }, 4000);
  }

  if (
    !(
      carCoords.xMin + px <= planeCoords.xMax - 1 &&
      carCoords.xMax + px >= planeCoords.xMin + 1 &&
      carCoords.zMin + pz <= planeCoords.zMax - 1 &&
      carCoords.zMax + pz >= planeCoords.zMin + 1
    )
  ) {
    await car.reset();
  }

  if (
    carCoords.xMin + px <= planeCoords.xMax - 12 &&
    carCoords.xMax + px >= planeCoords.xMin + 12 &&
    carCoords.zMin + pz <= planeCoords.zMax - 6.5 &&
    carCoords.zMax + pz >= planeCoords.zMin + 6.5
  ) {
    await car.reset();
  }
  scene.upgradeCubes.forEach((c) => {
    if (
      car.chassis.worldMesh[12] <= c.worldMesh[12] + 0.5 &&
      car.chassis.worldMesh[12] >= c.worldMesh[12] - 0.5 &&
      car.chassis.worldMesh[14] <= c.worldMesh[14] + 0.5 &&
      car.chassis.worldMesh[14] >= c.worldMesh[14] - 0.5
    ) {
      isTake = true;
    }
  });

  if (!isSet && isTake) {
    upgradeChoice = Math.floor(Math.random() * 3);
    console.log(upgradeChoice);
    isSet = true;
  }

  if (key[4] == true) {
    checkUpgrade(upgradeChoice);
    upgradeChoice = -1;
  }

  gl3.font = "18px Oswald";
  gl3.fillStyle = "white";
  gl3.textAlign = "center";

  if (!collision) car.moveCar();
  else gameover.hidden = false;

  gl2d.font = "18px Oswald";
  gl2d.fillStyle = "white";
  gl2d.fillText("Pannello di controllo", 1, 12);
  gl2d.font = "12px Monospace";
  gl2d.fillText("'W' - Muove in avanti l'auto", 1, 27);
  gl2d.fillText("'S' - Muove indietro l'auto", 1, 42);
  gl2d.fillText("'A' - Muove a sinistra l'auto", 1, 57);
  gl2d.fillText("'D' - Muove a destra l'auto", 1, 72);
  gl2d.fillText("'E' - Attiva il potenziamento", 1, 87);
  gl2d.fillText("'F' - Attiva la visuale in prima persona", 1, 102);
  gl2d.fillText("'T' - Attiva la visuale in terza persona", 1, 117);
  gl2d.fillText(
    "'Pulsante sinistro del mouse' - Ruota/Inclina la visuale",
    1,
    132
  );
  gl2d.fillText("'Rotella del mouse' - Zoom In/Zoom Out", 1, 147);

  requestAnimationFrame(render);
}

let mouseDown = (event) => {
  event.preventDefault();
  drag = true;
  // const rect = canvas.getBoundingClientRect();
  oldX = event.pageX;
  oldY = event.pageY;
  return false;
};

let mouseUp = (event) => {
  drag = false;
};

let mouseMove = (event) => {
  if (!drag) return false;

  const location = mouseOnCanvas(event.pageX, event.pageY);

  if (!firstPerson) handleMovement(location);
};

function handleMovement(loc) {
  if (loc.x < oldX) {
    oldX = loc.x;
    theta += (-1 * Math.PI) / 180;
    isRotateX = true;
  } else if (loc.x > oldX) {
    oldX = loc.x;
    theta -= (-1 * Math.PI) / 180;
    isRotateX = true;
  }

  if (loc.y < oldY) {
    oldY = loc.y;
    if (phi < 1.2) phi -= (-1 * Math.PI) / 180;
    isRotateY = true;
  } else if (loc.y > oldY) {
    oldY = loc.y;
    if (phi > 0.1) phi += (-1 * Math.PI) / 180;
    isRotateY = true;
  }
}

let mouseWheel = (event) => {
  if (!firstPerson) event.deltaY < 0 ? (d *= 0.8) : (d *= 1.2);
};

function keyDown(event) {
  handleKey(event.keyCode, [87, 83, 65, 68, 69, 84, 70], true);
}

function keyUp(event) {
  handleKey(event.keyCode, [87, 83, 65, 68, 69, 84, 70], false);
}

function touchStart(event) {
  event.preventDefault();
  drag = true;

  for (let i = 0; i < event.targetTouches.length; i++) {
    oldX = event.targetTouches[i].pageX;
    oldY = event.targetTouches[i].pageY;
  }
}

function touchMove(event) {
  event.preventDefault();

  if (!drag) return false;

  for (let i = 0; i < event.targetTouches.length; i++) {
    const location = mouseOnCanvas(
      event.targetTouches[i].pageX,
      event.targetTouches[i].pageY
    );

    if (!firstPerson) handleMovement(location);
  }
}

function touchEnd(event) {
  event.preventDefault();

  drag = false;
}

function firstPersonCameraPosition() {
  return [0, 1, d * Math.sin(phi)];
}

function thirdPersonCameraPosition() {
  return [
    d * Math.sin(phi) * Math.cos(theta),
    d * Math.cos(phi),
    d * Math.sin(phi) * Math.sin(theta),
  ];
}

function checkUpgrade(n) {
  switch (n) {
    case 0:
      isInvisible = true;
      gl3.fillText("Collisions disabled", 75, 12);
      break;
    case 1:
      slowlyCube = true;
      gl3.fillText("Slowly Cubes", 75, 12);
      break;
    case 2:
      stopCube = true;
      gl3.fillText("Cubes Stopped", 75, 12);
      break;
  }
}

function textureOnClick(mesh, textures) {
  let i = 0;
  if (!check1.checked) {
    for (const { material } of mesh.parts) {
      material.diffuseMap = create1PixelTexture(gl, [255, 255, 255, 255]);
      material.specularMap = create1PixelTexture(gl, [255, 255, 255, 255]);
    }
  } else {
    for (const { material } of mesh.parts) {
      material.diffuseMap = textures[i].oldDiffuseMap;
      material.specularMap = textures[i].oldSpecularMap;
      i++;
    }
  }
}

function bumpOnClick(mesh, textures) {
  let i = 0;
  if (!check2.checked) {
    for (const { material } of mesh.parts) {
      material.normalMap = create1PixelTexture(gl, [127, 127, 255, 0]);
    }
  } else {
    for (const { material } of mesh.parts) {
      material.normalMap = textures[i].oldNormalMap;
      i++;
    }
  }
}

function handleTouch(button, key) {
  button.ontouchstart = (e) => {
    e.preventDefault();
    handleKey(key, [87, 83, 65, 68, 69], true);
  };

  button.ontouchend = (e) => {
    e.preventDefault();
    handleKey(key, [87, 83, 65, 68, 69], false);
  };

  button.oncontextmenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };
}

function handleFirstOrThirdP(button, cameraMode) {
  button.ontouchstart = (e) => {
    e.preventDefault();
    firstPerson = cameraMode;
  };

  button.ontouchend = (e) => {
    e.preventDefault();
  };

  window.oncontextmenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };
}

if (!navigator.userAgent.match(/Chrome\/9[0-1]/)) {
  alert("Chrome is not updated! Please update to play the game!");
} else main();
