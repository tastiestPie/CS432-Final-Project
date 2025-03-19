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

    static vPositions = [];

    static depth = 32;
    static positionBuffer = -1;
    static indexBuffer = -1;
    static normalBuffer = -1;

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

    static computeNormals(){
	var normalSum = [];
	var counts = [];

	//initialize sum of normals for each vertex and how often its used.
	for (var i = 0; i<Plane.vertexPositions.length; i++) {
	    normalSum.push(vec3(0, 0, 0));
	    counts.push(0);
	}

	//for each triangle
	for (var i = 0; i<Plane.indices.length; i+=3) {
	    var a = Plane.indices[i];
	    var b = Plane.indices[i+1];
	    var c = Plane.indices[i+2];

	    var edge1 = subtract(Plane.vertexPositions[b],Plane.vertexPositions[a])
	    var edge2 = subtract(Plane.vertexPositions[c],Plane.vertexPositions[b])
	    var N = cross(edge1,edge2)

	    normalSum[a] = add(normalSum[a],normalize(N));
	    counts[a]++;
	    normalSum[b] = add(normalSum[b],normalize(N));
	    counts[b]++;
	    normalSum[c] = add(normalSum[c],normalize(N));
	    counts[c]++;

	}

	for (var i = 0; i < Plane.vertexPositions.length; i++)
	    this.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
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

		Plane.indexBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Plane.indexBuffer);
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(Plane.indices), gl.STATIC_DRAW );

		// Associate our shader variables with our data buffer
		Plane.aPositionShader = gl.getAttribLocation( Plane.shaderProgram, "aPosition" );
		Plane.aNormalShader = gl.getAttribLocation( Plane.shaderProgram, "aNormal" );

		Plane.uModelMatrixShader = gl.getUniformLocation( Plane.shaderProgram, "modelMatrix" );
		Plane.uCameraMatrixShader = gl.getUniformLocation( Plane.shaderProgram, "cameraMatrix" );
		Plane.uProjectionMatrixShader = gl.getUniformLocation( Plane.shaderProgram, "projectionMatrix" );

		Plane.uMatDiffColorShader = gl.getUniformLocation( Plane.shaderProgram, "matDiffColor" );
		Plane.uMatSpecColorShader = gl.getUniformLocation( Plane.shaderProgram, "matSpecColor" );
		Plane.uMatAlphaShader = gl.getUniformLocation( Plane.shaderProgram, "matAlpha" );

		Plane.uLightDirectionShader = gl.getUniformLocation( Plane.shaderProgram, "lightDirection" );
		Plane.uLightColorShader = gl.getUniformLocation( Plane.shaderProgram, "lightColor" );

    }

    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,diffcolor,speccolor,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,diffcolor,speccolor,sh);
        if(Plane.shaderProgram == -1)
            Plane.initialize()

    }

    draw() {

        gl.useProgram(Plane.shaderProgram);

        gl.bindBuffer( gl.ARRAY_BUFFER, Plane.positionBuffer);
       	gl.vertexAttribPointer(Plane.aPositionShader, 3, gl.FLOAT, false, 0, 0 );

       	gl.bindBuffer( gl.ARRAY_BUFFER, Plane.normalBuffer);
       	gl.vertexAttribPointer(Plane.aNormalShader, 3, gl.FLOAT, false, 0, 0 );

		gl.uniformMatrix4fv(Plane.uModelMatrixShader, false, flatten(this.modelMatrix));
		gl.uniformMatrix4fv(Plane.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
		gl.uniformMatrix4fv(Plane.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));

		console.log(this.matSpecColor);
		gl.uniform4fv(Plane.uMatDiffColorShader, this.matDiffColor);
		gl.uniform4fv(Plane.uMatSpecColorShader, this.matSpecColor);
		gl.uniform1f(Plane.uMatAlphaShader, this.matAlpha);


		gl.uniform3fv(Plane.uLightDirectionShader, light1.direction);
		gl.uniform4fv(Plane.uLightColorShader, light1.color);

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Plane.indexBuffer);

		gl.enableVertexAttribArray(Plane.aPositionShader);
		gl.enableVertexAttribArray(Plane.aNormalShader);
		gl.drawElements(gl.TRIANGLES, Plane.indices.length, gl.UNSIGNED_BYTE, 0);
    	gl.disableVertexAttribArray(Plane.aPositionShader);
    	gl.disableVertexAttribArray(Plane.aNormalShader);
    }
}

