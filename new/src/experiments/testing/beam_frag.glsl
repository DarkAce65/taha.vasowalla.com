uniform float u_time;
uniform float u_intensity;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vec3 color = vec3(1.0, 1.0, 0.7);

  float vDotN = dot(normalize(vViewPosition), vNormal);
  float opacity = pow(max(0.0, vDotN), 2.0) + 0.05;
  opacity = mix(0.0, opacity, vUv.y) * u_intensity;
  gl_FragColor = vec4(color, opacity * 2.5);
}
