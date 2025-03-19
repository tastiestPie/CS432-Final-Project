class Cube extends Drawable{
    static vertexPositions = [
    	vec3(-0.5,-0.5,0.5),
    	vec3(-0.5,0.5,0.5),
    	vec3(0.5,0.5,0.5),
    	vec3(0.5,-0.5,0.5),
    	vec3(-0.5,-0.5,-0.5),
    	vec3(-0.5,0.5,-0.5),
    	vec3(0.5,0.5,-0.5),
    	vec3(0.5,-0.5,-0.5),
    ];

    static vertexNormals = [];

    static indices = [
	0,3,2,
	0,2,1,
	2,3,7,
	2,7,6,
	0,4,7,
	0,7,3,
	1,2,6,
	1,6,5,
	4,5,6,
	4,6,7,
	0,1,5,
	0,5,4
    ];

	static vertexTexCoords = [
		// Front face
		vec2(0.0, 0.0), vec2(1.0, 0.0), vec2(1.0, 1.0), vec2(0.0, 1.0),
		// Back face
		vec2(1.0, 0.0), vec2(0.0, 0.0), vec2(0.0, 1.0), vec2(1.0, 1.0),
		// Top face
		vec2(0.0, 1.0), vec2(1.0, 1.0), vec2(1.0, 0.0), vec2(0.0, 0.0),
		// Bottom face
		vec2(0.0, 0.0), vec2(1.0, 0.0), vec2(1.0, 1.0), vec2(0.0, 1.0),
		// Right face
		vec2(1.0, 0.0), vec2(1.0, 1.0), vec2(0.0, 1.0), vec2(0.0, 0.0),
		// Left face
		vec2(0.0, 0.0), vec2(0.0, 1.0), vec2(1.0, 1.0), vec2(1.0, 0.0)
	];

    static positionBuffer = -1;
    static indexBuffer = -1;
    static normalBuffer = -1;
	static texCoordBuffer = -1;

    static shaderProgram = -1;
    static aPositionShader = -1;
    static aNormalShader = -1;
    static uModelMatrixShader = -1;
    static uCameraMatrixShader = -1;
    static uProjectionMatrixShader = -1;

    static uMatDiffColorShader = -1;
    static uMatSpecColorShader = -1;
    static uMatAlphaShader = -1;

    static uLightDirectionShader = -1;
    static uLightColorShader = -1;
	static texture = -1;

    static computeNormals(){
		var normalSum = [];
		var counts = [];

		//initialize sum of normals for each vertex and how often its used.
		for (var i = 0; i<Cube.vertexPositions.length; i++) {
			normalSum.push(vec3(0, 0, 0));
			counts.push(0);
		}

		//for each triangle
		for (var i = 0; i<Cube.indices.length; i+=3) {
			var a = Cube.indices[i];
			var b = Cube.indices[i+1];
			var c = Cube.indices[i+2];

			var edge1 = subtract(Cube.vertexPositions[b],Cube.vertexPositions[a])
			var edge2 = subtract(Cube.vertexPositions[c],Cube.vertexPositions[b])
			var N = cross(edge1,edge2)

			normalSum[a] = add(normalSum[a],normalize(N));
			counts[a]++;
			normalSum[b] = add(normalSum[b],normalize(N));
			counts[b]++;
			normalSum[c] = add(normalSum[c],normalize(N));
			counts[c]++;

		}

		for (var i = 0; i < Cube.vertexPositions.length; i++)
			this.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
    }

	static loadTexture() {
		Cube.texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, Cube.texture);

		// Fill the texture with a 1x1 blue pixel.
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

		var image = new Image();
		image.onload = function() {
			gl.bindTexture(gl.TEXTURE_2D, Cube.texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			gl.generateMipmap(gl.TEXTURE_2D);
		};
		image.src = "./Textures/brown-background-natural-sand-texture.jpg";
	}


    static initialize() {
        Cube.computeNormals();
    	Cube.shaderProgram = initShaders( gl, "/vshader.glsl", "/fshader.glsl");

		// Load the data into the GPU
		Cube.positionBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Cube.positionBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Cube.vertexPositions), gl.STATIC_DRAW );

		Cube.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Cube.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Cube.vertexNormals), gl.STATIC_DRAW );

		Cube.texCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, Cube.texCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(Cube.vertexTexCoords), gl.STATIC_DRAW);

		Cube.indexBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Cube.indexBuffer);
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(Cube.indices), gl.STATIC_DRAW );

		// Associate our shader variables with our data buffer
		Cube.aPositionShader = gl.getAttribLocation( Cube.shaderProgram, "aPosition" );
		Cube.aNormalShader = gl.getAttribLocation( Cube.shaderProgram, "aNormal" );
		Cube.aTexCoordShader = gl.getAttribLocation(Cube.shaderProgram, "aTexCoord");

		Cube.uModelMatrixShader = gl.getUniformLocation( Cube.shaderProgram, "modelMatrix" );
		Cube.uCameraMatrixShader = gl.getUniformLocation( Cube.shaderProgram, "cameraMatrix" );
		Cube.uProjectionMatrixShader = gl.getUniformLocation( Cube.shaderProgram, "projectionMatrix" );

		Cube.uMatDiffColorShader = gl.getUniformLocation( Cube.shaderProgram, "matDiffColor" );
		Cube.uMatSpecColorShader = gl.getUniformLocation( Cube.shaderProgram, "matSpecColor" );
		Cube.uMatAlphaShader = gl.getUniformLocation( Cube.shaderProgram, "matAlpha" );

		Cube.uLightDirectionShader = gl.getUniformLocation( Cube.shaderProgram, "lightDirection" );
		Cube.uLightColorShader = gl.getUniformLocation( Cube.shaderProgram, "lightColor" );
		Cube.uTextureShader = gl.getUniformLocation(Cube.shaderProgram, "uTexture");
    }

    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,diffcolor,speccolor,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,diffcolor,speccolor,sh);
        if(Cube.shaderProgram == -1)
            Cube.initialize();
			Cube.loadTexture();

    }

    draw() {

        gl.useProgram(Cube.shaderProgram);

        gl.bindBuffer( gl.ARRAY_BUFFER, Cube.positionBuffer);
       	gl.vertexAttribPointer(Cube.aPositionShader, 3, gl.FLOAT, false, 0, 0 );

       	gl.bindBuffer( gl.ARRAY_BUFFER, Cube.normalBuffer);
       	gl.vertexAttribPointer(Cube.aNormalShader, 3, gl.FLOAT, false, 0, 0 );

		gl.bindBuffer(gl.ARRAY_BUFFER, Cube.texCoordBuffer);
		gl.vertexAttribPointer(Cube.aTexCoordShader, 2, gl.FLOAT, false, 0, 0);

		gl.uniformMatrix4fv(Cube.uModelMatrixShader, false, flatten(this.modelMatrix));
		gl.uniformMatrix4fv(Cube.uCameraMatrixShader, false, flatten(currentCamera.cameraMatrix));
		gl.uniformMatrix4fv(Cube.uProjectionMatrixShader, false, flatten(currentCamera.projectionMatrix));

		console.log(this.matSpecColor);
		gl.uniform4fv(Cube.uMatDiffColorShader, this.matDiffColor);
		gl.uniform4fv(Cube.uMatSpecColorShader, this.matSpecColor);
		gl.uniform1f(Cube.uMatAlphaShader, this.matAlpha);


		gl.uniform3fv(Cube.uLightDirectionShader, light1.direction);
		gl.uniform4fv(Cube.uLightColorShader, light1.color);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, Cube.texture);
		gl.uniform1i(Cube.uTextureShader, 0);


		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Cube.indexBuffer);

		gl.enableVertexAttribArray(Cube.aPositionShader);
		gl.enableVertexAttribArray(Cube.aNormalShader);
		gl.enableVertexAttribArray(Cube.aTexCoordShader);
		gl.drawElements(gl.TRIANGLES, Cube.indices.length, gl.UNSIGNED_BYTE, 0);
    	gl.disableVertexAttribArray(Cube.aPositionShader);
    	gl.disableVertexAttribArray(Cube.aNormalShader);
		gl.disableVertexAttribArray(Cube.aTexCoordShader);
    }
}

