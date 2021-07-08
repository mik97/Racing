class Sky {
  constructor() {
    this.programInfo;
    this.positionBuffer;
    this.locationInfo;
  }

  async initializeSky() {
    const skyboxVertexShader = await (
      await fetch("./shaders/skybox.vs.glsl")
    ).text();
    const skyboxFragmentShader = await (
      await fetch("./shaders/skybox.fs.glsl")
    ).text();

    this.programInfo = webglUtils.createProgramInfo(gl, [
      skyboxVertexShader,
      skyboxFragmentShader,
    ]);

    let positionLocation = gl.getAttribLocation(
      this.programInfo.program,
      "a_position"
    );

    let skyboxLocation = gl.getUniformLocation(
      this.programInfo.program,
      "u_skybox"
    );
    let viewDirectionProjectionInverseLocation = gl.getUniformLocation(
      this.programInfo.program,
      "u_viewDirectionProjectionInverse"
    );

    this.locationInfo = {
      positionLocation,
      skyboxLocation,
      viewDirectionProjectionInverseLocation,
    };

    this.positionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

    this.setGeometry(gl);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    this.setFaces(texture);

    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(
      gl.TEXTURE_CUBE_MAP,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR
    );
  }

  drawSky(viewDirectionProjectionInverseMatrix) {
    gl.useProgram(this.programInfo.program);

    gl.enableVertexAttribArray(this.locationInfo.positionLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

    gl.vertexAttribPointer(
      this.locationInfo.positionLocation,
      2,
      gl.FLOAT,
      false,
      0,
      0
    );

    gl.uniformMatrix4fv(
      this.locationInfo.viewDirectionProjectionInverseLocation,
      false,
      viewDirectionProjectionInverseMatrix
    );

    gl.uniform1i(this.locationInfo.skyboxLocation, 0);

    gl.depthFunc(gl.LEQUAL);

    gl.drawArrays(gl.TRIANGLES, 0, 1 * 6);
  }

  setGeometry(gl) {
    var positions = new Float32Array([
      -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  }

  setFaces(texture) {
    const faceInfos = [
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        url: "./resources/skybox/skybox_left2.png",
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        url: "./resources/skybox/skybox_right1.png",
      },
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        url: "./resources/skybox/skybox_bottom4.png",
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        url: "./resources/skybox/skybox_top3.png",
      },
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        url: "./resources/skybox/skybox_back6.png",
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
        url: "./resources/skybox/skybox_front5.png",
      },
    ];

    faceInfos.forEach((faceInfo) => {
      const { target, url } = faceInfo;

      // setup each face so it's immediately renderable
      gl.texImage2D(
        target,
        0,
        gl.RGBA,
        1024,
        1024,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null
      );

      this.loadImage(url, target, texture);
    });
  }

  loadImage(url, target, texture) {
    const image = new Image();
    image.src = url;
    image.addEventListener("load", function () {
      // Now that the image has loaded make copy it to the texture.
      gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
      gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    });
  }
}
