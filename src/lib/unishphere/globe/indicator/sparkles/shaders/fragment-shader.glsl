varying vec3 vColor;
varying float vAlpha;
varying float vLifetime;
    
void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    float alphaShape = 1.0 - smoothstep(0.0, 0.5, dist);
    gl_FragColor = vec4(vec3(0.9216, 0.9216, 0.7882), alphaShape * vAlpha);
}