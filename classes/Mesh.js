class Mesh {
  constructor(obj, parts, materials, objOffset, worldMesh) {
    this.obj = obj;
    this.parts = parts;
    this.materials = materials;
    this.objOffset = objOffset;
    this.worldMesh = worldMesh;
  }

  async setObj(url) {
    const response = await (await fetch(url)).text();
    this.obj = parseOBJ(response);

    const baseHref = new URL(url, window.location.href);
    const matTexts = await Promise.all(
      this.obj.materialLibs.map(async (filename) => {
        const matHref = new URL(filename, baseHref).href;
        return await (await fetch(matHref)).text();
      })
    );

    this.materials = parseMTL(matTexts.join("\n"));

    const textures = {
      defaultWhite: create1PixelTexture(gl, [255, 255, 255, 255]),
      defaultNormal: create1PixelTexture(gl, [127, 127, 255, 0]),
    };

    for (const material of Object.values(this.materials)) {
      Object.entries(material)
        .filter(([key]) => key.endsWith("Map"))
        .forEach(([key, filename]) => {
          let texture = textures[filename];
          if (!texture) {
            const textureHref = new URL(filename, baseHref).href;
            texture = createTexture(gl, textureHref);
            textures[filename] = texture;
          }
          material[key] = texture;
        });
    }

    this.setParts(textures);

    const extents = getGeometriesExtents(this.obj.geometries);
    const range = m4.subtractVectors(extents.max, extents.min);
    this.objOffset = m4.scaleVector(
      m4.addVectors(extents.min, m4.scaleVector(range, 0.5)),
      -1
    );
  }

  setParts(textures) {
    const defaultMaterial = {
      diffuse: [1, 1, 1],
      diffuseMap: textures.defaultWhite,
      normalMap: textures.defaultNormal,
      ambient: [0, 0, 0],
      specular: [1, 1, 1],
      specularMap: textures.defaultWhite,
      shininess: 400,
      opacity: 1,
    };

    this.parts = this.obj.geometries.map(({ material, data, object }) => {
      let p = data.position;
      if (data.color) {
        if (data.position.length === data.color.length)
          data.color = { numComponents: 3, data: data.color };
      } else {
        data.color = { value: [1, 1, 1, 1] };
      }

      if (data.texcoord && data.normal) {
        data.tangent = generateTangents(data.position, data.texcoord);
      } else {
        data.tangent = { value: [1, 0, 0] };
      }

      if (!data.texcoord) {
        data.texcoord = { value: [0, 0] };
      }

      if (!data.normal) {
        data.normal = { value: [0, 0, 1] };
      }
      const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, data);

      return {
        material: { ...defaultMaterial, ...this.materials[material] },
        bufferInfo,
        object,
        p,
      };
    });
  }

  drawObj(programInfo, world) {
    this.worldMesh = world;
    for (const { bufferInfo, material } of this.parts) {
      drawMesh(programInfo, bufferInfo, world, material);
    }
  }
}
