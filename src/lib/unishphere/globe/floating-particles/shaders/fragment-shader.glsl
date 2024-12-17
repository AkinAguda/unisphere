float circleSDF(vec2 p, float radius) {
    return length(p) - radius;
}

void main() {
    vec2 uv = gl_PointCoord - 0.5;

    float sdf = circleSDF(uv, 0.5);

    float circle = 1.0 - step(0.0, sdf);
    
    gl_FragColor = vec4(vec3(0.3412, 0.9608, 0.3922), circle);
}