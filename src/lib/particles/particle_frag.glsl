uniform float time;
uniform float lifetime;

varying float vRemainingLifetime;
varying vec3 vParticleColor;

void main() {
  gl_FragColor = vec4(vParticleColor, vRemainingLifetime / lifetime * (0.5 - distance(gl_PointCoord, vec2(0.5))));
}
