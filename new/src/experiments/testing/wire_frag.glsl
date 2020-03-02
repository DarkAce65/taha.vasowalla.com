uniform float u_time;

varying vec2 vUv;
varying vec3 noise;

void main() {
  vec3 color = vec3(0.7, 0.9, 1.0);
  gl_FragColor = vec4(color, 0.1);
}
