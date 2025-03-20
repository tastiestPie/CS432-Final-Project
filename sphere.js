class Sphere extends Drawable {
    constructor(radius, slices, stacks, tx, ty, tz, scale, rotX, rotY, rotZ, diffcolor, speccolor, sh) {
        super(tx, ty, tz, scale, rotX, rotY, rotZ, diffcolor, speccolor, sh);
        this.radius = radius;
        this.slices = slices;
        this.stacks = stacks;
        this.vertices = [];
        this.normals = [];
        this.textureCoords = [];
        this.indices = [];

        this.generateSphere();
        this.initialize();
        this.loadTexture(); // Load the texture
    }

    generateSphere() {
        for (let stack = 0; stack <= this.stacks; ++stack) {
            const phi = (stack / this.stacks) * Math.PI; // Latitude
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            for (let slice = 0; slice <= this.slices; ++slice) {
                const theta = (slice / this.slices) * 2 * Math.PI; // Longitude
                const sinTheta = Math.sin(theta);
                const cosTheta = Math.cos(theta);

                // Vertex position
                const x = cosTheta * sinPhi;
                const y = cosPhi;
                const z = sinTheta * sinPhi;

                // Push vertex
                this.vertices.push(this.radius * x, this.radius * y, this.radius * z);

                // Push normal (same as vertex position for a unit sphere)
                this.normals.push(x, y, z);

                // Push texture coordinates
                this.textureCoords.push(slice / this.slices, stack / this.stacks);
            }
        }

        // Generate indices
        for (let stack = 0; stack < this.stacks; ++stack) {
            for (let slice = 0; slice < this.slices; ++slice) {
                const first = (stack * (this.slices + 1)) + slice;
                const second = first + this.slices + 1;

                this.indices.push(first, second, first + 1);
                this.indices.push(second, second + 1, first + 1);
            }
        }
    }

    initialize() {
    	Sphere.shaderProgram = initShaders( gl, "/vshader.glsl", "/fshader.glsl");

		// Load the data into the GPU
		Sphere.positionBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Sphere.positionBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Sphere.vertexPositions), gl.STATIC_DRAW );

		Sphere.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Sphere.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Sphere.vertexNormals), gl.STATIC_DRAW );

		Sphere.texCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, Sphere.texCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(Sphere.vertexTexCoords), gl.STATIC_DRAW);

		Sphere.indexBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Sphere.indexBuffer);
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(Sphere.indices), gl.STATIC_DRAW );

		// Associate our shader variables with our data buffer
		Sphere.aPositionShader = gl.getAttribLocation( Sphere.shaderProgram, "aPosition" );
		Sphere.aNormalShader = gl.getAttribLocation( Sphere.shaderProgram, "aNormal" );
		Sphere.aTexCoordShader = gl.getAttribLocation(Sphere.shaderProgram, "aTexCoord");

		Sphere.uModelMatrixShader = gl.getUniformLocation( Sphere.shaderProgram, "modelMatrix" );
		Sphere.uCameraMatrixShader = gl.getUniformLocation( Sphere.shaderProgram, "cameraMatrix" );
		Sphere.uProjectionMatrixShader = gl.getUniformLocation( Sphere.shaderProgram, "projectionMatrix" );

		Sphere.uMatDiffColorShader = gl.getUniformLocation( Sphere.shaderProgram, "matDiffColor" );
		Sphere.uMatSpecColorShader = gl.getUniformLocation( Sphere.shaderProgram, "matSpecColor" );
		Sphere.uMatAlphaShader = gl.getUniformLocation( Sphere.shaderProgram, "matAlpha" );

		Sphere.uLightDirectionShader = gl.getUniformLocation( Sphere.shaderProgram, "lightDirection" );
		Sphere.uLightColorShader = gl.getUniformLocation( Sphere.shaderProgram, "lightColor" );
		Sphere.uTextureShader = gl.getUniformLocation(Sphere.shaderProgram, "uTexture");
    }

    loadTexture() {
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        // Fill the texture with a 1x1 blue pixel (temporary)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

        const image = new Image();
        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_2D);
        };
        image.src = "./Textures/BeachBallTexture3.png";
    }

    draw() {
        gl.useProgram(this.shaderProgram);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(Sphere.aPositionShader, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(Sphere.aNormalShader, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
        gl.vertexAttribPointer(Sphere.aTexCoordShader, 2, gl.FLOAT, false, 0, 0);

        gl.uniformMatrix4fv(Sphere.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(Sphere.uCameraMatrixShader, false, flatten(currentCamera.cameraMatrix));
        gl.uniformMatrix4fv(Sphere.uProjectionMatrixShader, false, flatten(currentCamera.projectionMatrix));

        gl.uniform4fv(Sphere.uMatDiffColorShader, this.matDiffColor);
        gl.uniform4fv(Sphere.uMatSpecColorShader, this.matSpecColor);
        gl.uniform1f(Sphere.uMatAlphaShader, this.matAlpha);

        gl.uniform3fv(Sphere.uLightDirectionShader, light1.direction);
        gl.uniform4fv(Sphere.uLightColorShader, light1.color);

        // Bind the texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(Sphere.uTextureShader, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.enableVertexAttribArray(Sphere.aPositionShader);
        gl.enableVertexAttribArray(Sphere.aNormalShader);
        gl.enableVertexAttribArray(Sphere.aTexCoordShader);
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
        gl.disableVertexAttribArray(Sphere.aPositionShader);
        gl.disableVertexAttribArray(Sphere.aNormalShader);
        gl.disableVertexAttribArray(Sphere.aTexCoordShader);
    }
}