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

function handleKey(keycode, keymap, isPressed) {
  for (let i = 0; i < keymap.length; i++) {
    if (keycode == keymap[i]) key[i] = isPressed;
  }
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
