uniform float time;
uniform float size;
uniform float lifetime;

attribute float spawnTime;
attribute vec3 velocity;
attribute vec3 particleColor;

varying float vRemainingLife;
varying vec3 vParticleColor;

void main() {
  float timeAlive = time - spawnTime;
  vRemainingLife = max(0.0, lifetime - timeAlive) / lifetime;
  vParticleColor = particleColor;

  vec4 mvPosition =
      modelViewMatrix * vec4(position + velocity * timeAlive, 1.0);
  gl_PointSize = size * vRemainingLife;
  gl_Position = projectionMatrix * mvPosition;
}
