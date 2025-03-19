attribute vec3 aPosition;
uniform mat4 uProjectionMatrix;
uniform mat4 uCameraMatrix;
varying vec3 vTexCoord;

void main() {
    vTexCoord = aPosition; // Pass the vertex position as texture coordinate
    gl_Position = uProjectionMatrix * uCameraMatrix * vec4(aPosition, 1.0);
}