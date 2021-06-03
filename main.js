let canvas, gl, vertexShaderSource, fragmentShaderSource;

let meshProgramInfo;

let car, urls, sky, scene;

let touchCoord;

let key,
  isIncr = true,
  isInvisible = false,
  isStarted = false,
  potential = 0;

let theta = degToRad(50),
  phi = degToRad(30);
let d = 7;
let drag,
  cameraRotationY = 0,
  cameraRotationX = 0,
  isRotateX = false,
  isRotateY = false;

let collision = false;

async function main() {
  canvas = document.getElementById("canvas");
  gl = canvas.getContext("webgl2");

  if (!gl) return;

  canvas.onmousedown = mouseDown;
  canvas.onmouseup = mouseUp;
  canvas.onmouseout = mouseUp;
  canvas.onmousemove = mouseMove;
  canvas.onwheel = mouseWheel;

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

  scene = new Scene();

  await scene.initializeScene();

  requestAnimationFrame(render);
}

function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

async function render() {
  webglUtils.resizeCanvasToDisplaySize(canvas);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.enable(gl.DEPTH_TEST);

  let target = [0, 0, 0];
  //first-person
  //   let position = [0, 1, d * Math.sin(phi)];

  let position = [
    d * Math.cos(phi) * Math.sin(theta),
    d * Math.sin(phi) * Math.sin(theta),
    d * Math.sin(phi),
  ];

  const projectionMatrix = m4.perspective(
    degToRad(60),
    canvas.width / canvas.height,
    1,
    2000
  );

  const up = [0, 1, 0];

  const camera = m4.lookAt(position, target, up);

  let viewMatrix = m4.inverse(camera);
  //   if (isRotateY) viewMatrix = m4.yRotate(viewMatrix, degToRad(cameraRotationY));
  //   if (isRotateX) viewMatrix = m4.xRotate(viewMatrix, degToRad(cameraRotationX));

  //   viewMatrix[12] = 0;
  //   viewMatrix[13] = 0;
  //   viewMatrix[14] = 0;
  //   let viewDirectionProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);
  //   sky.drawSky(m4.inverse(viewDirectionProjectionMatrix));

  //   viewMatrix = m4.inverse(camera);
  // viewMatrix = m4.xRotate(viewMatrix, degToRad(20));

  //   if (isRotateY) viewMatrix = m4.yRotate(viewMatrix, degToRad(cameraRotationY));
  //   if (isRotateX) viewMatrix = m4.xRotate(viewMatrix, degToRad(cameraRotationX));

  // first-person
  //   viewMatrix = m4.yRotate(viewMatrix, degToRad(-facing));
  //   viewMatrix = m4.translate(viewMatrix, -px, -py, -pz);

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

  // car.wheels[0].parts.map(
  //   ({ material }) =>
  //     (material.normalMap = create1PixelTexture(gl, [127, 127, 255, 0]))
  // );

  await scene.drawScene(meshProgramInfo, worldMatrix);

  requestAnimationFrame(render);
}

let mouseDown = (event) => {
  drag = true;
  oldX = event.pageX;
  oldY = event.pageY;
  event.preventDefault();
  return false;
};

let mouseUp = (event) => {
  drag = false;
};

let mouseMove = (event) => {
  if (!drag) return false;

  if (event.pageY > oldY) {
    cameraRotationX -= 1;
    oldY = event.pageY;
    isRotateY = true;
  } else if (event.pageX > oldX) {
    cameraRotationY += 1;
    oldX = event.pageX;
    isRotateX = true;
  }

  if (event.pageY < oldY) {
    cameraRotationX += 1;
    oldY = event.pageY;
    isRotateY = true;
  } else if (event.pageX < oldX) {
    cameraRotationY -= 1;
    oldX = event.pageX;
    isRotateY = true;
  }
};

let mouseWheel = (event) => {
  event.deltaY < 0 ? (d *= 0.8) : (d *= 1.2);
};

function keyDown(event) {
  handleKey(event.keyCode, [87, 83, 65, 68, 69], true);
}

function keyUp(event) {
  handleKey(event.keyCode, [87, 83, 65, 68, 69], false);
}

main();
