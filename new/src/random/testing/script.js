import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';

import gsap from 'gsap';
import {
  AmbientLight,
  BoxBufferGeometry,
  Clock,
  Color,
  ConeGeometry,
  CubeCamera,
  CylinderBufferGeometry,
  CylinderGeometry,
  DoubleSide,
  EdgesGeometry,
  IcosahedronBufferGeometry,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshPhongMaterial,
  Object3D,
  ParametricBufferGeometry,
  PerspectiveCamera,
  PlaneBufferGeometry,
  PlaneGeometry,
  PointLight,
  Scene,
  ShaderLib,
  ShaderMaterial,
  SpotLight,
  UniformsLib,
  UniformsUtils,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import requestAnimationFrame from '../../lib/requestAnimationFrame';

import beamFragmentShader from './beam_frag.glsl';
import beamVertexShader from './beam_vert.glsl';
import waveVertexShader from './wave_vert.glsl';

document.addEventListener('DOMContentLoaded', () => {
  UIkit.use(Icons);

  let lighthouseOn = false;

  const clock = new Clock();
  const scene = new Scene();
  const renderer = new WebGLRenderer({ alpha: true, antialias: true });
  document.querySelector('#rendererContainer').appendChild(renderer.domElement);

  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);

  const camera = new PerspectiveCamera(35, width / height, 0.1, 10000);
  camera.position.set(70, 60, 190);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.2;
  camera.lookAt(scene.position);

  const ambient = new AmbientLight(0x555555);
  scene.add(ambient);

  const pointlight = new PointLight(0xffffdd);
  pointlight.position.set(250, 100, -100);
  scene.add(pointlight);

  const waterCamera = new CubeCamera(0.01, 1000, 16);
  waterCamera.lookAt(new Vector3(0, 1, 0));
  const uniforms = UniformsUtils.merge([
    UniformsLib['lights'],
    UniformsLib['phong'],
    {
      diffuse: { type: 'c', value: new Color(0x5f93d3) },
      opacity: { type: 'f', value: 0.7 },
      u_time: { type: 'f', value: 0 },
      u_intensity: { type: 'f', value: 0 },
      u_multiplier: { type: 'f', value: 1 },
      u_wavesize: { type: 'v2', value: new Vector2(200, 200) },
      u_wavesegments: { type: 'v2', value: new Vector2(40, 40) },
    },
  ]);
  const waveShaderMaterial = new ShaderMaterial({
    transparent: true,
    lights: true,
    defines: { PHONG: '', FLAT_SHADED: '' },
    extensions: { derivatives: true },
    uniforms,
    vertexShader: waveVertexShader,
    fragmentShader: ShaderLib['phong'].fragmentShader,
    side: DoubleSide,
  });
  const faceMaterial = new MeshPhongMaterial({
    color: 0x5e85b4,
    side: DoubleSide,
    flatShading: true,
  });

  const water = new Object3D();
  const wsize = uniforms.u_wavesize.value;
  const wseg = uniforms.u_wavesegments.value;
  water.add(new Mesh(new PlaneGeometry(wsize.x, wsize.y, wseg.x, wseg.y), waveShaderMaterial));
  water.add(new Mesh(new PlaneBufferGeometry(wsize.x, wsize.y), faceMaterial));
  water.rotation.x = Math.PI / 2;
  scene.add(water);

  const rockGeometry = new IcosahedronGeometry(20, 2);
  const rockMaterial = new MeshPhongMaterial({
    color: 0x666666,
    shininess: 0,
    flatShading: true,
  });
  for (let i = 0; i < rockGeometry.vertices.length; i++) {
    rockGeometry.vertices[i].x += Math.random() * 3 - 1.5;
    rockGeometry.vertices[i].y = Math.max(
      Math.min(rockGeometry.vertices[i].y + Math.random() * 3 - 1.5, 18),
      0
    );
    rockGeometry.vertices[i].z += Math.random() * 3 - 1.5;
  }
  const rock = new Mesh(rockGeometry, rockMaterial);
  rock.position.set(15, 0, -7);
  scene.add(rock);

  const lhWhite = new MeshPhongMaterial({
    color: 0xddddaa,
    shininess: 10,
    flatShading: true,
  });
  const lhRed = new MeshPhongMaterial({
    color: 0xef5350,
    shininess: 10,
    flatShading: true,
  });
  const lhBlack = new MeshPhongMaterial({
    color: 0x444444,
    shininess: 10,
    flatShading: true,
  });
  const lighthouse = new Object3D();
  lighthouse.add(new Mesh(new CylinderBufferGeometry(5, 6, 6), lhRed));
  lighthouse.children[0].position.y = 20;
  lighthouse.add(new Mesh(new CylinderBufferGeometry(4, 5, 6), lhWhite));
  lighthouse.children[1].position.y = 26;
  lighthouse.add(new Mesh(new CylinderBufferGeometry(3, 4, 6), lhRed));
  lighthouse.children[2].position.y = 32;

  lighthouse.add(new Object3D());
  lighthouse.children[3].position.y = 40;
  const lhBase = new Mesh(new CylinderBufferGeometry(4, 4, 1), lhBlack);
  lhBase.position.y = -5;
  const lhGlass = new Mesh(
    new CylinderBufferGeometry(3, 3, 3.5, 8, 1, true),
    new MeshPhongMaterial({
      transparent: true,
      opacity: 0.1,
      color: 0x000000,
      shininess: 1000,
      flatShading: true,
      side: DoubleSide,
    })
  );
  lhGlass.add(
    new LineSegments(
      new EdgesGeometry(lhGlass.geometry),
      new LineBasicMaterial({ color: 0x444444 })
    )
  );
  lhGlass.position.y = -2.75;
  const lhRoof = new Mesh(new CylinderBufferGeometry(1, 4, 2), lhBlack);
  const lhRoofBall = new Mesh(new IcosahedronBufferGeometry(0.7, 1), lhBlack);
  lhRoofBall.position.y = 1.3;
  const lhSpire = new Mesh(new BoxBufferGeometry(0.25, 2, 0.25), lhBlack);
  lhSpire.position.y = 2.7;

  lighthouse.children[3].add(lhBase);
  lighthouse.children[3].add(lhGlass);
  lighthouse.children[3].add(lhRoof);
  lighthouse.children[3].add(lhRoofBall);
  lighthouse.children[3].add(lhSpire);

  lighthouse.add(new Object3D());
  lighthouse.lightRotation = -2;
  lighthouse.children[4].position.y = 37;
  const lhLightFixture = new Mesh(new ConeGeometry(1, 1), [
    lhBlack,
    new MeshPhongMaterial({ emissive: 0xffffbb, flatShading: true }),
  ]);
  for (let i = 0; i < lhLightFixture.geometry.faces.length; i++) {
    lhLightFixture.geometry.faces[i].materialIndex = i < 8 ? 0 : 1;
  }
  lhLightFixture.position.z = -1;
  lhLightFixture.rotation.x = -Math.PI / 2;
  const lightShaderMaterial = new ShaderMaterial({
    transparent: true,
    uniforms,
    vertexShader: beamVertexShader,
    fragmentShader: beamFragmentShader,
    side: DoubleSide,
  });
  const lhLightBeam = new Mesh(
    new CylinderGeometry(1, 15, wsize.x / 1.8, 16, 1, true),
    lightShaderMaterial
  );
  lhLightBeam.visible = false;
  lhLightBeam.position.z = wsize.x / 3.6 - 0.5;
  lhLightBeam.rotation.x = -Math.PI / 2;
  lighthouse.children[4].add(lhLightFixture);
  lighthouse.children[4].add(lhLightBeam);
  lighthouse.children[4].position.x = Math.sin(lighthouse.lightRotation);
  lighthouse.children[4].position.z = Math.cos(lighthouse.lightRotation);
  lighthouse.children[4].rotation.y = lighthouse.lightRotation;

  lighthouse.position.x = 15;
  lighthouse.position.z = -5;
  scene.add(lighthouse);

  const lhSpotLight = new SpotLight(0xffffaa, uniforms.u_intensity.value, 0, 0.5, 1);
  lhSpotLight.position.set(15, 37.4, -5);
  lhSpotLight.target = lighthouse.children[4];
  scene.add(lhSpotLight);

  const ship = new Object3D();
  const sMetal = new MeshPhongMaterial({
    color: 0xcccccc,
    shininess: 50,
    side: DoubleSide,
    flatShading: true,
  });
  const hullPeak = 1.5;
  const sHull = new Object3D();
  for (let i = 0; i < 2; i++) {
    const hullParametric = (u, v, position) => {
      const x = v * u + (1 - v) / hullPeak - 0.5;
      let f = 0.2 * v * Math.atan(3 * u) * Math.pow(1 - u, 0.25);
      if (i === 0) {
        f = -f;
      }

      position.set(x, 0.15 * Math.pow(v, 4) - 0.075, f);
    };
    sHull.add(new Mesh(new ParametricBufferGeometry(hullParametric, 25, 10), sMetal));
  }
  ship.add(sHull);
  ship.position.set(-30, 20, 10);
  ship.scale.set(10, 10, 10);
  scene.add(ship);

  const nightTimeline = gsap.timeline();
  nightTimeline
    .reverse()
    .to(uniforms.u_multiplier, 5, { value: 3 }, 0)
    .to(pointlight, 5, { intensity: 0.4 }, 0)
    .to(ambient.color, 5, { r: 0.2, g: 0.13, b: 0.1 }, 0)
    .add(() => {
      const header = document.querySelector('.floating-header');

      if (nightTimeline.reversed()) {
        header.classList.add('uk-light');
      } else {
        header.classList.remove('uk-light');
      }
    }, 2.5)
    .to(
      uniforms.u_intensity,
      2,
      {
        value: 1,
        onStart() {
          lighthouseOn = true;
          lhLightBeam.visible = true;
        },
        onReverseComplete() {
          lighthouseOn = false;
          lhLightBeam.visible = false;
        },
        onUpdate() {
          lhSpotLight.intensity = uniforms.u_intensity.value;
        },
      },
      2.5
    );

  const toggleNight = () => {
    if (nightTimeline.reversed()) {
      nightTimeline.play();
      document.body.classList.add('night');
    } else {
      nightTimeline.reverse();
      document.body.classList.remove('night');
    }
  };

  const render = () => {
    renderer.render(scene, camera);
    controls.update();

    const delta = clock.getDelta();
    uniforms.u_time.value += delta;
    if (lighthouseOn) {
      lighthouse.lightRotation += delta / 2;
      const c = lighthouse.lightRotation;
      lighthouse.children[4].position.x = Math.sin(c);
      lighthouse.children[4].position.z = Math.cos(c);
      lighthouse.children[4].rotation.y = c;
    }

    requestAnimationFrame(render);
  };

  toggleNight();
  setInterval(toggleNight, 15000);
  requestAnimationFrame(render);

  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
});
