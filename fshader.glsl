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

    // Debugging: Visualize normals
    fColor = vec4(fN, 1.0);
    return;

    // Debugging: Visualize light direction
    // fColor = vec4(fL, 1.0);
    // return;

    // Debugging: Visualize diffuse contribution
    float Kd = max(dot(fL, fN), 0.0);
    // fColor = vec4(Kd, Kd, Kd, 1.0);
    // return;

    // Debugging: Visualize specular contribution
    vec3 H = normalize(fL + fV);
    float Ks = pow(max(dot(fN, H), 0.0), matAlpha);
    // fColor = vec4(Ks, Ks, Ks, 1.0);
    // return;

    // Final lighting calculation
    vec4 diffuse = Kd * lightColor * matDiffColor;
    vec4 specular = Ks * lightColor * matSpecColor;
    fColor = diffuse + specular;
    fColor.a = 1.0;
}