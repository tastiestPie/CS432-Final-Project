var gl;

class Skybox {
    constructor(gl) {
        this.gl = gl;
        this.texture = gl.createTexture();
        this.textsize = 256;

        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

        var image1 = new Image();
        image1.src = "./Textures/sky-top.jpg";
        image1.onload = function() {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, this.textsize, this.textsize, 0, gl.RGB, gl.UNSIGNED_BYTE, image1);
        }.bind(this);

        var image2 = new Image();
        image2.src = "./Textures/sky-bottom.jpg";
        image2.onload = function() {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, this.textsize, this.textsize, 0, gl.RGB, gl.UNSIGNED_BYTE, image2);
        }.bind(this);

        var image3 = new Image();
        image3.src = "./Textures/sky-right.jpg";
        image3.onload = function() {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, this.textsize, this.textsize, 0, gl.RGB, gl.UNSIGNED_BYTE, image3);
        }.bind(this);

        var image4 = new Image();
        image4.src = "./Textures/sky-left.jpg";
        image4.onload = function() {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, this.textsize, this.textsize, 0, gl.RGB, gl.UNSIGNED_BYTE, image4);
        }.bind(this);

        var image5 = new Image();
        image5.src = "./Textures/sky-back.jpg";
        image5.onload = function() {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, this.textsize, this.textsize, 0, gl.RGB, gl.UNSIGNED_BYTE, image5);
        }.bind(this);

        var image6 = new Image();
        image6.src = "./Textures/sky-front.jpg";
        image6.onload = function() {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, this.textsize, this.textsize, 0, gl.RGB, gl.UNSIGNED_BYTE, image6);
        }.bind(this);

        this.program = null;
        this.vertexBuffer = this.createVertexBuffer(gl);
    }

    async init() {
        const vertexShaderSource = await loadShaderSource('./sky_vshader.glsl');
        const fragmentShaderSource = await loadShaderSource('./sky_fshader.glsl');
        this.program = this.createShaderProgram(this.gl, vertexShaderSource, fragmentShaderSource);
    }

    createShaderProgram(gl, vertexShaderSource, fragmentShaderSource) {
        const vertexShader = this.compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    
        if (!vertexShader || !fragmentShader) {
            console.error('Shader compilation failed.');
            return null;
        }
    
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
    
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program failed to link:', gl.getProgramInfoLog(program));
            return null;
        }
    
        return program;
    }

    compileShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
    
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader failed to compile:', gl.getShaderInfoLog(shader));
            console.error('Shader source:', source); // Log the shader source for debugging
            return null;
        }
    
        return shader;
    }

    createVertexBuffer(gl) {
        const vertices = [
            // Front face
            -1, -1,  1,
             1, -1,  1,
             1,  1,  1,
            -1,  1,  1,

            // Back face
            -1, -1, -1,
            -1,  1, -1,
             1,  1, -1,
             1, -1, -1,

            // Top face
            -1,  1, -1,
            -1,  1,  1,
             1,  1,  1,
             1,  1, -1,

            // Bottom face
            -1, -1, -1,
             1, -1, -1,
             1, -1,  1,
            -1, -1,  1,

            // Right face
             1, -1, -1,
             1,  1, -1,
             1,  1,  1,
             1, -1,  1,

            // Left face
            -1, -1, -1,
            -1, -1,  1,
            -1,  1,  1,
            -1,  1, -1
        ];

        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        return vertexBuffer;
    }

    render(camera) {
        const gl = this.gl;

        if (!this.program) {
            console.error('Shader program not initialized.');
            return;
        }

        gl.disable(gl.DEPTH_TEST);

        gl.useProgram(this.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

        const positionLocation = gl.getAttribLocation(this.program, "aPosition");
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
        const skyboxLocation = gl.getUniformLocation(this.program, "u_skybox");
        gl.uniform1i(skyboxLocation, 0);

        const viewMatrix = mat4(camera.cameraMatrix);
        const projectionMatrix = mat4(camera.projectionMatrix);
        const viewProjectionMatrix = mult(projectionMatrix, viewMatrix);

        const viewProjectionLocation = gl.getUniformLocation(this.program, "u_viewProjection");
        gl.uniformMatrix4fv(viewProjectionLocation, false, flatten(viewProjectionMatrix));

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.drawArrays(gl.TRIANGLE_STRIP, 4, 4);
        gl.drawArrays(gl.TRIANGLE_STRIP, 8, 4);
        gl.drawArrays(gl.TRIANGLE_STRIP, 12, 4);
        gl.drawArrays(gl.TRIANGLE_STRIP, 16, 4);
        gl.drawArrays(gl.TRIANGLE_STRIP, 20, 4);

        gl.enable(gl.DEPTH_TEST);
    }
}