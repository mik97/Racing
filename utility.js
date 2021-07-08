function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

function getExtents(positions) {
  const min = positions.slice(0, 3);
  const max = positions.slice(0, 3);

  for (let i = 3; i < positions.length; i += 3) {
    for (let j = 0; j < 3; j++) {
      const v = positions[i + j];
      min[j] = Math.min(v, min[j]);
      max[j] = Math.max(v, max[j]);
    }
  }

  return { min, max };
}

function getGeometriesExtents(geometries) {
  return geometries.reduce(
    ({ min, max }, { data }) => {
      const minMax = getExtents(data.position);
      return {
        min: min.map((min, ndx) => Math.min(minMax.min[ndx], min)),
        max: max.map((max, ndx) => Math.max(minMax.max[ndx], max)),
      };
    },
    {
      min: Array(3).fill(Number.POSITIVE_INFINITY),
      max: Array(3).fill(Number.NEGATIVE_INFINITY),
    }
  );
}

function mouseOnCanvas(x, y) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: x - rect.left,
    y: y - rect.top,
  };
}

function getObjOffset(geometries) {
  return geometries.map((g) => {
    const extents = getGeometriesExtents([g]);
    const range = m4.subtractVectors(extents.max, extents.min);
    return m4.scaleVector(
      m4.addVectors(extents.min, m4.scaleVector(range, 0.5)),
      -1
    );
  });
}

function getCoordinates(positions) {
  let coords = [];
  let lastIndex = 0;

  for (let i = 0; i < positions.length / 3; i++) {
    coords.push(positions.slice(lastIndex, lastIndex + 3));
    lastIndex += 3;
  }

  return coords;
}

function getMax(arr, index) {
  return Math.max(...getSubArray(arr, index));
}

function getMin(arr, index) {
  return Math.min(...getSubArray(arr, index));
}

function getSubArray(arr, index) {
  let toRet = [];

  arr.forEach((el) => {
    toRet.push(el[index]);
  });

  return toRet;
}

function objCoords(positions) {
  let coords = getCoordinates(positions);
  let xMin = getMin(coords, 0);
  let xMax = getMax(coords, 0);
  let zMin = getMin(coords, 2);
  let zMax = getMax(coords, 2);

  return { xMin, xMax, zMin, zMax };
}

function drawMesh(programInfo, bufferInfo, world, material) {
  webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo);

  if (world != undefined)
    webglUtils.setUniforms(
      programInfo,
      {
        u_world: world,
      },
      material
    );
  else webglUtils.setUniforms(programInfo, {}, material);

  webglUtils.drawBufferInfo(gl, bufferInfo);
}

function checkUpgrade(n) {
  switch (n) {
    case 0:
      isInvisible = true;
      ctx2.fillText("Collisions disabled", 75, 12);
      break;
    case 1:
      slowlyCube = true;
      ctx2.fillText("Slowly Cubes", 75, 12);
      break;
    case 2:
      stopCube = true;
      ctx2.fillText("Cubes Stopped", 75, 12);
      break;
  }
}

function textureOnClick(checkbox, mesh, textures) {
  let i = 0;
  if (!checkbox.checked) {
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

function bumpOnClick(checkbox, mesh, textures) {
  let i = 0;
  if (!checkbox.checked) {
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

function setOldTexture() {
  oldTextures.push(this.getOld(car.chassis));
  oldTextures.push(this.getOld(scene.plane));
  oldTextures.push(this.getOld(scene.cubes));
  scene.upgradeCubes.forEach((uc) => {
    oldTextures.push(this.getOld(uc));
  });
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
