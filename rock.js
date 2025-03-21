class Rock extends Drawable{
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
		for (var i = 0; i<Rock.vertexPositions.length; i++) {
			normalSum.push(vec3(0, 0, 0));
			counts.push(0);
		}

		//for each triangle
		for (var i = 0; i<Rock.indices.length; i+=3) {
			var a = Rock.indices[i];
			var b = Rock.indices[i+1];
			var c = Rock.indices[i+2];

			var edge1 = subtract(Rock.vertexPositions[b],Rock.vertexPositions[a])
			var edge2 = subtract(Rock.vertexPositions[c],Rock.vertexPositions[b])
			var N = cross(edge1,edge2)

			normalSum[a] = add(normalSum[a],normalize(N));
			counts[a]++;
			normalSum[b] = add(normalSum[b],normalize(N));
			counts[b]++;
			normalSum[c] = add(normalSum[c],normalize(N));
			counts[c]++;

		}

		for (var i = 0; i < Rock.vertexPositions.length; i++)
			this.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
    }

	static loadTexture() {
		Rock.texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, Rock.texture);

		// Fill the texture with a 1x1 blue pixel.
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

		var image = new Image();
		image.onload = function() {
			gl.bindTexture(gl.TEXTURE_2D, Rock.texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			gl.generateMipmap(gl.TEXTURE_2D);
		};
		image.src = "./Textures/ground-texture-sand-rock-beach-environment-modeling-wallpaper-5.jpg";
	}


    static initialize() {
        Rock.computeNormals();
    	Rock.shaderProgram = initShaders( gl, "/vshader.glsl", "/fshader.glsl");

		// Load the data into the GPU
		Rock.positionBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Rock.positionBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Rock.vertexPositions), gl.STATIC_DRAW );

		Rock.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Rock.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Rock.vertexNormals), gl.STATIC_DRAW );

		Rock.texCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, Rock.texCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(Rock.vertexTexCoords), gl.STATIC_DRAW);

		Rock.indexBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Rock.indexBuffer);
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(Rock.indices), gl.STATIC_DRAW );

		// Associate our shader variables with our data buffer
		Rock.aPositionShader = gl.getAttribLocation( Rock.shaderProgram, "aPosition" );
		Rock.aNormalShader = gl.getAttribLocation( Rock.shaderProgram, "aNormal" );
		Rock.aTexCoordShader = gl.getAttribLocation(Rock.shaderProgram, "aTexCoord");

		Rock.uModelMatrixShader = gl.getUniformLocation( Rock.shaderProgram, "modelMatrix" );
		Rock.uCameraMatrixShader = gl.getUniformLocation( Rock.shaderProgram, "cameraMatrix" );
		Rock.uProjectionMatrixShader = gl.getUniformLocation( Rock.shaderProgram, "projectionMatrix" );

		Rock.uMatDiffColorShader = gl.getUniformLocation( Rock.shaderProgram, "matDiffColor" );
		Rock.uMatSpecColorShader = gl.getUniformLocation( Rock.shaderProgram, "matSpecColor" );
		Rock.uMatAlphaShader = gl.getUniformLocation( Rock.shaderProgram, "matAlpha" );

		Rock.uLightDirectionShader = gl.getUniformLocation( Rock.shaderProgram, "lightDirection" );
		Rock.uLightColorShader = gl.getUniformLocation( Rock.shaderProgram, "lightColor" );
		Rock.uTextureShader = gl.getUniformLocation(Rock.shaderProgram, "uTexture");
    }

    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,diffcolor,speccolor,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,diffcolor,speccolor,sh);
        if(Rock.shaderProgram == -1)
            Rock.initialize();
			Rock.loadTexture();

    }

    draw() {

        gl.useProgram(Rock.shaderProgram);

        gl.bindBuffer( gl.ARRAY_BUFFER, Rock.positionBuffer);
       	gl.vertexAttribPointer(Rock.aPositionShader, 3, gl.FLOAT, false, 0, 0 );

       	gl.bindBuffer( gl.ARRAY_BUFFER, Rock.normalBuffer);
       	gl.vertexAttribPointer(Rock.aNormalShader, 3, gl.FLOAT, false, 0, 0 );

		gl.bindBuffer(gl.ARRAY_BUFFER, Rock.texCoordBuffer);
		gl.vertexAttribPointer(Rock.aTexCoordShader, 2, gl.FLOAT, false, 0, 0);

		gl.uniformMatrix4fv(Rock.uModelMatrixShader, false, flatten(this.modelMatrix));
		gl.uniformMatrix4fv(Rock.uCameraMatrixShader, false, flatten(currentCamera.cameraMatrix));
		gl.uniformMatrix4fv(Rock.uProjectionMatrixShader, false, flatten(currentCamera.projectionMatrix));

		console.log(this.matSpecColor);
		gl.uniform4fv(Rock.uMatDiffColorShader, this.matDiffColor);
		gl.uniform4fv(Rock.uMatSpecColorShader, this.matSpecColor);
		gl.uniform1f(Rock.uMatAlphaShader, this.matAlpha);


		gl.uniform3fv(Rock.uLightDirectionShader, light1.direction);
		gl.uniform4fv(Rock.uLightColorShader, light1.color);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, Rock.texture);
		gl.uniform1i(Rock.uTextureShader, 0);


		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Rock.indexBuffer);

		gl.enableVertexAttribArray(Rock.aPositionShader);
		gl.enableVertexAttribArray(Rock.aNormalShader);
		gl.enableVertexAttribArray(Rock.aTexCoordShader);
		gl.drawElements(gl.TRIANGLES, Rock.indices.length, gl.UNSIGNED_BYTE, 0);
    	gl.disableVertexAttribArray(Rock.aPositionShader);
    	gl.disableVertexAttribArray(Rock.aNormalShader);
		gl.disableVertexAttribArray(Rock.aTexCoordShader);
    }
}

