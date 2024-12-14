uniform float time;
uniform float ringRadius;
uniform float ringThickness;

varying vec2 vUv;

float ringSdf(vec2 p, float radius, float thickness) {
    float d = length(p) - radius;
    return abs(d) - thickness;
}

void main() {
    vec2 centeredUv = (vUv - 0.5) * 2.0;
    
    float radius = mix(0.0, ringRadius, time);
    
    float sdf = ringSdf(centeredUv, radius, ringThickness);
    
    float ring = 1.0 - smoothstep(0.0, 0.01, sdf);

    ring *= 1.0 - time;
    
    gl_FragColor = vec4(vec3(0.8902, 0.9176, 0.7608), ring);
}