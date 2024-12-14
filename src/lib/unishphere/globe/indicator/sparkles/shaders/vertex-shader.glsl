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

    vColor = instanceColor;
    
    vAlpha = 1.0 - smoothstep(lifetime * 0.7, lifetime, localTime);

    vLifetime = localTime / lifetime;

    gl_PointSize = 10.0 * (1.0 - vLifetime);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}