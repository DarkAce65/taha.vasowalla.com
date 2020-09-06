import SimplexNoise from 'simplex-noise';
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

import ParticleEmitter, { ParticleEmitterOptions } from '~/lib/particles/ParticleEmitter';

interface Satellite extends Mesh {
  orbitSpeed?: number;
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => document.body.classList.remove('loading'), 500);

  const simplex = new SimplexNoise();

  const scene = new Scene();
  const renderer = new WebGLRenderer({ alpha: true, antialias: true });
  document.querySelector('#rendererContainer').appendChild(renderer.domElement);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  const camera = new PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 10000);
  setCamera();

  const lights = [];

  lights[0] = new PointLight(0xeeeefe, 2, 300, 1.5);
  lights[0].position.set(45, 15, 105);

  lights[1] = new PointLight(0x423e6a, 1, 1200, 2);
  lights[1].position.set(-90, 10, 120);

  lights[2] = new PointLight(0x513c1f, 1, 300, 3);
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
  const planetGeometry = new IcosahedronGeometry(50, 3);
  for (let i = 0; i < planetGeometry.vertices.length; i++) {
    planetGeometry.vertices[i].x += Math.random() * 6 - 3;
    planetGeometry.vertices[i].y += Math.random() * 6 - 3;
    if (Math.random() < 0.1) {
      planetGeometry.vertices[i].setLength(45 + Math.random() * 10);
    } else {
      planetGeometry.vertices[i].setLength(49 + Math.random() * 2);
    }
  }
  const planet = new Mesh(new BufferGeometry().fromGeometry(planetGeometry), planetMaterial);
  scene.add(planet);

  const emitterOptions: ParticleEmitterOptions = {
    color: 0xf85a3e,
    size: 12 * (window.devicePixelRatio || 1),
  };
  if (window.innerWidth < 640) {
    emitterOptions.count = 100;
    emitterOptions.lifetime = 2.5;
  }
  const emitter = new ParticleEmitter(emitterOptions);
  scene.add(emitter);

  const numSatellites = 100;
  const satelliteMaterial = planetMaterial.clone();
  const cometMaterial = satelliteMaterial.clone();
  cometMaterial.emissive = new Color(emitterOptions.color);

  let satelliteScale = Math.min(window.innerWidth, window.innerHeight) < 500 ? 1.5 : 1;
  const satellites: Satellite[] = [];
  for (let i = 0; i < numSatellites; i++) {
    const satelliteRadius = i === 0 ? 1 : Math.max(1, Math.pow(Math.random() + 0.2, 2) * 2.5);
    const satelliteGeometry = new IcosahedronGeometry(
      satelliteRadius,
      satelliteRadius > 2.5 ? 1 : 0
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
        new Euler(Math.random(), Math.random(), Math.random(), 'XYZ')
      )
    );

    const satellite: Satellite = new Mesh(
      new BufferGeometry().fromGeometry(satelliteGeometry),
      i === 0 ? cometMaterial : satelliteMaterial
    );
    satellite.position.set(c, s, h);
    satellite.scale.setScalar(satelliteScale);
    satellite.orbitSpeed = 0.08 / satelliteRadius;

    if (i === 0) {
      satellite.orbitSpeed *= 3;
      satellite.add(new PointLight(0xf85a3e, 1, orbitRadius * 1.5, 2));
    }

    scene.add(satellite);
    satellites.push(satellite);
  }

  let elapsedTime = 0;
  function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);

    const delta = 1 / 60;
    elapsedTime += delta;
    planet.rotation.z += delta / 25;
    for (let i = 0; i < satellites.length; i++) {
      satellites[i].position.applyAxisAngle(new Vector3(0, 0, 1), satellites[i].orbitSpeed * delta);
    }

    const pos = satellites[0].position;
    emitter.emit(pos, { x: pos.y / 10, y: -pos.x / 10 });
    emitter.update(elapsedTime);
  }

  function displaceSatelliteGeometry(satelliteGeometry) {
    for (let i = 0; i < satelliteGeometry.vertices.length; i++) {
      const v = satelliteGeometry.vertices[i].clone().setLength(0.4);
      satelliteGeometry.vertices[i].setLength(3 + Math.abs(simplex.noise3D(v.x, v.y, v.z)) * 2);
    }
  }

  function setCamera() {
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

  let activeMenuElement = null;
  const toggleSubmenu = (menuElement) => {
    if (menuElement.isSameNode(activeMenuElement)) {
      menuElement.classList.remove('active');
      document.querySelector('#secondary').classList.add('closed');
      document.querySelectorAll('.submenu.active').forEach((el) => el.classList.remove('active'));
      activeMenuElement = null;
      return;
    }

    if (activeMenuElement === null) {
      document.querySelector('#secondary').classList.remove('closed');
    } else {
      activeMenuElement.classList.remove('active');
      document.querySelector(activeMenuElement.dataset.menu).classList.remove('active');
    }
    activeMenuElement = menuElement;
    menuElement.classList.add('active');
    document.querySelector(menuElement.dataset.menu).classList.add('active');
  };

  document.querySelectorAll<HTMLElement>('#primary .menu-item').forEach((menuElement) => {
    if (menuElement.dataset.menu) {
      const span = menuElement.querySelector('span');
      span.addEventListener('click', () => toggleSubmenu(menuElement));
      span.addEventListener(
        'keydown',
        (e) => [' ', 'Enter'].indexOf(e.key) !== -1 && toggleSubmenu(menuElement)
      );
    }
  });
});
