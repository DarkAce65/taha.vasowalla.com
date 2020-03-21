uniform float u_time;
uniform vec2 u_resolution;

varying vec2 vUv;

mat3 yuv2rgb = mat3(1.0, 0.0, 1.13983, 1.0, -0.39465, -0.58060, 1.0, 2.03211, 0.0);

void main() {
  vec2 st = vUv * 2.0 - 1.0;
  vec3 color = vec3(0.0);

  color = yuv2rgb * vec3(0.5, st.x, st.y);

  gl_FragColor = vec4(color, smoothstep(0.2, 0.8, distance(vec2(st.x, st.y), vec2(0.0))));
}
