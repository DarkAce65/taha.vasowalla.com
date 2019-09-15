import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';
import {
  BackSide,
  BoxGeometry,
  Clock,
  Color,
  DoubleSide,
  FrontSide,
  Mesh,
  Object3D,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import TweenLite, { Power2 } from 'gsap/TweenLite';
import requestAnimationFrame from '../../lib/requestAnimationFrame';

import {
  matrixFragmentShader,
  noiseFragmentShader,
  noiseVertexShader,
  pulseFragmentShader,
  pulseVertexShader,
  staticVertexShader,
  transparentFragmentShader,
} from './shaders';

const uniforms = {
  u_time: { type: 'f', value: 0 },
  u_resolution: { type: 'v2', value: new Vector2() },
  u_rows: { type: 'f', value: window.innerWidth < 768 ? 20 : 40 },
  u_speed: { type: 'f', value: 4 },
};

document.addEventListener('DOMContentLoaded', () => {
  UIkit.use(Icons);

  let factor = window.innerWidth < 768 ? 1.5 : 1;

  const clock = new Clock();
  const scene = new Scene();
  scene.background = new Color(0x000000);
  const renderer = new WebGLRenderer({ alpha: true, antialias: true });
  document.querySelector('#rendererContainer').appendChild(renderer.domElement);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;

  const camera = new PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 10000);
  camera.position.set(0, 0, 100);
  const controls = new TrackballControls(camera, renderer.domElement);
  camera.lookAt(scene.position);

  const cubes = {};
  const cubeGeometry = new BoxGeometry(70, 70, 70);

  let material = new ShaderMaterial({
    uniforms,
    vertexShader: noiseVertexShader,
    fragmentShader: noiseFragmentShader,
  });
  material.side = DoubleSide;
  cubes['Noise'] = new Mesh(new BoxGeometry(70, 70, 70, 70, 70, 70), material);

  material = new ShaderMaterial({
    uniforms,
    vertexShader: pulseVertexShader,
    fragmentShader: pulseFragmentShader,
  });
  material.transparent = true;
  material.side = DoubleSide;
  cubes['Pulse'] = new Mesh(new BoxGeometry(70, 70, 70, 70, 70, 70), material);

  material = new ShaderMaterial({
    uniforms,
    vertexShader: staticVertexShader,
    fragmentShader: matrixFragmentShader,
  });
  material.side = DoubleSide;
  cubes['Matrix'] = new Mesh(cubeGeometry, material);

  material = new ShaderMaterial({
    uniforms,
    vertexShader: staticVertexShader,
    fragmentShader: transparentFragmentShader,
  });
  material.side = FrontSide;
  material.transparent = true;
  const mesh = new Mesh(cubeGeometry, material);
  mesh.renderOrder = 2;

  material = new ShaderMaterial({
    uniforms,
    vertexShader: staticVertexShader,
    fragmentShader: transparentFragmentShader,
  });
  material.side = BackSide;
  material.transparent = true;
  const transparentCube = new Object3D();
  transparentCube.add(new Mesh(cubeGeometry, material));
  transparentCube.add(mesh);
  cubes['Transparent'] = transparentCube;

  const viewportBounds = { maxX: 0, maxY: 0 };
  const cubeKeys = Object.keys(cubes);
  cubeKeys.forEach((key, index) => {
    const angle = (2 * Math.PI * index) / cubeKeys.length;
    const c = 100 * Math.cos(angle);
    const s = 100 * Math.sin(angle);
    cubes[key].position.set(c, s, 0);
    viewportBounds.maxX = Math.max(viewportBounds.maxX, Math.abs(c));
    viewportBounds.maxY = Math.max(viewportBounds.maxY, Math.abs(s));
    scene.add(cubes[key]);
    document
      .querySelector('#cubeDropdown')
      .insertAdjacentHTML(
        'beforeend',
        `<li><a id="${key}" class="view" href="javascript:void(0)">${key} Cube</a></li>`
      );
  });
  document.querySelectorAll('.view').forEach(view =>
    view.addEventListener('click', e => {
      setCamera(e.target.id);
    })
  );
  viewportBounds.maxX += 50;
  viewportBounds.maxY += 50;

  const setCamera = position => {
    let x = 0;
    let y = 0;
    let z = 0;
    let uy = 0;
    let uz = 0;
    let tx = 0;
    let ty = 0;
    const tz = 0;

    if (cubeKeys.indexOf(position) !== -1) {
      tx = cubes[position].position.x;
      ty = cubes[position].position.y;
      x = tx + 100 * (Math.abs(tx) < 0.001 ? 0 : Math.sign(tx));
      y = ty - 180;
      z = 100;
      uz = 1;
    } else {
      x = 0;
      y = 0;
      uy = 1;
      if (viewportBounds.maxY / viewportBounds.maxX < camera.aspect) {
        z = viewportBounds.maxY / Math.tan((camera.fov * Math.PI) / 360);
      } else {
        z = viewportBounds.maxX / Math.tan((camera.fov * Math.PI) / 360) / camera.aspect;
      }
      z += 70 / 2;
      z /= factor;
    }

    x *= factor;
    y *= factor;
    z *= factor;

    TweenLite.to(camera.position, 2, { x: x, y: y, z: z, ease: Power2.easeInOut });
    TweenLite.to(controls.target, 2, {
      x: tx,
      y: ty,
      z: tz,
      ease: Power2.easeOut,
      onUpdate() {
        camera.lookAt(controls.target);
      },
    });
    TweenLite.to(camera.up, 1.75, { x: 0, y: uy, z: uz });
  };

  const render = () => {
    renderer.render(scene, camera);
    controls.update();
    uniforms.u_time.value += clock.getDelta() * 3;
    requestAnimationFrame(render);
  };

  render();
  setCamera('Overview');

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    factor = 1;
    uniforms.u_rows.value = 40;
    if (window.innerWidth < 768) {
      factor = 1.5;
      uniforms.u_rows.value = 20;
    }
  });
});
