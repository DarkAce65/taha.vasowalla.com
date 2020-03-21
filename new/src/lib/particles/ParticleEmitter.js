import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  Float32BufferAttribute,
  Object3D,
  Points,
  ShaderMaterial,
  Math as _Math,
} from 'three';

import fragmentShader from './particle_frag.glsl';
import vertexShader from './particle_vert.glsl';

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
      vertexShader,
      fragmentShader,
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
    this.geometry.setAttribute(
      'position',
      new BufferAttribute(new Float32Array(this.particleCount * 3), 3).setUsage(DynamicDrawUsage)
    );
    this.geometry.setAttribute(
      'velocity',
      new BufferAttribute(new Float32Array(this.particleCount * 3), 3).setUsage(DynamicDrawUsage)
    );
    this.geometry.setAttribute(
      'particleColor',
      new BufferAttribute(new Float32Array(this.particleCount * 3), 3).setUsage(DynamicDrawUsage)
    );
    this.geometry.setAttribute(
      'spawnTime',
      new Float32BufferAttribute(spawnTimes, 1).setUsage(DynamicDrawUsage)
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

export default ParticleEmitter;
