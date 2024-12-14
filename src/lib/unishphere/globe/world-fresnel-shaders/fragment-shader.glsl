uniform float fresnelPower;
uniform float fresnelScale;
uniform float ambientIntensity;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vLightDirection;

void main() {
    vec3 viewDirection = normalize(vViewPosition);
    vec3 fresnelColor = vec3(0.1059, 0.1137, 0.0353);
    
    // Narrow the Fresnel effect to only near edges
    float edgeDot = 1.0 - max(dot(vNormal, viewDirection), 0.0);
    float fresnelFactor = pow(smoothstep(0.45, 1.0, edgeDot), fresnelPower);
    fresnelFactor = fresnelScale * fresnelFactor;

    vec2 newUv = vec2(fresnelFactor) - 0.9;
    float light = 0.3 / abs(newUv.y);
    vec3 finalColor = fresnelColor * light;
    
    float diffuseFactor = max(0.0, dot(vNormal, vLightDirection));
    
    float lighting = ambientIntensity + diffuseFactor;
    
    gl_FragColor = vec4(finalColor * lighting, diffuseFactor);
}