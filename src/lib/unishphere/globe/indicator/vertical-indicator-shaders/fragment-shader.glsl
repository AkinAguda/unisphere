uniform float progress;
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

void main() {
    vec2 newUv = vUvs - 0.9;
    float light = 0.64 / abs(newUv.y);
    vec3 color1 = vec3(0.9882, 1.0, 0.4);
    vec3 color2 = vec3(0.4, 1.0, 0.4706);
    vec3 color3 = vec3(0.2863, 0.2784, 0.2784);
    vec3 color4 = vec3(0.1216, 0.1216, 0.1216);

    vec3 mix1 = mix(color1, color2, newUv.y) * light * (1.0 - greyscale);
    vec3 mix2 = mix(color3, color3, newUv.y) * light * greyscale;

    vec3 color = mix1 + mix2;

    float visibilityMultiplier = 1.0 - step(progress, vUvs.y);

    vec3 finalColor =  (color * mix(0.4, 1.0, vUvs.y)) * visibilityMultiplier;

    gl_FragColor = vec4(finalColor, visibilityMultiplier * 0.7);
}