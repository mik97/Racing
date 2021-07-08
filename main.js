let canvas, gl, vertexShaderSource, fragmentShaderSource, meshProgramInfo;
let canvas2, ctx, canvas3, ctx2;

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
  ctx = canvas2.getContext("2d");

  canvas3 = document.querySelector("#overlay");
  ctx2 = canvas3.getContext("2d");

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
  canvas.ontouchstart = touchStart;
  canvas.ontouchmove = touchMove;
  canvas.ontouchend = touchEnd;

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
    }, 5000);
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

  setOldTexture();

  render();
}

async function render() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  if (!isInvisible && !slowlyCube && !stopCube)
    ctx2.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

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
    position = [
      d * Math.sin(phi) * Math.cos(theta),
      d * Math.cos(phi),
      d * Math.sin(phi) * Math.sin(theta),
    ];
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

function keyDown(event) {
  handleKey(event.keyCode, [87, 83, 65, 68, 69, 84, 70], true);
}

function keyUp(event) {
  handleKey(event.keyCode, [87, 83, 65, 68, 69, 84, 70], false);
}

function setUpgradesPane() {
  ctx2.font = "18px Oswald";
  ctx2.fillStyle = "white";
  ctx2.textAlign = "center";
}

function setControlPane() {
  ctx.font = "18px Oswald";
  ctx.fillStyle = "white";
  ctx.fillText("Pannello di controllo", 1, 12);
  ctx.font = "12px Monospace";
  ctx.fillText("'W' - Muove in avanti l'auto", 1, 27);
  ctx.fillText("'S' - Muove indietro l'auto", 1, 42);
  ctx.fillText("'A' - Muove a sinistra l'auto", 1, 57);
  ctx.fillText("'D' - Muove a destra l'auto", 1, 72);
  ctx.fillText("'E' - Attiva il potenziamento", 1, 87);
  ctx.fillText("'F' - Attiva la visuale in prima persona", 1, 102);
  ctx.fillText("'T' - Attiva la visuale in terza persona", 1, 117);
  ctx.fillText(
    "'Pulsante sinistro del mouse' - Ruota/Inclina la visuale",
    1,
    132
  );
  ctx.fillText("'Rotella del mouse' - Zoom In/Zoom Out", 1, 147);
}

if (!navigator.userAgent.match(/Chrome\/9[0-1]/)) {
  alert("Chrome is not updated! Please update to play the game!");
} else main();
