import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Math as _Math,
  Object3D,
  Points,
  ShaderMaterial,
} from 'three';

const ParticleShader = {
  vertexShader: [
    'uniform float time;',
    'uniform float size;',
    'uniform float lifetime;',

    'attribute float spawnTime;',
    'attribute vec3 velocity;',
    'attribute vec3 particleColor;',

    'varying float vRemainingLifetime;',
    'varying vec3 vParticleColor;',

    'float rand(float n) {',
    '  return fract(sin(n) * 43758.5453123);',
    '}',

    'void main() {',
    '  vRemainingLifetime = max(0.0, spawnTime + lifetime - time);',
    '  vParticleColor = particleColor;',

    '  vec4 mvPosition = modelViewMatrix * vec4(position + velocity * (time - spawnTime), 1.0);',
    '  gl_PointSize = size * (spawnTime + lifetime - time) / lifetime;',
    '  gl_Position = projectionMatrix * mvPosition;',
    '}',
  ].join('\n'),
  fragmentShader: [
    'uniform float lifetime;',

    'varying float vRemainingLifetime;',
    'varying vec3 vParticleColor;',

    'void main() {',
    '  gl_FragColor = vec4(vParticleColor, vRemainingLifetime / lifetime * (0.5 - distance(gl_PointCoord, vec2(0.5))));',
    '}',
  ].join('\n'),
};

class ParticleEmitter extends Object3D {
  constructor({ color = 0xffffff, colorRandomness = 0.1, lifetime = 5, size = 15, count = 1000 }) {
    super();

    this.isParticleEmitter = true;

    this.particleCursor = 0;
    this.particlesToUpdate = 0;
    this.particleCount = count;

    this.color = new Color(color);
    this.colorRandomness = colorRandomness;
    this.uniforms = {
      time: { value: 0 },
      size: { value: size * (window.devicePixelRatio || 1) },
      lifetime: { value: lifetime },
    };

    this.material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: ParticleShader.vertexShader,
      fragmentShader: ParticleShader.fragmentShader,
      blending: AdditiveBlending,
      depthWrite: false,
      transparent: true,
      vertexColors: true,
    });

    const spawnTimes = [];
    for (let i = 0; i < this.particleCount; i++) {
      spawnTimes.push(-this.uniforms.lifetime.value);
    }

    this.geometry = new BufferGeometry();
    this.geometry.addAttribute(
      'position',
      new BufferAttribute(new Float32Array(this.particleCount * 3), 3).setDynamic(true)
    );
    this.geometry.addAttribute(
      'velocity',
      new BufferAttribute(new Float32Array(this.particleCount * 3), 3).setDynamic(true)
    );
    this.geometry.addAttribute(
      'particleColor',
      new BufferAttribute(new Float32Array(this.particleCount * 3), 3).setDynamic(true)
    );
    this.geometry.addAttribute(
      'spawnTime',
      new Float32BufferAttribute(spawnTimes, 1).setDynamic(true)
    );

    this.points = new Points(this.geometry, this.material);

    this.add(this.points);
  }

  makeParticleColorArray() {
    const { r, g, b } = this.color;

    return [r, g, b].map(v => _Math.clamp(v + (Math.random() - 0.5) * this.colorRandomness, 0, 1));
  }

  update(timeElapsed = 0) {
    this.uniforms.time.value = timeElapsed;

    if (this.particlesToUpdate !== 0) {
      const { position, velocity, particleColor, spawnTime } = this.geometry.attributes;

      let offset = this.particleCursor - this.particlesToUpdate;
      let count = this.particlesToUpdate;
      if (offset < 0) {
        offset = 0;
        count = -1;
      }

      position.updateRange.offset = offset * position.itemSize;
      position.updateRange.count = count * position.itemSize;
      velocity.updateRange.offset = offset * velocity.itemSize;
      velocity.updateRange.count = count * velocity.itemSize;
      particleColor.updateRange.offset = offset * particleColor.itemSize;
      particleColor.updateRange.count = count * particleColor.itemSize;
      spawnTime.updateRange.offset = offset * spawnTime.itemSize;
      spawnTime.updateRange.count = count * spawnTime.itemSize;

      position.needsUpdate = true;
      velocity.needsUpdate = true;
      particleColor.needsUpdate = true;
      spawnTime.needsUpdate = true;
      this.particlesToUpdate = 0;
    }
  }

  emit({ x, y, z }, { x: vx = 0, y: vy = 0, z: vz = 0 } = {}) {
    const { position, velocity, particleColor, spawnTime } = this.geometry.attributes;

    position.array[this.particleCursor * 3] = x;
    position.array[this.particleCursor * 3 + 1] = y;
    position.array[this.particleCursor * 3 + 2] = z;
    velocity.array[this.particleCursor * 3] = vx;
    velocity.array[this.particleCursor * 3 + 1] = vy;
    velocity.array[this.particleCursor * 3 + 2] = vz;
    particleColor.array.set(
      this.makeParticleColorArray(),
      this.particleCursor * particleColor.itemSize
    );
    spawnTime.array[this.particleCursor] = this.uniforms.time.value;

    this.particlesToUpdate++;
    this.particleCursor++;
    if (this.particleCursor >= this.particleCount) {
      this.particleCursor = 0;
    }
  }
}

export { ParticleEmitter };
