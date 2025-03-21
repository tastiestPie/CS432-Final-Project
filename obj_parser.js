class OBJModel {
    constructor(fname) {
        let vertices = [];
        let colors = [];
        let indices = [];
        let objVertices = [];

        let f = loadFileAJAX(fname);
        let lines = f.split('\n');

        for (let line of lines) {
            let parts = line.trim().split(/\s+/);
            if (parts.length === 0) continue;

            switch (parts[0]) {
                case 'v':
                    objVertices.push(vec3(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])));
                    break;

                case 'f':
                    for (let i = 1; i < parts.length; i++) {
                        let vertexIndex = parseInt(parts[i].split('/')[0]) - 1;
                        indices.push(vertexIndex);
                    }
                    break;
            }
        }

        for (let i = 0; i < indices.length; i++) {
            vertices.push(objVertices[indices[i]]);
            colors.push(vec4(Math.random(), Math.random(), Math.random(), 1.0));
        }

        // Create buffers
        this.vertexBuffer = gl.createBuffer();
        this.colorBuffer = gl.createBuffer();
        this.indexBuffer = gl.createBuffer();

        // Move vertex data to the buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

        // Move color data to the buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

        // Move index data to the buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        this.numIndices = indices.length;
        this.modelMatrix = mat4();
        this.initShaders();
    }

    initShaders() {
        
    }

    draw(camera) {
        gl.useProgram(this.program);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(this.vPositionLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vPositionLoc);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.vertexAttribPointer(this.vColorLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.vColorLoc);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.uniformMatrix4fv(this.modelViewMatrixLoc, false, flatten(camera.cameraMatrix));
        gl.uniformMatrix4fv(this.projectionMatrixLoc, false, flatten(camera.projectionMatrix));
        gl.uniformMatrix4fv(this.modelMatrixLoc, false, flatten(this.modelMatrix));

        gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
    }
}
