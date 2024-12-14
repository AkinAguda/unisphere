varying vec2 vUvs;
uniform sampler2D earthSpecularMap;

// 1 if Water, 0 if land
float detmineIfWaterOrLand(vec4 texColor) {
    float threshold = 0.1;
    return step(threshold, texColor.x) * step(threshold, texColor.y) * step(threshold, texColor.z);
}

void main() {
    vec4 darkestWaterColor = vec4(0.0, 0.0, 0.0, 1.0);
    vec4 darkestLandColor = vec4(0.1333, 0.1333, 0.1333, 1.0);
    vec4 texColor = texture2D(earthSpecularMap, vUvs);
    vec4 color = vec4(0.0);

    float waterOrLand = detmineIfWaterOrLand(texColor);

    color += waterOrLand * darkestWaterColor; // Color the Water

    color += (1.0 - waterOrLand) * darkestLandColor; // Color the land

    gl_FragColor = color;
}