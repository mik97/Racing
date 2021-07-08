function handleKey(keycode, keymap, isPressed) {
  for (let i = 0; i < keymap.length; i++) {
    if (keycode == keymap[i]) key[i] = isPressed;
  }
}

function handleTranslation(name, world, time) {
  if (name.includes("XN")) return m4.translate(world, -time, 0, 0);
  else if (name.includes("XP")) return m4.translate(world, time, 0, 0);
  else if (name.includes("ZN")) return m4.translate(world, 0, 0, -time);
  else if (name.includes("ZP")) return m4.translate(world, 0, 0, time);
  else return world;
}

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

function handleCollision(carCoords) {
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
    }, 3000);
  }
}

function handleOutOfRange(carCoords) {
  let planeCoords = objCoords(
    scene.plane.parts[scene.plane.parts.length - 1].p
  );

  if (
    !(
      carCoords.xMin + px <= planeCoords.xMax - 7 &&
      carCoords.xMax + px >= planeCoords.xMin + 7 &&
      carCoords.zMin + pz <= planeCoords.zMax - 3 &&
      carCoords.zMax + pz >= planeCoords.zMin + 3
    )
  ) {
    car.set();
  }

  if (
    carCoords.xMin + px <= planeCoords.xMax - 12 &&
    carCoords.xMax + px >= planeCoords.xMin + 12 &&
    carCoords.zMin + pz <= planeCoords.zMax - 6.5 &&
    carCoords.zMax + pz >= planeCoords.zMin + 6.5
  ) {
    car.set();
  }
}

function handleUpgrades() {
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

    isSet = true;
  }

  if (key[4] == true) {
    checkUpgrade(upgradeChoice);
    upgradeChoice = -1;
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
