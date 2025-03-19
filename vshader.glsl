#version 300 es
in vec3 aPosition;
in vec3 aNormal;
in vec2 aTexCoord; // Add texture coordinate attribute

uniform mat4 modelMatrix, cameraMatrix, projectionMatrix;
uniform vec3 lightDirection;

out vec3 L;
out vec3 V;
out vec3 N;
out vec2 vTexCoord; // Pass texture coordinates to the fragment shader

void main()
{
    gl_Position = projectionMatrix * cameraMatrix * modelMatrix * vec4(aPosition, 1.0);
    
    // Compute vectors in camera coordinates
    // The vertex in camera coordinates
    vec3 pos = (cameraMatrix * modelMatrix * vec4(aPosition, 1.0)).xyz;

    // The ray from the vertex towards the light
    // For a directional light, this is just -lightDirection
    L = normalize((-cameraMatrix * vec4(lightDirection, 0.0)).xyz);
    
    // The ray from the vertex towards the camera
    V = normalize(vec3(0, 0, 0) - pos);
    
    // Normal in camera coordinates
    N = normalize(cameraMatrix * modelMatrix * vec4(aNormal, 0)).xyz;
    
    // Pass texture coordinates to the fragment shader
    vTexCoord = aTexCoord;
}