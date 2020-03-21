import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';

import {
  Clock,
  Color,
  DoubleSide,
  IcosahedronGeometry,
  Mesh,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  TextureLoader,
  WebGLRenderer,
} from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';

import requestAnimationFrame from '../../lib/requestAnimationFrame';

import fireballFragmentShader from './shaders/fireball_frag.glsl';
import fireballVertexShader from './shaders/fireball_vert.glsl';

const uniforms = {
  u_time: { type: 'f', value: 0 },
  u_textureMap: { type: 't', value: null },
};

document.addEventListener('DOMContentLoaded', () => {
  UIkit.use(Icons);

  let factor = window.innerWidth < 768 ? 1.5 : 1;

  const loader = new TextureLoader();
  const clock = new Clock();
  const scene = new Scene();
  scene.background = new Color(0x222222);
  const renderer = new WebGLRenderer({ alpha: true, antialias: true });
  document.querySelector('#rendererContainer').appendChild(renderer.domElement);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  const camera = new PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 10000);
  camera.position.set(0, 0, 100 * factor);
  const controls = new TrackballControls(camera, renderer.domElement);
  camera.lookAt(scene.position);

  const material = new ShaderMaterial({
    uniforms,
    vertexShader: fireballVertexShader,
    fragmentShader: fireballFragmentShader,
    side: DoubleSide,
  });
  const objectGeometry = new IcosahedronGeometry(20, 4);
  const object = new Mesh(objectGeometry, material);
  scene.add(object);

  function render() {
    renderer.render(scene, camera);
    controls.update();

    const delta = clock.getDelta();
    uniforms.u_time.value += delta * 0.6;
    requestAnimationFrame(render);
  }

  loader.load('../../assets/textures/fireball.png', texture => {
    uniforms.u_textureMap.value = texture;
  });
  render();

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    factor = window.innerWidth < 768 ? 1.5 : 1;
  });
});
