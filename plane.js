class Plane extends Drawable{
    static vertexPositions = [
    	vec3(-10.0,0.0, -10.0),
    	vec3(10.0,0.0,-10.0),
    	vec3(10.0,0.0,10.0),
    	vec3(-10.0,0.0,10.0)
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
		this.vertexNormals = [
			vec3(0, 1, 0),
			vec3(0, 1, 0),
			vec3(0, 1, 0),
			vec3(0, 1, 0)
		];
	}

	static loadTexture() {
		Plane.texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, Plane.texture);

		// Fill the texture with a 1x1 blue pixel.
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

		var image = new Image();
		image.onload = function() {
			gl.bindTexture(gl.TEXTURE_2D, Plane.texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			gl.generateMipmap(gl.TEXTURE_2D);
		};
		image.src = "./Textures/brown-background-natural-sand-texture.jpg";
	}


    static initialize() {
        Plane.computeNormals();
    	Plane.shaderProgram = initShaders( gl, "/vshader.glsl", "/fshader.glsl");

		// Load the data into the GPU
		Plane.positionBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Plane.positionBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Plane.vertexPositions), gl.STATIC_DRAW );

		Plane.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Plane.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Plane.vertexNormals), gl.STATIC_DRAW );

		Plane.texCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, Plane.texCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(Plane.vertexTexCoords), gl.STATIC_DRAW);

		Plane.indexBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Plane.indexBuffer);
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(Plane.indices), gl.STATIC_DRAW );

		// Associate our shader variables with our data buffer
		Plane.aPositionShader = gl.getAttribLocation( Plane.shaderProgram, "aPosition" );
		Plane.aNormalShader = gl.getAttribLocation( Plane.shaderProgram, "aNormal" );
		Plane.aTexCoordShader = gl.getAttribLocation(Plane.shaderProgram, "aTexCoord");

		Plane.uModelMatrixShader = gl.getUniformLocation( Plane.shaderProgram, "modelMatrix" );
		Plane.uCameraMatrixShader = gl.getUniformLocation( Plane.shaderProgram, "cameraMatrix" );
		Plane.uProjectionMatrixShader = gl.getUniformLocation( Plane.shaderProgram, "projectionMatrix" );

		Plane.uMatDiffColorShader = gl.getUniformLocation( Plane.shaderProgram, "matDiffColor" );
		Plane.uMatSpecColorShader = gl.getUniformLocation( Plane.shaderProgram, "matSpecColor" );
		Plane.uMatAlphaShader = gl.getUniformLocation( Plane.shaderProgram, "matAlpha" );

		Plane.uLightDirectionShader = gl.getUniformLocation( Plane.shaderProgram, "lightDirection" );
		Plane.uLightColorShader = gl.getUniformLocation( Plane.shaderProgram, "lightColor" );
		Plane.uTextureShader = gl.getUniformLocation(Plane.shaderProgram, "uTexture");

    }

    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,diffcolor,speccolor,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,diffcolor,speccolor,sh);
        if(Plane.shaderProgram == -1)
            Plane.initialize();
			Plane.loadTexture();

    }

    draw() {

        gl.useProgram(Plane.shaderProgram);

        gl.bindBuffer( gl.ARRAY_BUFFER, Plane.positionBuffer);
       	gl.vertexAttribPointer(Plane.aPositionShader, 3, gl.FLOAT, false, 0, 0 );

       	gl.bindBuffer( gl.ARRAY_BUFFER, Plane.normalBuffer);
       	gl.vertexAttribPointer(Plane.aNormalShader, 3, gl.FLOAT, false, 0, 0 );

		gl.bindBuffer(gl.ARRAY_BUFFER, Plane.texCoordBuffer);
		gl.vertexAttribPointer(Plane.aTexCoordShader, 2, gl.FLOAT, false, 0, 0);

		gl.uniformMatrix4fv(Plane.uModelMatrixShader, false, flatten(this.modelMatrix));
		gl.uniformMatrix4fv(Plane.uCameraMatrixShader, false, flatten(currentCamera.cameraMatrix));
		gl.uniformMatrix4fv(Plane.uProjectionMatrixShader, false, flatten(currentCamera.projectionMatrix));

		//console.log(this.matSpecColor);
		gl.uniform4fv(Plane.uMatDiffColorShader, this.matDiffColor);
		gl.uniform4fv(Plane.uMatSpecColorShader, this.matSpecColor);
		gl.uniform1f(Plane.uMatAlphaShader, this.matAlpha);

		gl.uniform3fv(Plane.uLightDirectionShader, normalize(light1.direction));
		gl.uniform4fv(Plane.uLightColorShader, light1.color);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, Plane.texture);
		gl.uniform1i(Plane.uTextureShader, 0);

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Plane.indexBuffer);

		gl.enableVertexAttribArray(Plane.aPositionShader);
		gl.enableVertexAttribArray(Plane.aNormalShader);
		gl.enableVertexAttribArray(Plane.aTexCoordShader);
		gl.drawElements(gl.TRIANGLES, Plane.indices.length, gl.UNSIGNED_BYTE, 0);
    	gl.disableVertexAttribArray(Plane.aPositionShader);
    	gl.disableVertexAttribArray(Plane.aNormalShader);
		gl.disableVertexAttribArray(Plane.aTexCoordShader);
    }
}

