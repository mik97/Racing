let canvas, gl, vertexShaderSource, fragmentShaderSource, meshProgramInfo;
let canvas2, gl2d, canvas3, gl3;

let car, sky, scene;

let firstPerson;

let time = 0;

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
let drag;

let collision = false;

let gameover, increase;
let toIncrement, time2, toIncrement2;

let oldTextures = [];

async function main() {
  canvas = document.getElementById("canvas");
  gl = canvas.getContext("webgl2");

  canvas2 = document.querySelector("#overlay2");
  gl2d = canvas2.getContext("2d");

  canvas3 = document.querySelector("#overlay");
  gl3 = canvas3.getContext("2d");

  gameover = document.getElementById("gameover");

  const check1 = document.getElementById("texture");
  const check2 = document.getElementById("bump");

  const controller = new Controller();
  controller.setController();

  if (navigator.userAgent.match(/Android/)) controller.hideController();

  handleTouch(controller.buttonW, 83);
  handleTouch(controller.buttonS, 87);
  handleTouch(controller.buttonA, 65);
  handleTouch(controller.buttonD, 68);
  handleTouch(controller.upgrade, 69);

  firstPerson = false;

  handleFirstOrThirdP(controller.firstPerson, true);
  handleFirstOrThirdP(controller.thirdPerson, false);

  if (!gl) return;

  canvas.onmousedown = mouseDown;
  canvas.onmouseup = mouseUp;
  canvas.onmouseout = mouseUp;
  canvas.onmousemove = mouseMove;
  canvas.onwheel = mouseWheel;
  canvas.ontouchstart = controller.touchStart;
  canvas.ontouchmove = controller.touchMove;
  canvas.ontouchend = controller.touchEnd;

  check1.onclick = () => {
    textureOnClick(check1, car.chassis, oldTextures[0]);
    textureOnClick(check1, scene.plane, oldTextures[1]);
    scene.upgradeCubes.forEach((uc) => {
      textureOnClick(check1, uc, oldTextures[3]);
      textureOnClick(check1, uc, oldTextures[4]);
      textureOnClick(check1, uc, oldTextures[5]);
    });
  };
  check2.onclick = () => {
    bumpOnClick(check2, car.chassis, oldTextures[0]);
    bumpOnClick(check2, scene.plane, oldTextures[1]);
    bumpOnClick(check2, scene.cubes, oldTextures[2]);
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

  sky = new Sky();

  scene = new Scene();

  car = new Car();

  await scene.initializeScene();

  await sky.initializeSky();

  await car.initializeCar();

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
      }, 3000);
    } else increase = 0.005;

    if (toIncrement) time += increase;
    else time -= increase;
  }

  timeUpgrade += 1;

  webglUtils.resizeCanvasToDisplaySize(canvas);

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.enable(gl.DEPTH_TEST);

  let target = [0, 0, 0];

  let position = [
    d * Math.sin(phi) * Math.cos(theta),
    d * Math.cos(phi),
    d * Math.sin(phi) * Math.sin(theta),
  ];

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

  let camera = m4.lookAt(position, target, up);
  let viewMatrix = m4.inverse(camera);

  viewMatrix = m4.yRotate(viewMatrix, degToRad(-facing));

  viewMatrix[12] = 0;
  viewMatrix[13] = 0;
  viewMatrix[14] = 0;
  let viewDirectionProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
  sky.drawSky(m4.inverse(viewDirectionProjectionMatrix));

  viewMatrix = m4.inverse(camera);

  if (firstPerson) {
    viewMatrix = m4.xRotate(viewMatrix, degToRad(-10));
    viewMatrix = m4.translate(viewMatrix, 0, -0.3, 2.6);
    d = 3.5;
    phi = degToRad(70);
    theta = degToRad(90);
    position = thirdPersonCameraPosition();
  }

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
    }, 3000);
  }

  await scene.drawScene(meshProgramInfo, worldMatrix);

  car.drawCar(worldMatrix);

  let carCoords = car.getCarCoords();

  this.handleCollision(carCoords);

  this.handleOutOfRange(carCoords);

  this.handleUpgrades();

  if (!collision) car.moveCar();
  else gameover.hidden = false;

  this.setUpgradesPane();
  this.setControlPane();

  requestAnimationFrame(render);
}

let mouseDown = (event) => {
  event.preventDefault();
  drag = true;

  oldX = event.pageX;
  oldY = event.pageY;
  return false;
};

let mouseUp = () => {
  drag = false;
};

let mouseMove = (event) => {
  if (!drag) return false;

  const location = mouseOnCanvas(event.pageX, event.pageY);

  if (!firstPerson) handleMovement(location);
};

let mouseWheel = (event) => {
  if (!firstPerson) {
    if (event.deltaY < 0) {
      if (d > 1.93) d *= 0.8;
    } else d *= 1.2;
  }
};

function keyDown(event) {
  handleKey(event.keyCode, [87, 83, 65, 68, 69, 84, 70], true);
}

function keyUp(event) {
  handleKey(event.keyCode, [87, 83, 65, 68, 69, 84, 70], false);
}

function setUpgradesPane() {
  gl3.font = "18px Oswald";
  gl3.fillStyle = "white";
  gl3.textAlign = "center";
}

function setControlPane() {
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
}

if (!navigator.userAgent.match(/Chrome\/9[0-1]/)) {
  alert("Chrome is not updated! Please update to play the game!");
} else main();
