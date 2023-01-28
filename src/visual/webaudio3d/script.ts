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

import { makeLogarithmicMapper, toHHMMSS } from '~/lib/audioUtils';
import enableIcons from '~/lib/enableIcons';
import { lerp } from '~/lib/utils';

document.addEventListener('DOMContentLoaded', () => {
  enableIcons({ uikit: true, faIcons: [faFileAudio, faVideo] });

  const scene = new Scene();
  const renderer = new WebGLRenderer({ alpha: true, antialias: true });
  document.querySelector('#rendererContainer')!.appendChild(renderer.domElement);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
  camera.position.set(0, 0, 200);

  const controls = new TrackballControls(camera, renderer.domElement);

  const ambient = new AmbientLight(0xffffff);
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

  const fftSize = Math.pow(2, 11);
  const volDecay = 0.1;

  const audioContext = new AudioContext();
  let source: AudioBufferSourceNode | null = null;
  const gainNode = audioContext.createGain();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = fftSize;
  analyser.smoothingTimeConstant = 0.675;

  let playing = false;
  let startOffset = 0;
  let startTime = 0;
  let duration = 0;
  let bufferLength = Math.ceil(analyser.frequencyBinCount * (20000 / 24000)); // Restrict buffer to 20000Hz

  let targetVolume = 0;
  let currentVolume = 0;
  let zeroArray = new Uint8Array(bufferLength);
  let silence = new Uint8Array(bufferLength);
  silence.fill(128);
  let volumeData = silence;
  let frequencyData = zeroArray;
  let mapLogarithmic = makeLogarithmicMapper(bars.length, bufferLength);

  const resize = (): void => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  };

  const createBars = (numBars: number): void => {
    for (let i = 0; i < bars.length; i++) {
      scene.remove(bars[i]);
    }
    scene.remove(circle);

    mapLogarithmic = makeLogarithmicMapper(numBars, bufferLength);

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
  };

  const reset = (): void => {
    if (source) {
      source.disconnect();
      gainNode.disconnect();
      analyser.disconnect();
      source.stop();
      document.getElementById('name')!.innerHTML = '';
      document.getElementById('currentTime')!.innerHTML = '-:--';
      document.getElementById('duration')!.innerHTML = '-:--';
      source = null;
    }

    playing = false;
    startOffset = 0;
  };

  const setCamera = (position: 'overhead' | 'side'): void => {
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
  };

  const render = (): void => {
    if (playing) {
      analyser.getByteTimeDomainData(volumeData);
      analyser.getByteFrequencyData(frequencyData);
    } else {
      volumeData = silence;
      frequencyData = zeroArray;
    }

    for (let i = 0; i < bars.length; i++) {
      const mappedIndex = mapLogarithmic(i);
      const p = mappedIndex % 1;
      const l = Math.max(0, Math.floor(mappedIndex));
      const r = Math.min(bufferLength - 1, Math.ceil(mappedIndex));
      const scalar = 1 + ((1 - p) * frequencyData[l] + p * frequencyData[r]) / 255;

      bars[i].geometry.attributes.position.setXY(1, scalar * points[i].x, scalar * points[i].y);
      bars[i].geometry.attributes.position.needsUpdate = true;
    }

    targetVolume = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = volumeData[i] - 128;
      targetVolume += v * v;
    }
    targetVolume = Math.sqrt(targetVolume / bufferLength) / 128;
    if (currentVolume < targetVolume) {
      currentVolume = targetVolume;
    } else {
      currentVolume = lerp(currentVolume, targetVolume, volDecay);
    }
    currentVolume = Math.max(0.0001, Math.min(currentVolume, 1));

    volumeObject.scale.set(currentVolume, currentVolume, currentVolume);
    ballMaterial.color.setHSL(0, 0.67, currentVolume + 0.1);
    lineMaterial.color.setHSL(0, 0.67, 1.1 - currentVolume);

    if (playing) {
      document.getElementById('currentTime')!.innerHTML = toHHMMSS(
        audioContext.currentTime - startTime + startOffset
      );
      if (audioContext.currentTime - startTime + startOffset >= duration) {
        reset();
        document.getElementById('details')!.classList.add('uk-hidden');
      }
    }

    renderer.render(scene, camera);
    controls.update();
    requestAnimationFrame(render);
  };

  const play = (): void => {
    if (!source) {
      return;
    }

    startTime = audioContext.currentTime;
    playing = true;
    source.start(0, startOffset % duration);
    setCamera('side');
  };

  const handleAudioBuffer = async (dataBuffer: AudioBuffer): Promise<void> => {
    reset();
    source = audioContext.createBufferSource();
    source.buffer = dataBuffer;
    source.connect(gainNode);
    gainNode.connect(analyser);
    analyser.connect(audioContext.destination);

    bufferLength = Math.ceil(analyser.frequencyBinCount * (20000 / 24000)); // Restrict buffer to 20000Hz
    volumeData = new Uint8Array(bufferLength);
    frequencyData = new Uint8Array(bufferLength);
    zeroArray = new Uint8Array(bufferLength);
    silence = new Uint8Array(bufferLength);
    silence.fill(128);
    duration = dataBuffer.duration;
    mapLogarithmic = makeLogarithmicMapper(bars.length, bufferLength);
  };

  resize();
  reset();
  createBars(200);
  render();

  document.getElementById('resetCamera')!.addEventListener('click', () => setCamera('overhead'));

  const fileInput = document.getElementById('fileInput')!;

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

        audioContext
          .decodeAudioData(contents)
          .then((buffer) => {
            const name = document.getElementById('name')!;
            mm.parseBlob(files[0])
              .then((metadata) => {
                name.textContent = `${metadata.common.title ?? ''}\n${
                  metadata.common.artist ?? ''
                }`;
              })
              .catch(() => {
                name.textContent = files[0].name;
              });

            return handleAudioBuffer(buffer);
          })
          .then(() => {
            notification.close(false);
            UIkit.notification('Audio data decoded!', { pos: 'bottom-right', status: 'success' });
          })
          .then(() => {
            play();

            document.getElementById('duration')!.innerHTML = toHHMMSS(duration);
            document.getElementById('details')!.classList.remove('uk-hidden');
          })
          .catch((error) => {
            console.error(error);

            notification.close(false);
            UIkit.notification('Decoding error. Make sure the file is an audio file.', {
              status: 'danger',
              pos: 'bottom-right',
            });
          });
      };

      reader.readAsArrayBuffer(files[0]);
    }
  });

  window.addEventListener('resize', resize);
});
