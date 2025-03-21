class Background extends Drawable{
    static vertexPositions = [
    	vec3(-10.0,-10.0, 0),
    	vec3(10.0,-10.0,0),
    	vec3(10.0,10.0,0),
    	vec3(-10.0,10.0,0)
    ];

    static vertexNormals = [];

    static indices = [
		0, 1, 2,
		0, 2, 3
    ];

	static vertexTexCoords = [
		vec2(0.0, 0.0),
		vec2(1.0, 0.0),
		vec2(1.0, 1.0),
		vec2(0.0, 1.0)
	];

    static vPositions = [];

    static depth = 32;
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

	static computeNormals() {
		// All normals point upward along the Y-axis
		this.vertexNormals = [
			vec3(0, 1, 0),
			vec3(0, 1, 0),
			vec3(0, 1, 0),
			vec3(0, 1, 0)
		];
	}

	static loadTexture() {
		Background.texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, Background.texture);

		// Fill the texture with a 1x1 blue pixel.
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

		var image = new Image();
		image.onload = function() {
			gl.bindTexture(gl.TEXTURE_2D, Background.texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			gl.generateMipmap(gl.TEXTURE_2D);
		};
		image.src = "./Textures/sky-back.jpg";
	}


    static initialize() {
        Background.computeNormals();
    	Background.shaderProgram = initShaders( gl, "/vshader.glsl", "/fshader.glsl");

		// Load the data into the GPU
		Background.positionBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Background.positionBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Background.vertexPositions), gl.STATIC_DRAW );

		Background.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Background.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Background.vertexNormals), gl.STATIC_DRAW );

		Background.texCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, Background.texCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(Background.vertexTexCoords), gl.STATIC_DRAW);

		Background.indexBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Background.indexBuffer);
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(Background.indices), gl.STATIC_DRAW );

		// Associate our shader variables with our data buffer
		Background.aPositionShader = gl.getAttribLocation( Background.shaderProgram, "aPosition" );
		Background.aNormalShader = gl.getAttribLocation( Background.shaderProgram, "aNormal" );
		Background.aTexCoordShader = gl.getAttribLocation(Background.shaderProgram, "aTexCoord");

		Background.uModelMatrixShader = gl.getUniformLocation( Background.shaderProgram, "modelMatrix" );
		Background.uCameraMatrixShader = gl.getUniformLocation( Background.shaderProgram, "cameraMatrix" );
		Background.uProjectionMatrixShader = gl.getUniformLocation( Background.shaderProgram, "projectionMatrix" );

		Background.uMatDiffColorShader = gl.getUniformLocation( Background.shaderProgram, "matDiffColor" );
		Background.uMatSpecColorShader = gl.getUniformLocation( Background.shaderProgram, "matSpecColor" );
		Background.uMatAlphaShader = gl.getUniformLocation( Background.shaderProgram, "matAlpha" );

		Background.uLightDirectionShader = gl.getUniformLocation( Background.shaderProgram, "lightDirection" );
		Background.uLightColorShader = gl.getUniformLocation( Background.shaderProgram, "lightColor" );
		Background.uTextureShader = gl.getUniformLocation(Background.shaderProgram, "uTexture");

    }

    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,diffcolor,speccolor,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,diffcolor,speccolor,sh);
        if(Background.shaderProgram == -1)
            Background.initialize();
			Background.loadTexture();

    }

    draw() {

        gl.useProgram(Background.shaderProgram);

        gl.bindBuffer( gl.ARRAY_BUFFER, Background.positionBuffer);
       	gl.vertexAttribPointer(Background.aPositionShader, 3, gl.FLOAT, false, 0, 0 );

       	gl.bindBuffer( gl.ARRAY_BUFFER, Background.normalBuffer);
       	gl.vertexAttribPointer(Background.aNormalShader, 3, gl.FLOAT, false, 0, 0 );

		gl.bindBuffer(gl.ARRAY_BUFFER, Background.texCoordBuffer);
		gl.vertexAttribPointer(Background.aTexCoordShader, 2, gl.FLOAT, false, 0, 0);

		gl.uniformMatrix4fv(Background.uModelMatrixShader, false, flatten(this.modelMatrix));
		gl.uniformMatrix4fv(Background.uCameraMatrixShader, false, flatten(currentCamera.cameraMatrix));
		gl.uniformMatrix4fv(Background.uProjectionMatrixShader, false, flatten(currentCamera.projectionMatrix));

		//console.log(this.matSpecColor);
		gl.uniform4fv(Background.uMatDiffColorShader, this.matDiffColor);
		gl.uniform4fv(Background.uMatSpecColorShader, this.matSpecColor);
		gl.uniform1f(Background.uMatAlphaShader, this.matAlpha);

		gl.uniform3fv(Background.uLightDirectionShader, normalize(light1.direction));
		gl.uniform4fv(Background.uLightColorShader, light1.color);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, Background.texture);
		gl.uniform1i(Background.uTextureShader, 0);

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Background.indexBuffer);

		gl.enableVertexAttribArray(Background.aPositionShader);
		gl.enableVertexAttribArray(Background.aNormalShader);
		gl.enableVertexAttribArray(Background.aTexCoordShader);
		gl.drawElements(gl.TRIANGLES, Background.indices.length, gl.UNSIGNED_BYTE, 0);
    	gl.disableVertexAttribArray(Background.aPositionShader);
    	gl.disableVertexAttribArray(Background.aNormalShader);
		gl.disableVertexAttribArray(Background.aTexCoordShader);
    }
}