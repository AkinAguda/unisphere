uniform float progress;
uniform float erase; // 1 means erase and 0 means don't

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
  vec3 baseColor1 = vec3(0.7569, 0.8275, 0.2314);
  vec3 baseColor2 = vec3(0.2941, 0.2784, 0.7608);

  vec3 baseColor = mix(baseColor2, baseColor1, vUvs.x);


  vec2 newUv = vUvs - 0.9;
  float light = 0.14 / abs(newUv.y);
  vec3 color1 = baseColor * light;

  newUv = vUvs - 0.2;
  light = 0.14 / abs(newUv.y);
  vec3 color2 = baseColor * light;

  vec3 finalColor = color1 + color2;

  float progressVisibility = (1.0 - step(progress, vUvs.x)) * (1.0 - erase);
  progressVisibility += (1.0 - step(vUvs.x, progress)) * erase;

  finalColor *= progressVisibility;

  gl_FragColor = vec4(finalColor, progressVisibility * 0.7);
}