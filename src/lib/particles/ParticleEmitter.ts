import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  IUniform,
  MathUtils,
  Object3D,
  Points,
  ShaderMaterial,
} from 'three';

import fragmentShader from './particle_frag.glsl';
import vertexShader from './particle_vert.glsl';

interface XYZ {
  x?: number;
  y?: number;
  z?: number;
}

interface ParticleEmitterOptions {
  color?: Color | string | number;
  colorRandomness?: number;
  lifetime?: number;
  size?: number;
  count?: number;
}

class ParticleEmitter extends Object3D {
  readonly isParticleEmitter = true;

  private particleCursor: number;
  private particlesToUpdate: number;

  private readonly particleCount: number;
  private color: Color;
  private colorRandomness: number;

  private readonly uniforms: { [uniform: string]: IUniform };

  private readonly attributes: {
    readonly position: BufferAttribute;
    readonly velocity: BufferAttribute;
    readonly particleColor: BufferAttribute;
    readonly spawnTime: BufferAttribute;
  };

  private points: Points<BufferGeometry, ShaderMaterial>;

  constructor({
    color = 0xffffff,
    colorRandomness = 0.1,
    lifetime = 5,
    size = 15,
    count = 1000,
  }: ParticleEmitterOptions = {}) {
    super();

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

    const material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,
      blending: AdditiveBlending,
      depthWrite: false,
      transparent: true,
      vertexColors: true,
    });

    this.attributes = {
      position: new BufferAttribute(new Float32Array(this.particleCount * 3), 3),
      velocity: new BufferAttribute(new Float32Array(this.particleCount * 3), 3),
      particleColor: new BufferAttribute(new Float32Array(this.particleCount * 3), 3),
      spawnTime: new BufferAttribute(
        new Float32Array(this.particleCount).fill(-this.uniforms.lifetime.value),
        1
      ),
    };

    for (const attributeName in this.attributes) {
      if (Object.prototype.hasOwnProperty.call(this.attributes, attributeName)) {
        this.attributes[attributeName].setUsage(DynamicDrawUsage);
      }
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', this.attributes.position);
    geometry.setAttribute('velocity', this.attributes.velocity);
    geometry.setAttribute('particleColor', this.attributes.particleColor);
    geometry.setAttribute('spawnTime', this.attributes.spawnTime);

    this.points = new Points(geometry, material);

    this.add(this.points);
  }

  private makeParticleColorArray(): number[] {
    const { r, g, b } = this.color;

    return [r, g, b].map((v) =>
      MathUtils.clamp(v + (Math.random() - 0.5) * this.colorRandomness, 0, 1)
    );
  }

  update(timeElapsed = 0): void {
    this.uniforms.time.value = timeElapsed;

    if (this.particlesToUpdate !== 0) {
      const { position, velocity, particleColor, spawnTime } = this.attributes;

      let offset = this.particleCursor - this.particlesToUpdate;
      let count = this.particlesToUpdate;
      if (offset < 0) {
        offset = 0;
        count = this.particleCursor;
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

  emit({ x, y, z }: XYZ, { x: vx = 0, y: vy = 0, z: vz = 0 }: XYZ = {}): void {
    const { position, velocity, particleColor, spawnTime } = this.attributes;

    position.setXYZ(this.particleCursor, x, y, z);
    velocity.setXYZ(this.particleCursor, vx, vy, vz);
    (particleColor as BufferAttribute).set(
      this.makeParticleColorArray(),
      this.particleCursor * particleColor.itemSize
    );
    spawnTime.setX(this.particleCursor, this.uniforms.time.value);

    this.particlesToUpdate++;
    this.particleCursor++;
    if (this.particleCursor >= this.particleCount) {
      this.particleCursor = 0;
    }
  }
}

export default ParticleEmitter;
