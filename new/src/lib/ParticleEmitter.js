import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
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

    'varying float remainingLifetime;',

    'void main() {',
    '  remainingLifetime = max(0.0, spawnTime + lifetime - time);',

    '  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);',
    '  gl_PointSize = size * (spawnTime + lifetime - time) / lifetime;',
    '  gl_Position = projectionMatrix * mvPosition;',
    '}',
  ].join('\n'),
  fragmentShader: [
    'uniform vec3 particleColor;',
    'uniform float lifetime;',

    'varying float remainingLifetime;',

    'void main() {',
    '  gl_FragColor = vec4(particleColor * (0.5 - distance(gl_PointCoord, vec2(0.5))), remainingLifetime / lifetime);',
    '}',
  ].join('\n'),
};

class ParticleEmitter extends Object3D {
  constructor({ color = 0xffffff, lifetime = 5, size = 15, count = 1000 }) {
    super();

    this.isParticleEmitter = true;

    this.particleCursor = 0;
    this.particlesToUpdate = 0;
    this.particleCount = count;
    this.uniforms = {
      time: { value: 0 },
      particleColor: { value: new Color(color) },
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
      'spawnTime',
      new Float32BufferAttribute(spawnTimes, 1).setDynamic(true)
    );

    this.points = new Points(this.geometry, this.material);

    this.add(this.points);
  }

  update(timeElapsed = 0) {
    this.uniforms.time.value = timeElapsed;

    if (this.particlesToUpdate !== 0) {
      const { position, spawnTime } = this.geometry.attributes;

      let offset = this.particleCursor - this.particlesToUpdate;
      let count = this.particlesToUpdate;
      if (offset < 0) {
        offset = 0;
        count = -1;
      }

      position.updateRange.offset = offset * position.itemSize;
      position.updateRange.count = count * position.itemSize;
      spawnTime.updateRange.offset = offset * spawnTime.itemSize;
      spawnTime.updateRange.count = count * spawnTime.itemSize;

      position.needsUpdate = true;
      spawnTime.needsUpdate = true;
      this.particlesToUpdate = 0;
    }
  }

  emit({ x, y, z }) {
    const { position, spawnTime } = this.geometry.attributes;

    position.array[this.particleCursor * 3] = x;
    position.array[this.particleCursor * 3 + 1] = y;
    position.array[this.particleCursor * 3 + 2] = z;
    spawnTime.array[this.particleCursor] = this.uniforms.time.value;

    this.particlesToUpdate++;
    this.particleCursor++;
    if (this.particleCursor >= this.particleCount) {
      this.particleCursor = 0;
    }
  }
}

export { ParticleEmitter };
