uniform float u_time;
uniform sampler2D u_textureMap; // chroma.scale(["black", "maroon", "darkorange", "yellow", "white"]).domain([0, 0.1, 0.8, 0.9, 1]);

varying vec2 vUv;
varying float noise;

void main() {
  vec2 texturePosition = vec2(0.0, noise + 0.1);
  vec4 color = texture2D(u_textureMap, texturePosition);
  gl_FragColor = color;
}
