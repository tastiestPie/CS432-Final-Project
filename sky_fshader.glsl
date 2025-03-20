precision mediump float;
varying vec3 v_texCoords;
uniform samplerCube u_skybox;

void main() {
    gl_FragColor = textureCube(u_skybox, v_texCoords);
}
