uniform vec3 color;
uniform vec3 fresnelColor;
uniform float fresnelPower;
uniform float fresnelScale;
uniform float revealOpacity;

varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
    vec3 viewDirection = normalize(vViewPosition);
    float fresnelFactor = pow(1.0 - max(dot(vNormal, viewDirection), 0.0), fresnelPower);
    fresnelFactor = fresnelScale * fresnelFactor;

    vec3 finalColor = mix(color, fresnelColor, fresnelFactor);
    
    vec3 lightColor = normalize(vec3(0.8941, 0.8941, 0.8941)); // Need to get this maybe?
    float dp = 0.5 - max(0.0, dot(viewDirection, vNormal));

    vec3 diffuseLight = dp * lightColor;


    gl_FragColor = vec4(finalColor * diffuseLight, fresnelFactor * revealOpacity);
}