#version 300 es
precision mediump float;

uniform vec4 matDiffColor;
uniform vec4 matSpecColor;
uniform float matAlpha;
uniform vec4 lightColor;

in vec3 L;
in vec3 V;
in vec3 N;

out vec4 fColor;

void main()
{
     vec3 fL = normalize(L);
     vec3 fV = normalize(V);
     vec3 fN = normalize(N);
     
    //half-way vector	
     vec3 H = normalize(fL+fV);
        
     float Kd = max(dot(fL,fN),0.0);
     vec4 diffuse = Kd*lightColor*matDiffColor;
        
     float Ks = pow(max(dot(fN,H),0.0),matAlpha);
     vec4 specular = Ks*lightColor*matSpecColor;
        
     vec4 lightColor = (diffuse + specular)/2.0;
     lightColor.a = 1.0;
        
     fColor = lightColor;
}
