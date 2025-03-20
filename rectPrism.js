class RectPrism extends Drawable{
    static vertexPositions = [
    	vec3(-5,-0.5,10),
    	vec3(-5,0.5,10),
    	vec3(5,0.5,10),
    	vec3(5,-0.5,10),
    	vec3(-5,-0.5,-10),
    	vec3(-5,0.5,-10),
    	vec3(5,0.5,-10),
    	vec3(5,-0.5,-10),
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
		for (var i = 0; i<RectPrism.vertexPositions.length; i++) {
			normalSum.push(vec3(0, 0, 0));
			counts.push(0);
		}

		//for each triangle
		for (var i = 0; i<RectPrism.indices.length; i+=3) {
			var a = RectPrism.indices[i];
			var b = RectPrism.indices[i+1];
			var c = RectPrism.indices[i+2];

			var edge1 = subtract(RectPrism.vertexPositions[b],RectPrism.vertexPositions[a])
			var edge2 = subtract(RectPrism.vertexPositions[c],RectPrism.vertexPositions[b])
			var N = cross(edge1,edge2)

			normalSum[a] = add(normalSum[a],normalize(N));
			counts[a]++;
			normalSum[b] = add(normalSum[b],normalize(N));
			counts[b]++;
			normalSum[c] = add(normalSum[c],normalize(N));
			counts[c]++;

		}

		for (var i = 0; i < RectPrism.vertexPositions.length; i++)
			this.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
    }

	static loadTexture() {
		RectPrism.texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, RectPrism.texture);

		// Fill the texture with a 1x1 blue pixel.
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

		var image = new Image();
		image.onload = function() {
			gl.bindTexture(gl.TEXTURE_2D, RectPrism.texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			gl.generateMipmap(gl.TEXTURE_2D);
		};
		image.src = "./Textures/istockphoto-118337676-612x612.jpg";
	}


    static initialize() {
        RectPrism.computeNormals();
    	RectPrism.shaderProgram = initShaders( gl, "/vshader.glsl", "/fshader.glsl");

		// Load the data into the GPU
		RectPrism.positionBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, RectPrism.positionBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(RectPrism.vertexPositions), gl.STATIC_DRAW );

		RectPrism.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, RectPrism.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(RectPrism.vertexNormals), gl.STATIC_DRAW );

		RectPrism.texCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, RectPrism.texCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(RectPrism.vertexTexCoords), gl.STATIC_DRAW);

		RectPrism.indexBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, RectPrism.indexBuffer);
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(RectPrism.indices), gl.STATIC_DRAW );

		// Associate our shader variables with our data buffer
		RectPrism.aPositionShader = gl.getAttribLocation( RectPrism.shaderProgram, "aPosition" );
		RectPrism.aNormalShader = gl.getAttribLocation( RectPrism.shaderProgram, "aNormal" );
		RectPrism.aTexCoordShader = gl.getAttribLocation(RectPrism.shaderProgram, "aTexCoord");

		RectPrism.uModelMatrixShader = gl.getUniformLocation( RectPrism.shaderProgram, "modelMatrix" );
		RectPrism.uCameraMatrixShader = gl.getUniformLocation( RectPrism.shaderProgram, "cameraMatrix" );
		RectPrism.uProjectionMatrixShader = gl.getUniformLocation( RectPrism.shaderProgram, "projectionMatrix" );

		RectPrism.uMatDiffColorShader = gl.getUniformLocation( RectPrism.shaderProgram, "matDiffColor" );
		RectPrism.uMatSpecColorShader = gl.getUniformLocation( RectPrism.shaderProgram, "matSpecColor" );
		RectPrism.uMatAlphaShader = gl.getUniformLocation( RectPrism.shaderProgram, "matAlpha" );

		RectPrism.uLightDirectionShader = gl.getUniformLocation( RectPrism.shaderProgram, "lightDirection" );
		RectPrism.uLightColorShader = gl.getUniformLocation( RectPrism.shaderProgram, "lightColor" );
		RectPrism.uTextureShader = gl.getUniformLocation(RectPrism.shaderProgram, "uTexture");
    }

    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,diffcolor,speccolor,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,diffcolor,speccolor,sh);
        if(RectPrism.shaderProgram == -1)
            RectPrism.initialize();
			RectPrism.loadTexture();

    }

    draw() {

        gl.useProgram(RectPrism.shaderProgram);

        gl.bindBuffer( gl.ARRAY_BUFFER, RectPrism.positionBuffer);
       	gl.vertexAttribPointer(RectPrism.aPositionShader, 3, gl.FLOAT, false, 0, 0 );

       	gl.bindBuffer( gl.ARRAY_BUFFER, RectPrism.normalBuffer);
       	gl.vertexAttribPointer(RectPrism.aNormalShader, 3, gl.FLOAT, false, 0, 0 );

		gl.bindBuffer(gl.ARRAY_BUFFER, RectPrism.texCoordBuffer);
		gl.vertexAttribPointer(RectPrism.aTexCoordShader, 2, gl.FLOAT, false, 0, 0);

		gl.uniformMatrix4fv(RectPrism.uModelMatrixShader, false, flatten(this.modelMatrix));
		gl.uniformMatrix4fv(RectPrism.uCameraMatrixShader, false, flatten(currentCamera.cameraMatrix));
		gl.uniformMatrix4fv(RectPrism.uProjectionMatrixShader, false, flatten(currentCamera.projectionMatrix));

		console.log(this.matSpecColor);
		gl.uniform4fv(RectPrism.uMatDiffColorShader, this.matDiffColor);
		gl.uniform4fv(RectPrism.uMatSpecColorShader, this.matSpecColor);
		gl.uniform1f(RectPrism.uMatAlphaShader, this.matAlpha);


		gl.uniform3fv(RectPrism.uLightDirectionShader, light1.direction);
		gl.uniform4fv(RectPrism.uLightColorShader, light1.color);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, RectPrism.texture);
		gl.uniform1i(RectPrism.uTextureShader, 0);


		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, RectPrism.indexBuffer);

		gl.enableVertexAttribArray(RectPrism.aPositionShader);
		gl.enableVertexAttribArray(RectPrism.aNormalShader);
		gl.enableVertexAttribArray(RectPrism.aTexCoordShader);
		gl.drawElements(gl.TRIANGLES, RectPrism.indices.length, gl.UNSIGNED_BYTE, 0);
    	gl.disableVertexAttribArray(RectPrism.aPositionShader);
    	gl.disableVertexAttribArray(RectPrism.aNormalShader);
		gl.disableVertexAttribArray(RectPrism.aTexCoordShader);
    }
}

