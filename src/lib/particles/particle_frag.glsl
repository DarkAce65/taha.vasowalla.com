uniform float time;
uniform float lifetime;

varying float vRemainingLife;
varying vec3 vParticleColor;

void main() {
  float alpha = vRemainingLife * (0.5 - distance(gl_PointCoord, vec2(0.5)));
  gl_FragColor = vec4(vParticleColor, alpha);
}
