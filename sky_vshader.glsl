attribute vec3 aPosition;
attribute vec3 a_position;
varying vec3 v_texCoords;

void main() {
    v_texCoords = a_position; 
    gl_Position = vec4(a_position, 1.0);
}
