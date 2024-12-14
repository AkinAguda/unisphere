varying vec2 vUvs;
varying vec3 vPosition;

void main() {
    vUvs = uv;
    vPosition = position;
    vec4 localPosition = vec4(position, 1.0);

    gl_Position = projectionMatrix * modelViewMatrix * localPosition;
}