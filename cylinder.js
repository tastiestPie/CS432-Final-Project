class Cylinder extends Drawable {
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

    static generateCylinder(radius, height, segments) {
        const vertices = [];
        const normals = [];
        const texCoords = [];
        const indices = [];

        const angleStep = (2 * Math.PI) / segments;

        // Generate vertices for the top and bottom circles
        for (let i = 0; i <= segments; i++) {
            const angle = i * angleStep;
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);

            // Bottom vertex
            vertices.push(vec3(x, -height / 2, z));
            normals.push(vec3(0, -1, 0));
            texCoords.push(vec2(i / segments, 0));

            // Top vertex
            vertices.push(vec3(x, height / 2, z));
            normals.push(vec3(0, 1, 0));
            texCoords.push(vec2(i / segments, 1));
        }

        // Generate side vertices and normals
        for (let i = 0; i <= segments; i++) {
            const angle = i * angleStep;
            const x = Math.cos(angle);
            const z = Math.sin(angle);

            // Side vertices
            vertices.push(vec3(radius * x, -height / 2, radius * z));
            vertices.push(vec3(radius * x, height / 2, radius * z));

            // Side normals (pointing outward)
            normals.push(vec3(x, 0, z));
            normals.push(vec3(x, 0, z));

            // Side texture coordinates
            texCoords.push(vec2(i / segments, 0));
            texCoords.push(vec2(i / segments, 1));
        }

        // Generate indices for the top and bottom faces
        for (let i = 0; i < segments; i++) {
            // Bottom face
            indices.push(2 * i, 2 * (i + 1), 2 * i + 1);
            // Top face
            indices.push(2 * (i + 1) + 1, 2 * i + 1, 2 * (i + 1));
        }

        // Generate indices for the sides
        const sideOffset = (segments + 1) * 2;
        for (let i = 0; i < segments; i++) {
            const current = sideOffset + 2 * i;
            const next = sideOffset + 2 * (i + 1);

            indices.push(current, next, current + 1);
            indices.push(next, next + 1, current + 1);
        }

        Cylinder.vertexPositions = vertices;
        Cylinder.vertexNormals = normals;
        Cylinder.vertexTexCoords = texCoords;
        Cylinder.indices = indices;
    }

    static loadTexture() {
		Cylinder.texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, Cylinder.texture);

		// Fill the texture with a 1x1 blue pixel.
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

		var image = new Image();
		image.onload = function() {
			gl.bindTexture(gl.TEXTURE_2D, Cylinder.texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			gl.generateMipmap(gl.TEXTURE_2D);
		};
		image.src = "./Textures/brown-background-natural-sand-texture.jpg";
	}

    static initialize() {
        Cylinder.generateCylinder(1.0, 2.0, 32); // Radius, height, segments
        Cylinder.shaderProgram = initShaders(gl, "/vshader.glsl", "/fshader.glsl");

        // Load the data into the GPU
        Cylinder.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, Cylinder.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(Cylinder.vertexPositions), gl.STATIC_DRAW);

        Cylinder.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, Cylinder.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(Cylinder.vertexNormals), gl.STATIC_DRAW);

        Cylinder.texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, Cylinder.texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(Cylinder.vertexTexCoords), gl.STATIC_DRAW);

        Cylinder.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Cylinder.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(Cylinder.indices), gl.STATIC_DRAW);

        // Associate shader variables with data buffer
        Cylinder.aPositionShader = gl.getAttribLocation(Cylinder.shaderProgram, "aPosition");
        Cylinder.aNormalShader = gl.getAttribLocation(Cylinder.shaderProgram, "aNormal");
        Cylinder.aTexCoordShader = gl.getAttribLocation(Cylinder.shaderProgram, "aTexCoord");

        Cylinder.uModelMatrixShader = gl.getUniformLocation(Cylinder.shaderProgram, "modelMatrix");
        Cylinder.uCameraMatrixShader = gl.getUniformLocation(Cylinder.shaderProgram, "cameraMatrix");
        Cylinder.uProjectionMatrixShader = gl.getUniformLocation(Cylinder.shaderProgram, "projectionMatrix");

        Cylinder.uMatDiffColorShader = gl.getUniformLocation(Cylinder.shaderProgram, "matDiffColor");
        Cylinder.uMatSpecColorShader = gl.getUniformLocation(Cylinder.shaderProgram, "matSpecColor");
        Cylinder.uMatAlphaShader = gl.getUniformLocation(Cylinder.shaderProgram, "matAlpha");

        Cylinder.uLightDirectionShader = gl.getUniformLocation(Cylinder.shaderProgram, "lightDirection");
        Cylinder.uLightColorShader = gl.getUniformLocation(Cylinder.shaderProgram, "lightColor");
        Cylinder.uTextureShader = gl.getUniformLocation(Cylinder.shaderProgram, "uTexture");
    }

    constructor(tx, ty, tz, scale, rotX, rotY, rotZ, diffcolor, speccolor, sh) {
        super(tx, ty, tz, scale, rotX, rotY, rotZ, diffcolor, speccolor, sh);
        if (Cylinder.shaderProgram == -1)
            Cylinder.initialize();
        Cylinder.loadTexture();
    }

    draw() {
        gl.useProgram(Cylinder.shaderProgram);

        gl.bindBuffer(gl.ARRAY_BUFFER, Cylinder.positionBuffer);
        gl.vertexAttribPointer(Cylinder.aPositionShader, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, Cylinder.normalBuffer);
        gl.vertexAttribPointer(Cylinder.aNormalShader, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, Cylinder.texCoordBuffer);
        gl.vertexAttribPointer(Cylinder.aTexCoordShader, 2, gl.FLOAT, false, 0, 0);

        gl.uniformMatrix4fv(Cylinder.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(Cylinder.uCameraMatrixShader, false, flatten(currentCamera.cameraMatrix));
        gl.uniformMatrix4fv(Cylinder.uProjectionMatrixShader, false, flatten(currentCamera.projectionMatrix));

        gl.uniform4fv(Cylinder.uMatDiffColorShader, this.matDiffColor);
        gl.uniform4fv(Cylinder.uMatSpecColorShader, this.matSpecColor);
        gl.uniform1f(Cylinder.uMatAlphaShader, this.matAlpha);

        gl.uniform3fv(Cylinder.uLightDirectionShader, light1.direction);
        gl.uniform4fv(Cylinder.uLightColorShader, light1.color);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, Cylinder.texture);
        gl.uniform1i(Cylinder.uTextureShader, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Cylinder.indexBuffer);

        gl.enableVertexAttribArray(Cylinder.aPositionShader);
        gl.enableVertexAttribArray(Cylinder.aNormalShader);
        gl.enableVertexAttribArray(Cylinder.aTexCoordShader);
        gl.drawElements(gl.TRIANGLES, Cylinder.indices.length, gl.UNSIGNED_SHORT, 0);
        gl.disableVertexAttribArray(Cylinder.aPositionShader);
        gl.disableVertexAttribArray(Cylinder.aNormalShader);
        gl.disableVertexAttribArray(Cylinder.aTexCoordShader);
    }
}