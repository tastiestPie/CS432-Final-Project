class Skybox {
    constructor(gl, imagePaths) {
        this.gl = gl;
        this.imagePaths = imagePaths;
        this.vertices = [
            // Front face
            -1.0, -1.0,  1.0,
             1.0, -1.0,  1.0,
             1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,

            // Back face
            -1.0, -1.0, -1.0,
            -1.0,  1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0, -1.0, -1.0,

            // Top face
            -1.0,  1.0, -1.0,
            -1.0,  1.0,  1.0,
             1.0,  1.0,  1.0,
             1.0,  1.0, -1.0,

            // Bottom face
            -1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
             1.0, -1.0,  1.0,
            -1.0, -1.0,  1.0,

            // Right face
             1.0, -1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0,  1.0,  1.0,
             1.0, -1.0,  1.0,

            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0,  1.0, -1.0
        ];

        this.indices = [
            0, 1, 2, 0, 2, 3,    // Front
            4, 5, 6, 4, 6, 7,    // Back
            8, 9, 10, 8, 10, 11, // Top
            12, 13, 14, 12, 14, 15, // Bottom
            16, 17, 18, 16, 18, 19, // Right
            20, 21, 22, 20, 22, 23  // Left
        ];

        this.texture = null;
        this.program = null;
        this.positionBuffer = null;
        this.indexBuffer = null;
        this.shaderProgram = null;

        this.init();
    }

    init() {
        // Compile shaders
        Skybox.shaderProgram = initShaders(this.gl, "sky_vshader.glsl", "sky_fshader.glsl");

        // Create buffers
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.STATIC_DRAW);

        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), this.gl.STATIC_DRAW);

        // Load textures
        this.texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.texture);

        for (let i = 0; i < 6; i++) {
            const image = new Image();
            image.src = this.imagePaths[i];
            image.onload = () => {
                this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.texture);
                this.gl.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
                this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP);
            };
        }

        this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    }

    render(camera) {
        this.gl.useProgram(this.program);

        // Disable depth writing
        this.gl.depthFunc(this.gl.LEQUAL);

        // Bind buffers
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.vertexAttribPointer(this.gl.getAttribLocation(this.program, "aPosition"), 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.gl.getAttribLocation(this.program, "aPosition"));

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        // Set uniforms
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "uProjectionMatrix"), false, flatten(camera.projectionMatrix));
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.program, "uCameraMatrix"), false, flatten(camera.cameraMatrix));

        // Bind texture
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.texture);
        this.gl.uniform1i(this.gl.getUniformLocation(this.program, "uSkybox"), 0);

        // Draw the skybox
        this.gl.drawElements(this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_SHORT, 0);

        // Re-enable depth writing
        this.gl.depthFunc(this.gl.LESS);
    }
}