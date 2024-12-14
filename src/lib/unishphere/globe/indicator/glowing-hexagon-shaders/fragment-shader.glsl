uniform float thickness;
uniform float greyscale;

varying vec2 vUvs;
varying vec3 vPosition;

float inverseLerp(float v, float minValue, float maxValue) {
  return (v - minValue) / (maxValue - minValue);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax) {
  float t = inverseLerp(v, inMin, inMax);
  return mix(outMin, outMax, t);
}

// The MIT License
// Copyright © 2020 Inigo Quilez
float sdHexagon(vec2 p, float s, float r) 
{
    const vec3 k = vec3(-0.866025404, 0.5, 0.577350269);
    p = abs(p);
    p -= 2.0 * min(dot(k.xy, p), 0.0) * k.xy;
    p -= vec2(clamp(p.x, -k.z*s, k.z*s), s);
    return length(p) * sign(p.y) - r;
}

void main() {
    // Adjust UV to center and scale the hexagon
    vec2 centeredUv = vUvs * 2.0 - 1.0;  // Map from [0,1] to [-1,1]
    

    float aspectRatio = 1.0;
    vec2 scaledUv = centeredUv / aspectRatio;
    
    float d = sdHexagon(scaledUv, 0.8, 0.0);
    
    // Color setup
    vec2 newUv = vUvs - 0.9;
    float light = 0.64 / abs(newUv.x);
    vec3 color = (vec3(0.9882, 1.0, 0.4) * (1.0 - greyscale)) + (vec3(0.7176, 0.7176, 0.7176) * greyscale);

    vec3 col = vec3(0.0);

    float lerpVal = 1.0 - smoothstep(0.0, thickness, abs(d));

    // Mix colors based on hexagon distance
    vec3 maskCol = mix(col, color, lerpVal);

    col = maskCol;

    gl_FragColor = vec4(col, lerpVal);
}