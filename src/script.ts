import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { createNoise3D } from 'simplex-noise';
import {
  BufferGeometry,
  Color,
  DoubleSide,
  Euler,
  IcosahedronGeometry,
  Matrix4,
  Mesh,
  MeshPhongMaterial,
  PerspectiveCamera,
  PointLight,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';

import enableIcons from './lib/enableIcons';
import ParticleEmitter, { ParticleEmitterOptions } from './lib/particles/ParticleEmitter';

interface Satellite extends Mesh {
  orbitSpeed?: number;
}

document.addEventListener('DOMContentLoaded', () => {
  enableIcons({ uikit: false, faIcons: [faExternalLinkAlt] });

  setTimeout(() => document.body.classList.remove('loading'), 500);

  const noise3D = createNoise3D();

  const scene = new Scene();
  const renderer = new WebGLRenderer({ alpha: true, antialias: true });
  document.querySelector('#rendererContainer')!.appendChild(renderer.domElement);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  const camera = new PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 10000);
  setCamera();

  const lights = [];

  lights[0] = new PointLight(0xeeeefe, 2500, 300, 1.5);
  lights[0].position.set(45, 15, 105);

  lights[1] = new PointLight(0x423e6a, 1500, 1200, 2);
  lights[1].position.set(-90, 10, 120);

  lights[2] = new PointLight(0x513c1f, 1500, 300, 3);
  lights[2].position.set(40, -40, 80);

  for (let i = 0; i < lights.length; i++) {
    scene.add(lights[i]);
  }

  const planetMaterial = new MeshPhongMaterial({
    shininess: 30,
    color: 0x526464,
    side: DoubleSide,
    flatShading: true,
  });
  const planetGeometry = new IcosahedronGeometry(50, 6);
  const planetVertices = planetGeometry.attributes.position;
  for (let i = 0; i < planetVertices.count; i++) {
    const vertex = new Vector3(
      planetVertices.getX(i),
      planetVertices.getY(i),
      planetVertices.getZ(i),
    );
    const dv = vertex.clone().setLength(10);
    const jitter = Math.abs(noise3D(dv.x, dv.y, dv.z));
    vertex.x += jitter * 9 - 3;
    vertex.z += jitter * 9 - 3;
    dv.setLength(50);
    const noise = Math.abs(noise3D(dv.x, dv.y, dv.z));
    if (noise > 0.6) {
      vertex.setLength(45 + noise * 10);
    } else {
      vertex.setLength(49 + noise * 3);
    }

    planetVertices.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }
  const planet = new Mesh(planetGeometry, planetMaterial);
  scene.add(planet);

  const numSatellites = 100;
  const satelliteMaterial = planetMaterial.clone();
  const cometMaterial = satelliteMaterial.clone();
  const currentHour = new Date().getHours();
  cometMaterial.emissive = new Color(currentHour < 8 || 18 <= currentHour ? 0x3e5af8 : 0xf85a3e);

  let satelliteScale = Math.min(window.innerWidth, window.innerHeight) < 500 ? 1.5 : 1;
  const satellites: Satellite[] = [];
  for (let i = 0; i < numSatellites; i++) {
    const satelliteRadius = i === 0 ? 1 : Math.max(1, Math.pow(Math.random() + 0.2, 2) * 2.5);
    const satelliteGeometry = new IcosahedronGeometry(
      satelliteRadius,
      satelliteRadius > 2.5 ? 1 : 0,
    );
    if (satelliteRadius > 2.5) {
      displaceSatelliteGeometry(satelliteGeometry);
    }

    const orbitRadius = 80 + Math.random() * 30;
    const angle = (i / numSatellites) * 2 * Math.PI + Math.PI;
    const c = orbitRadius * Math.cos(angle);
    const s = orbitRadius * Math.sin(angle);
    const h = Math.random() * 30 - 15;
    satelliteGeometry.applyMatrix4(
      new Matrix4().makeRotationFromEuler(
        new Euler(Math.random(), Math.random(), Math.random(), 'XYZ'),
      ),
    );

    const satellite: Satellite = new Mesh(
      satelliteGeometry,
      i === 0 ? cometMaterial : satelliteMaterial,
    );
    satellite.position.set(c, s, h);
    satellite.scale.setScalar(satelliteScale);
    satellite.orbitSpeed = 0.08 / satelliteRadius;

    if (i === 0) {
      satellite.orbitSpeed *= 3;
      satellite.add(new PointLight(cometMaterial.emissive, 1000, orbitRadius * 1.5, 2));
    }

    scene.add(satellite);
    satellites.push(satellite);
  }

  const emitterOptions: ParticleEmitterOptions = {
    color: cometMaterial.emissive,
    size: 15 * (window.devicePixelRatio || 1),
  };
  if (window.innerWidth < 640) {
    emitterOptions.count = 100;
    emitterOptions.lifetime = 2.5;
  }
  const emitter = new ParticleEmitter(emitterOptions);
  scene.add(emitter);

  let elapsedTime = 0;
  function render(): void {
    requestAnimationFrame(render);
    renderer.render(scene, camera);

    const delta = 1 / 60;
    elapsedTime += delta;
    planet.rotation.z += delta / 25;
    for (let i = 0; i < satellites.length; i++) {
      satellites[i].position.applyAxisAngle(
        new Vector3(0, 0, 1),
        satellites[i].orbitSpeed! * delta,
      );
    }

    const pos = satellites[0].position;
    emitter.emit(pos, { x: pos.y / 10, y: -pos.x / 10 });
    emitter.update(elapsedTime);
  }

  function displaceSatelliteGeometry<G extends BufferGeometry>(satelliteGeometry: G): void {
    const vertices = satelliteGeometry.attributes.position;

    for (let i = 0; i < vertices.count; i++) {
      const vertex = new Vector3(vertices.getX(i), vertices.getY(i), vertices.getZ(i));

      const dv = vertex.clone().setLength(0.4);
      vertex.setLength(3 + Math.abs(noise3D(dv.x, dv.y, dv.z)) * 2);

      vertices.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
  }

  function setCamera(): void {
    const ratio = window.innerWidth / window.innerHeight < 1 ? 1.4 : 1;

    camera.position.set(50 * ratio, -300 * ratio, 100 * ratio);
    camera.lookAt(scene.position);
  }

  render();

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    setCamera();

    const newScale = Math.min(window.innerWidth, window.innerHeight) < 500 ? 1.5 : 1;
    if (satelliteScale !== newScale) {
      satelliteScale = newScale;
      satellites.forEach((satellite) => satellite.scale.setScalar(newScale));
    }
  });

  const secondaryMenuElement = document.querySelector<HTMLDivElement>('#secondary')!;
  let activeMenuElement: HTMLElement | null = null;
  let collapseAnimationFrameId: number | null = null;

  const resetHeight = (): void => {
    secondaryMenuElement.removeEventListener('transitionend', resetHeight);
    secondaryMenuElement.style.removeProperty('height');
  };

  const toggleSubmenu = (menuElement: HTMLElement): void => {
    if (collapseAnimationFrameId !== null) {
      return;
    }

    const targetSubmenuElement = document.querySelector(menuElement.dataset.menu!)!;
    const previousSubmenuElement =
      activeMenuElement && document.querySelector(activeMenuElement.dataset.menu!)!;

    if (activeMenuElement && menuElement.isSameNode(activeMenuElement)) {
      // Close submenu
      collapseAnimationFrameId = requestAnimationFrame(() => {
        secondaryMenuElement.style.height = `${targetSubmenuElement.scrollHeight}px`;
        secondaryMenuElement.classList.add('closed');
        menuElement.classList.remove('active');
        previousSubmenuElement!.classList.remove('active');
        activeMenuElement = null;

        collapseAnimationFrameId = requestAnimationFrame(() => {
          secondaryMenuElement.style.removeProperty('height');
          collapseAnimationFrameId = null;
        });
      });
    } else {
      // Open submenu
      const previousMenuElement = activeMenuElement;
      if (previousMenuElement) {
        // Close previous menu
        secondaryMenuElement.style.height = `${previousSubmenuElement!.scrollHeight}px`;
        previousMenuElement.classList.remove('active');
        previousSubmenuElement!.classList.remove('active');
      }
      activeMenuElement = menuElement;
      menuElement.classList.add('active');
      targetSubmenuElement.classList.add('active');

      if (secondaryMenuElement.clientHeight === targetSubmenuElement.scrollHeight) {
        secondaryMenuElement.style.removeProperty('height');
      } else {
        collapseAnimationFrameId = requestAnimationFrame(() => {
          secondaryMenuElement.addEventListener('transitionend', resetHeight);

          secondaryMenuElement.style.height = `${targetSubmenuElement.scrollHeight}px`;

          if (previousMenuElement === null) {
            secondaryMenuElement.classList.remove('closed');
          }

          collapseAnimationFrameId = null;
        });
      }
    }
  };

  document.querySelectorAll<HTMLElement>('#primary .menu-item').forEach((menuElement) => {
    if (menuElement.dataset.menu) {
      const span = menuElement.querySelector('span')!;
      span.addEventListener('click', () => toggleSubmenu(menuElement));
      span.addEventListener(
        'keydown',
        (e) => [' ', 'Enter'].indexOf(e.key) !== -1 && toggleSubmenu(menuElement),
      );
    }
  });
});
