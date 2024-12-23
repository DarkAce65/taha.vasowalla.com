// Author @patriciogv - 2015
// http://patriciogonzalezvivo.com

uniform float u_time;
uniform float u_speed;
uniform float u_rows;

varying vec2 vUv;

float random(in float x) {
  return fract(sin(x) * 43758.5453);
}

float random(in vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float randomChar(in vec2 outer, in vec2 inner) {
  vec2 margin = vec2(0.2, 0.05);
  float seed = 23.0;
  vec2 borders = step(margin, inner) * step(margin, 1.0 - inner);
  return step(0.5, random(outer * seed + floor(inner * 3.0))) * borders.x * borders.y;
}

vec3 matrix(in vec2 st) {
  vec2 ipos = floor(st * u_rows) + vec2(1.0, 0);

  ipos += vec2(0, floor(u_time * u_speed * random(ipos.x)));

  vec2 fpos = fract(st * u_rows);
  vec2 center = 0.5 - fpos;

  float pct = random(ipos);
  float glowamount = (1.0 - dot(center, center) * 3.0);

  return vec3(randomChar(ipos, fpos) * pct * glowamount) * vec3(0, 1.0, 0);
}

void main() {
  gl_FragColor = vec4(matrix(vUv), 1.0);
}
