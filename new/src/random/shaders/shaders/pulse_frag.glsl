uniform float u_time;
uniform vec2 u_resolution;

varying vec2 vUv;
varying vec3 vColor;
varying vec4 vWorldPosition;

void main() {
  vec2 st = vUv;

  vec3 color = vColor;
  float opacity = 1.0;
  gl_FragColor = vec4(color, opacity);
}
