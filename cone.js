class Cone extends Drawable {
    static vertexPositions = [];
    static vertexNormals = [];
    static vertexTexCoords = [];
    static indices = [];

    static positionBuffer = -1;
    static indexBuffer = -1;
    static normalBuffer = -1;
    static texCoordBuffer = -1;

    static shaderProgram = -1;
    static aPositionShader = -1;
    static aNormalShader = -1;
    static aTexCoordShader = -1;
    static uModelMatrixShader = -1;
    static uCameraMatrixShader = -1;
    static uProjectionMatrixShader = -1;
    static uMatDiffColorShader = -1;
    static uMatSpecColorShader = -1;
    static uMatAlphaShader = -1;
    static uLightDirectionShader = -1;
    static uLightColorShader = -1;
    static texture = -1;

    static generateCone(radius, height, segments) {
        const vertices = [];
        const normals = [];
        const texCoords = [];
        const indices = [];

        const angleStep = (2 * Math.PI) / segments;

        // Apex (top vertex) of the cone
        vertices.push(vec3(0, height / 2, 0));
        normals.push(vec3(0, 1, 0)); // Normal at the apex
        texCoords.push(vec2(0.5, 1)); // Center of the top texture

        // Base vertices
        for (let i = 0; i <= segments; i++) {
            const angle = i * angleStep;
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);

            // Base vertex
            vertices.push(vec3(x, -height / 2, z));
            normals.push(vec3(x, 0, z)); // Normal pointing outward
            texCoords.push(vec2(i / segments, 0)); // Texture coordinates for the base
        }

        // Generate indices for the sides
        for (let i = 0; i < segments; i++) {
            // Triangle connecting apex, current base vertex, and next base vertex
            indices.push(0, i + 1, i + 2);
        }

        // Generate indices for the base
        const baseCenterIndex = vertices.length; // Index for the base center
        vertices.push(vec3(0, -height / 2, 0)); // Base center vertex
        normals.push(vec3(0, -1, 0)); // Normal pointing down
        texCoords.push(vec2(0.5, 0.5)); // Center of the base texture

        for (let i = 1; i <= segments; i++) {
            // Triangle connecting base center, current base vertex, and next base vertex
            indices.push(baseCenterIndex, i + 1, i);
        }

        Cone.vertexPositions = vertices;
        Cone.vertexNormals = normals;
        Cone.vertexTexCoords = texCoords;
        Cone.indices = indices;
    }

    static loadTexture() {
		Cone.texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, Cone.texture);

		// Fill the texture with a 1x1 blue pixel.
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

		var image = new Image();
		image.onload = function() {
			gl.bindTexture(gl.TEXTURE_2D, Cone.texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			gl.generateMipmap(gl.TEXTURE_2D);
		};
		image.src = "./Textures/martin-pechy-1IwBabyMXAA-unsplash.jpg";
	}

    static initialize() {
        Cone.generateCone(1.0, 2.0, 32); // Radius, height, segments
        Cone.shaderProgram = initShaders(gl, "/vshader.glsl", "/fshader.glsl");

        // Load the data into the GPU
        Cone.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, Cone.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(Cone.vertexPositions), gl.STATIC_DRAW);

        Cone.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, Cone.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(Cone.vertexNormals), gl.STATIC_DRAW);

        Cone.texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, Cone.texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(Cone.vertexTexCoords), gl.STATIC_DRAW);

        Cone.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Cone.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(Cone.indices), gl.STATIC_DRAW);

        // Associate shader variables with data buffer
        Cone.aPositionShader = gl.getAttribLocation(Cone.shaderProgram, "aPosition");
        Cone.aNormalShader = gl.getAttribLocation(Cone.shaderProgram, "aNormal");
        Cone.aTexCoordShader = gl.getAttribLocation(Cone.shaderProgram, "aTexCoord");

        Cone.uModelMatrixShader = gl.getUniformLocation(Cone.shaderProgram, "modelMatrix");
        Cone.uCameraMatrixShader = gl.getUniformLocation(Cone.shaderProgram, "cameraMatrix");
        Cone.uProjectionMatrixShader = gl.getUniformLocation(Cone.shaderProgram, "projectionMatrix");

        Cone.uMatDiffColorShader = gl.getUniformLocation(Cone.shaderProgram, "matDiffColor");
        Cone.uMatSpecColorShader = gl.getUniformLocation(Cone.shaderProgram, "matSpecColor");
        Cone.uMatAlphaShader = gl.getUniformLocation(Cone.shaderProgram, "matAlpha");

        Cone.uLightDirectionShader = gl.getUniformLocation(Cone.shaderProgram, "lightDirection");
        Cone.uLightColorShader = gl.getUniformLocation(Cone.shaderProgram, "lightColor");
        Cone.uTextureShader = gl.getUniformLocation(Cone.shaderProgram, "uTexture");
    }

    constructor(tx, ty, tz, scale, rotX, rotY, rotZ, diffcolor, speccolor, sh) {
        super(tx, ty, tz, scale, rotX, rotY, rotZ, diffcolor, speccolor, sh);
        if (Cone.shaderProgram == -1)
            Cone.initialize();
        Cone.loadTexture();
    }

    draw() {
        gl.useProgram(Cone.shaderProgram);

        gl.bindBuffer(gl.ARRAY_BUFFER, Cone.positionBuffer);
        gl.vertexAttribPointer(Cone.aPositionShader, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, Cone.normalBuffer);
        gl.vertexAttribPointer(Cone.aNormalShader, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, Cone.texCoordBuffer);
        gl.vertexAttribPointer(Cone.aTexCoordShader, 2, gl.FLOAT, false, 0, 0);

        gl.uniformMatrix4fv(Cone.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(Cone.uCameraMatrixShader, false, flatten(currentCamera.cameraMatrix));
        gl.uniformMatrix4fv(Cone.uProjectionMatrixShader, false, flatten(currentCamera.projectionMatrix));

        gl.uniform4fv(Cone.uMatDiffColorShader, this.matDiffColor);
        gl.uniform4fv(Cone.uMatSpecColorShader, this.matSpecColor);
        gl.uniform1f(Cone.uMatAlphaShader, this.matAlpha);

        gl.uniform3fv(Cone.uLightDirectionShader, light1.direction);
        gl.uniform4fv(Cone.uLightColorShader, light1.color);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, Cone.texture);
        gl.uniform1i(Cone.uTextureShader, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Cone.indexBuffer);

        gl.enableVertexAttribArray(Cone.aPositionShader);
        gl.enableVertexAttribArray(Cone.aNormalShader);
        gl.enableVertexAttribArray(Cone.aTexCoordShader);
        gl.drawElements(gl.TRIANGLES, Cone.indices.length, gl.UNSIGNED_SHORT, 0);
        gl.disableVertexAttribArray(Cone.aPositionShader);
        gl.disableVertexAttribArray(Cone.aNormalShader);
        gl.disableVertexAttribArray(Cone.aTexCoordShader);
    }
}