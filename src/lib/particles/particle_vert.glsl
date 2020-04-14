uniform float time;
uniform float size;
uniform float lifetime;

attribute float spawnTime;
attribute vec3 velocity;
attribute vec3 particleColor;

varying float vRemainingLifetime;
varying vec3 vParticleColor;

float rand(float n) {
  return fract(sin(n) * 43758.5453123);
}

void main() {
  vRemainingLifetime = max(0.0, spawnTime + lifetime - time);
  vParticleColor = particleColor;

  vec4 mvPosition = modelViewMatrix * vec4(position + velocity * (time - spawnTime), 1.0);
  gl_PointSize = size * (spawnTime + lifetime - time) / lifetime;
  gl_Position = projectionMatrix * mvPosition;
}
