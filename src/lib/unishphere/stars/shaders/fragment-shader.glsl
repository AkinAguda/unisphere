// Start logic is from Simon Dev's shader course - https://simondev.teachable.com/courses/1783153/lectures/45247290

uniform float time;
uniform vec2 resolution;
uniform float seed;

varying vec2 vUvs;
varying vec3 vPosition;

// The MIT License
// Copyright © 2013 Inigo Quilez
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// https://www.youtube.com/c/InigoQuilez
// https://iquilezles.org/
//
// https://www.shadertoy.com/view/Xsl3Dl
vec3 hash3( vec3 p ) // replace this by something better
{
	p = vec3( dot(p,vec3(127.1,311.7, 74.7)),
            dot(p,vec3(269.5,183.3,246.1)),
            dot(p,vec3(113.5,271.9,124.6)));

	return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

float noise( in vec3 p )
{
  vec3 i = floor( p );
  vec3 f = fract( p );
	
	vec3 u = f*f*(3.0-2.0*f);

  return mix( mix( mix( dot( hash3( i + vec3(0.0,0.0,0.0) ), f - vec3(0.0,0.0,0.0) ), 
                        dot( hash3( i + vec3(1.0,0.0,0.0) ), f - vec3(1.0,0.0,0.0) ), u.x),
                   mix( dot( hash3( i + vec3(0.0,1.0,0.0) ), f - vec3(0.0,1.0,0.0) ), 
                        dot( hash3( i + vec3(1.0,1.0,0.0) ), f - vec3(1.0,1.0,0.0) ), u.x), u.y),
              mix( mix( dot( hash3( i + vec3(0.0,0.0,1.0) ), f - vec3(0.0,0.0,1.0) ), 
                        dot( hash3( i + vec3(1.0,0.0,1.0) ), f - vec3(1.0,0.0,1.0) ), u.x),
                   mix( dot( hash3( i + vec3(0.0,1.0,1.0) ), f - vec3(0.0,1.0,1.0) ), 
                        dot( hash3( i + vec3(1.0,1.0,1.0) ), f - vec3(1.0,1.0,1.0) ), u.x), u.y), u.z );
}


vec3 generateGridStars(
    vec2 pixelCoords, float starRadius, float cellWidth,
    float starSeed) {
  vec2 cellCoords = (fract(pixelCoords / cellWidth) - 0.5) * cellWidth;
  vec2 cellID = floor(pixelCoords / cellWidth) + starSeed / 101.0;
  vec3 cellHashValue = hash3(vec3(cellID, 0.0));

  float starBrightness = clamp(cellHashValue.z, 0.0, 1.0);
  vec2 starPosition = vec2(0.0);
  starPosition += cellHashValue.xy * (cellWidth * 0.5 - starRadius * 3.0);
  float distToStar = length(cellCoords - starPosition);
  // float glow = smoothstep(starRadius + 1.0, starRadius, distToStar);
  float glow = exp(-2.0 * distToStar / starRadius);


  return vec3(glow * starBrightness);
}

vec3 generateStars(vec2 pixelCoords) {
  vec3 stars = vec3(0.0);

  float size = 4.0;
  float cellWidth = 500.0;

  for (float i = 0.0; i < 6.0; i++) {
    stars += generateGridStars(pixelCoords, size, cellWidth, i * seed);
    size *= 0.5;
    cellWidth *= 0.35;
  }

  return stars;
}

void main() {
  vec3 direction = normalize(vPosition);
    vec2 pixelCoords = (vUvs - 0.5) * resolution;

    vec3 colour = vec3(0.0);

    colour = generateStars(pixelCoords);

    gl_FragColor = vec4(colour, 1.0);
}