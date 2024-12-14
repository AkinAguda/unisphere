varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vLightDirection;

uniform vec3 directionalLight;

void main() {

    vNormal = normalize(normalMatrix * normal);
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    
    vec4 viewLightPos = viewMatrix * vec4(directionalLight, 1.0);
    vLightDirection = normalize(viewLightPos.xyz - mvPosition.xyz);

    gl_Position = projectionMatrix * mvPosition;
}