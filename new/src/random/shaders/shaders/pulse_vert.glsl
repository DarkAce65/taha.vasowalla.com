uniform float u_time;

varying vec2 vUv;
varying vec3 vColor;
varying vec4 vWorldPosition;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vUv = uv;

  vWorldPosition = modelMatrix * vec4(position, 1.0);
  float d = fract(length(vWorldPosition.xyz - vec3(0.0, 100.0, 0.0)) / 50.0 - u_time / 10.0);
  vec2 bl = smoothstep(vec2(0.0), vec2(0.1), uv);
  vec2 tr = smoothstep(vec2(0.0), vec2(0.1), 1.0 - uv);
  vColor = vec3(d);
  d *= bl.x * bl.y * tr.x * tr.y;

  vec4 mvPosition = modelViewMatrix * vec4(position - d * 10.0 * normal, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}
