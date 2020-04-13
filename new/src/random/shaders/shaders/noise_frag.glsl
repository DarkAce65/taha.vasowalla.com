uniform float u_time;
uniform vec2 u_resolution;

varying vec2 vUv;
varying vec3 noise;

void main() {
  vec2 st = vUv * 5.0;

  gl_FragColor = vec4(noise, 1.0);
}
