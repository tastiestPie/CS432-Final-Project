class OBJParser {
    constructor(objData) {
      // Store the raw OBJ file data (passed in as a string)
      this.objData = objData;
      // Final arrays to send to the GPU
      this.finalVertices = [];
      this.finalTexcoords = [];
      this.finalNormals = [];
      this.indices = [];
    }
  
    parse() {
      // Temporary arrays to hold the raw data from the file
      const tempVertices = [];
      const tempTexcoords = [];
      const tempNormals = [];
      // To avoid duplicating vertices, we map unique combinations to indices
      const vertexMap = {};
      let index = 0;
  
      // Split the file by newlines and process each line
      const lines = this.objData.split('\n');
      for (let line of lines) {
        line = line.trim();
        // Skip empty lines or comments
        if (line.length === 0 || line.startsWith('#')) continue;
  
        const parts = line.split(/\s+/);
        const keyword = parts[0];
  
        switch (keyword) {
          case 'v': // Vertex position
            tempVertices.push([
              parseFloat(parts[1]),
              parseFloat(parts[2]),
              parseFloat(parts[3])
            ]);
            break;
  
          case 'vt': // Texture coordinate
            tempTexcoords.push([
              parseFloat(parts[1]),
              parseFloat(parts[2])
            ]);
            break;
  
          case 'vn': // Normal vector
            tempNormals.push([
              parseFloat(parts[1]),
              parseFloat(parts[2]),
              parseFloat(parts[3])
            ]);
            break;
  
          case 'f': // Face
            // A face may be defined as "f v/vt/vn ..." or similar.
            // We loop over each vertex definition in the face.
            for (let i = 1; i < parts.length; i++) {
              const vals = parts[i].split('/');
              // OBJ indices are 1-based so we subtract 1.
              const vIndex = parseInt(vals[0]) - 1;
              const vtIndex = vals[1] ? parseInt(vals[1]) - 1 : null;
              const vnIndex = vals[2] ? parseInt(vals[2]) - 1 : null;
              // Create a unique key for the vertex combination.
              const key = `${vIndex}/${vtIndex}/${vnIndex}`;
              if (!(key in vertexMap)) {
                // Push the vertex position
                const vertex = tempVertices[vIndex];
                this.finalVertices.push(...vertex);
  
                // Push the texture coordinate if available
                if (vtIndex !== null && tempTexcoords[vtIndex]) {
                  this.finalTexcoords.push(...tempTexcoords[vtIndex]);
                }
  
                // Push the normal if available
                if (vnIndex !== null && tempNormals[vnIndex]) {
                  this.finalNormals.push(...tempNormals[vnIndex]);
                }
  
                // Map the key to the new index
                vertexMap[key] = index++;
              }
              // Store the index for this face
              this.indices.push(vertexMap[key]);
            }
            break;
  
          default:
            // Handle other possible keywords or ignore them.
            break;
        }
      }
    }
  
    createBuffers(gl) {
      // Create and fill the vertex buffer
      this.vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.finalVertices), gl.STATIC_DRAW);
  
      // If texture coordinates were provided, create their buffer
      if (this.finalTexcoords.length > 0) {
        this.texcoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.finalTexcoords), gl.STATIC_DRAW);
      }
  
      // If normals were provided, create their buffer
      if (this.finalNormals.length > 0) {
        this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.finalNormals), gl.STATIC_DRAW);
      }
  
      // Create the index buffer
      this.indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
    }
  
    render(gl, shaderProgram) {
      // Bind the vertex buffer and assign it to the shader attribute for positions
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      const posLocation = gl.getAttribLocation(shaderProgram, "aPosition");
      gl.vertexAttribPointer(posLocation, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(posLocation);
  
      // If texture coordinates exist, bind the texture coordinate buffer
      if (this.texcoordBuffer) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
        const texLocation = gl.getAttribLocation(shaderProgram, "aTexCoord");
        gl.vertexAttribPointer(texLocation, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(texLocation);
      }
  
      // If normals exist, bind the normal buffer
      if (this.normalBuffer) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        const normLocation = gl.getAttribLocation(shaderProgram, "aNormal");
        gl.vertexAttribPointer(normLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(normLocation);
      }
  
      // Bind the index buffer and draw the elements
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }
  }
  