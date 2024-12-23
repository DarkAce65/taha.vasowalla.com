import UIkit from 'uikit';

import { faFileAudio } from '@fortawesome/free-regular-svg-icons';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import gsap from 'gsap';
import * as mm from 'music-metadata-browser';
import {
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  DynamicDrawUsage,
  EdgesGeometry,
  EllipseCurve,
  IcosahedronGeometry,
  Line,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshPhongMaterial,
  Object3D,
  PerspectiveCamera,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';

import { AudioAnalyserController, makeLogarithmicMapper, toHHMMSS } from '~/lib/audioUtils';
import enableIcons from '~/lib/enableIcons';
import { getElOrThrow } from '~/lib/getEl';
import { lerp } from '~/lib/utils';

document.addEventListener('DOMContentLoaded', () => {
  enableIcons({ uikit: true, faIcons: [faFileAudio, faVideo] });

  const audioAnalyser = new AudioAnalyserController({ smoothingTimeConstant: 0.675 });

  const scene = new Scene();
  const renderer = new WebGLRenderer({ antialias: true });
  document.querySelector('#rendererContainer')!.appendChild(renderer.domElement);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
  camera.position.set(0, 0, 200);

  const controls = new TrackballControls(camera, renderer.domElement);

  const ambient = new AmbientLight(0xffffff, 3);
  scene.add(ambient);

  const volumeObject = new Object3D();
  const ballGeometry = new IcosahedronGeometry(80);
  const ballMaterial = new MeshPhongMaterial({
    color: 0xd9534f,
    side: DoubleSide,
    flatShading: true,
  });
  const lineMaterial = new LineBasicMaterial({ color: 0xe3807d });
  volumeObject.add(new Mesh(ballGeometry, ballMaterial));
  volumeObject.add(new LineSegments(new EdgesGeometry(ballGeometry), lineMaterial));
  scene.add(volumeObject);

  let circle: Line;
  let bars: Line[] = [];
  let points: Vector2[];

  let volumeData: Uint8Array;
  let frequencyData: Uint8Array;

  let targetVolume = 0;
  let currentVolume = 0;
  const volDecay = 0.1;
  let mapLogarithmic: ReturnType<typeof makeLogarithmicMapper>;

  function resize(): void {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }

  function createBars(numBars: number): void {
    for (let i = 0; i < bars.length; i++) {
      scene.remove(bars[i]);
    }
    scene.remove(circle);

    bars = [];
    const curve = new EllipseCurve(0, 0, 100, 100, 0, 2 * Math.PI, false, 0);
    points = curve.getPoints(numBars - 1);

    const geometry = new BufferGeometry().setFromPoints(points);
    const material = new LineBasicMaterial({ vertexColors: true });
    const colors = new Float32Array(numBars * 3);
    for (let i = 0; i < numBars; i++) {
      const color = new Color().setHSL(i / numBars, 1, 0.5);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      const vertex = new Vector3(points[i].x, points[i].y, 0);
      const vertex2 = vertex.clone();
      const lineGeometry = new BufferGeometry().setFromPoints([vertex, vertex2]);
      (lineGeometry.attributes.position as BufferAttribute).setUsage(DynamicDrawUsage);
      const line = new Line(lineGeometry, new LineBasicMaterial({ color }));
      bars.push(line);
      scene.add(line);
    }
    geometry.setAttribute('color', new BufferAttribute(colors, 3));
    geometry.computeBoundingSphere();
    circle = new Line(geometry, material);
    scene.add(circle);
  }

  function reset(): void {
    getElOrThrow('#name').innerHTML = '';
    getElOrThrow('#currentTime').innerHTML = '-:--';
    getElOrThrow('#duration').innerHTML = '-:--';
  }

  function setCamera(position: 'overhead' | 'side'): void {
    let x = 0;
    let y = 0;
    let z = 0;
    let uz = 0;

    switch (position) {
      case 'overhead':
        x = 0;
        y = 0;
        z = 300;
        uz = 0;
        break;
      case 'side':
      default:
        x = 116;
        y = -200;
        z = 200;
        uz = 1;
        break;
    }

    gsap.to(camera.position, { duration: 2, ease: 'power3.inOut', x, y, z });
    gsap.to(controls.target, {
      duration: 2,
      ease: 'power3.out',
      x: 0,
      y: 0,
      z: 0,
      onUpdate() {
        camera.lookAt(controls.target);
      },
    });
    gsap.to(camera.up, { duration: 1, x: 0, y: 1, z: uz });
  }

  function render(): void {
    requestAnimationFrame(render);

    if (audioAnalyser.isPlaying()) {
      audioAnalyser.getAnalyserData(volumeData, frequencyData);
      getElOrThrow('#currentTime').textContent = toHHMMSS(audioAnalyser.getCurrentTime());

      const bufferLength = audioAnalyser.getAnalyserBufferLength();

      let barIndex = 0;
      for (const value of mapLogarithmic(frequencyData)) {
        const scalar = 1 + value / 255;

        bars[barIndex].geometry.attributes.position.setXY(
          1,
          scalar * points[barIndex].x,
          scalar * points[barIndex].y,
        );
        bars[barIndex].geometry.attributes.position.needsUpdate = true;
        barIndex += 1;
      }

      targetVolume = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = volumeData[i] - 128;
        targetVolume += v * v;
      }
      targetVolume = Math.sqrt(targetVolume / bufferLength) / 128;
    } else {
      for (let i = 0; i < bars.length; i++) {
        bars[i].geometry.attributes.position.setXY(1, points[i].x, points[i].y);
        bars[i].geometry.attributes.position.needsUpdate = true;
      }
      targetVolume = 0;
    }

    if (currentVolume < targetVolume) {
      currentVolume = targetVolume;
    } else {
      currentVolume = lerp(currentVolume, targetVolume, volDecay);
    }
    currentVolume = Math.max(0.0001, Math.min(currentVolume, 1));

    volumeObject.scale.set(currentVolume, currentVolume, currentVolume);
    ballMaterial.color.setHSL(0, 0.67, currentVolume + 0.1);
    lineMaterial.color.setHSL(0, 0.67, 1.1 - currentVolume);

    renderer.render(scene, camera);
    controls.update();
  }

  resize();
  reset();
  createBars(200);
  render();

  getElOrThrow('#resetCamera').addEventListener('click', () => {
    setCamera('overhead');
  });

  const fileInput = getElOrThrow('#fileInput');

  ['dragenter', 'dragover'].forEach((event) => {
    fileInput.addEventListener(event, () => {
      (fileInput.parentNode as HTMLButtonElement).classList.add('uk-active');
    });
  });
  ['dragleave', 'dragend', 'drop'].forEach((event) => {
    fileInput.addEventListener(event, () => {
      (fileInput.parentNode as HTMLButtonElement).classList.remove('uk-active');
    });
  });

  fileInput.addEventListener('change', (event) => {
    const { files } = event.currentTarget as HTMLInputElement;
    if (files !== null && files.length !== 0) {
      const reader = new FileReader();
      reader.onload = ({ target }) => {
        const contents = target?.result as ArrayBuffer;
        UIkit.notification(`${files[0].name} loaded!`, { pos: 'bottom-right', status: 'success' });
        const notification = UIkit.notification('Decoding audio data...', {
          pos: 'bottom-right',
          timeout: 0,
        });

        audioAnalyser
          .loadFile(contents)
          .then(() => {
            notification.close(false);
            UIkit.notification('Audio data decoded!', { pos: 'bottom-right', status: 'success' });
          })
          .catch((error) => {
            notification.close(false);
            UIkit.notification('Decoding error. Make sure the file is an audio file.', {
              status: 'danger',
              pos: 'bottom-right',
            });
            throw error;
          })
          .then(() => {
            const fileMetadataElement = getElOrThrow('#name');
            mm.parseBlob(files[0])
              .then((metadata) => {
                const { title = '', artist = '' } = metadata.common;
                if (title.length === 0 && artist.length === 0) {
                  fileMetadataElement.textContent = files[0].name;
                } else {
                  fileMetadataElement.textContent = `${title ?? ''}\n${artist ?? ''}`;
                }
              })
              .catch(() => {
                fileMetadataElement.textContent = files[0].name;
              });
            getElOrThrow('#duration').innerHTML = toHHMMSS(audioAnalyser.getDuration());
            getElOrThrow('#details').classList.remove('uk-hidden');

            const bufferLength = audioAnalyser.getAnalyserBufferLength();
            volumeData = new Uint8Array(bufferLength);
            frequencyData = new Uint8Array(bufferLength);
            mapLogarithmic = makeLogarithmicMapper(bufferLength, bars.length);

            audioAnalyser.play();
            setCamera('side');
          });
      };

      reader.readAsArrayBuffer(files[0]);
    }
  });

  window.addEventListener('resize', resize);
});
