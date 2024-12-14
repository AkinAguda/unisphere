varying vec2 vUvs;

void main() {
    vUvs = uv;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    
    gl_Position = projectionMatrix * mvPosition;
}