attribute vec3 instanceOffset;
attribute vec3 instanceColor;
attribute vec3 instanceVelocity;
attribute float instanceSeed;
attribute float instanceStartTime;

uniform float time;

varying vec3 vColor;
varying float vAlpha;
varying float vLifetime;
    
void main() {
    float lifetime = 2.0;
    float localTime = mod(time - instanceStartTime, lifetime);
    
    vec3 displaced = instanceOffset + instanceVelocity * localTime;
    
    // Transform the position into view space
    vec4 viewPosition = modelViewMatrix * vec4(displaced, 1.0);
    
    // Calculate distance from camera
    float distanceToCamera = -viewPosition.z;
    
    vColor = instanceColor;
    vAlpha = 1.0 - smoothstep(lifetime * 0.7, lifetime, localTime);
    vLifetime = localTime / lifetime;

    // Adjust point size based on distance
    float baseSize = 10.0 * (1.0 - vLifetime);
    gl_PointSize = baseSize * (10.0 / distanceToCamera);
    
    gl_Position = projectionMatrix * viewPosition;
}