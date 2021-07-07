class Sky {
  constructor() {
    // this.sky;
    this.programInfo;
    this.positionBuffer;
    this.locationInfo;
  }

  async initializeSky() {
    // this.sky = new Mesh();
    // await this.sky.setObj("/resources/skybox/skybox.obj");
    const skyboxVertexShader = await (
      await fetch("/shaders/skybox.vs.glsl")
    ).text();
    const skyboxFragmentShader = await (
      await fetch("/shaders/skybox.fs.glsl")
    ).text();

    this.programInfo = webglUtils.createProgramInfo(gl, [
      skyboxVertexShader,
      skyboxFragmentShader,
    ]);

    // look up where the vertex data needs to go.
    let positionLocation = gl.getAttribLocation(
      this.programInfo.program,
      "a_position"
    );

    // lookup uniforms
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

    // Create a buffer for positions
    this.positionBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    // Put the positions in the buffer
    this.setGeometry(gl);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    const faceInfos = [
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        url: "/resources/skybox/skybox_left2.png",
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        url: "/resources/skybox/skybox_right1.png",
      },
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        url: "/resources/skybox/skybox_bottom4.png",
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        url: "/resources/skybox/skybox_top3.png",
      },
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        url: "/resources/skybox/skybox_back6.png",
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
        url: "/resources/skybox/skybox_front5.png",
      },
    ];
    faceInfos.forEach((faceInfo) => {
      const { target, url } = faceInfo;

      // Upload the canvas to the cubemap face.
      const level = 0;
      const internalFormat = gl.RGBA;
      const width = 1024;
      const height = 1024;
      const format = gl.RGBA;
      const type = gl.UNSIGNED_BYTE;

      // setup each face so it's immediately renderable
      gl.texImage2D(
        target,
        level,
        internalFormat,
        width,
        height,
        0,
        format,
        type,
        null
      );

      // Asynchronously load an image
      const image = new Image();
      image.src = url;
      image.addEventListener("load", function () {
        // Now that the image has loaded make copy it to the texture.
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.texImage2D(target, level, internalFormat, format, type, image);
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
      });
    });
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(
      gl.TEXTURE_CUBE_MAP,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR
    );
  }

  drawSky(viewDirectionProjectionInverseMatrix) {
    // this.sky.drawObj(meshProgramInfo, worldMatrix);
    // Tell it to use our program (pair of shaders)
    gl.useProgram(this.programInfo.program);

    // Turn on the position attribute
    gl.enableVertexAttribArray(this.locationInfo.positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2; // 2 components per iteration
    var type = gl.FLOAT; // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(
      this.locationInfo.positionLocation,
      size,
      type,
      normalize,
      stride,
      offset
    );

    // Set the uniforms
    gl.uniformMatrix4fv(
      this.locationInfo.viewDirectionProjectionInverseLocation,
      false,
      viewDirectionProjectionInverseMatrix
    );

    // Tell the shader to use texture unit 0 for u_skybox
    gl.uniform1i(this.locationInfo.skyboxLocation, 0);

    // let our quad pass the depth test at 1.0
    gl.depthFunc(gl.LEQUAL);

    // Draw the geometry.
    gl.drawArrays(gl.TRIANGLES, 0, 1 * 6);
  }

  setGeometry(gl) {
    var positions = new Float32Array([
      -1,
      -1,
      1,
      -1,
      -1,
      1,
      -1,
      1,
      1,
      -1,
      1,
      1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  }
}
