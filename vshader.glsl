#version 300 es
in vec3 aPosition;
in vec3 aNormal;

uniform mat4 modelMatrix, cameraMatrix, projectionMatrix;
uniform vec3 lightDirection;

out vec3 L;
out vec3 V;
out vec3 N;



void main()
{
    gl_Position = projectionMatrix*cameraMatrix*modelMatrix*vec4(aPosition,1.0);
    
    //compute vectors in camera coordinates
    //the vertex in camera coordinates
    vec3 pos = (cameraMatrix*modelMatrix*vec4(aPosition,1.0)).xyz;

    //the ray from the vertex towards the light
    //for a directional light, this is just -lightDirection
    L = normalize((-cameraMatrix*vec4(lightDirection,0.0)).xyz);
    
    //the ray from the vertex towards the camera
    V = normalize(vec3(0,0,0)-pos);
    
    //normal in camera coordinates
    N = normalize(cameraMatrix*modelMatrix*vec4(aNormal,0)).xyz;
    
}