import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';
import { faFileAudio } from '@fortawesome/free-regular-svg-icons';
import WaveSurfer from 'wavesurfer.js';
import * as mm from 'music-metadata-browser';

import enableFAIcons from '../../lib/enableFAIcons';
import requestAnimationFrame from '../../lib/requestAnimationFrame';

const AudioContext = window.AudioContext || window.webkitAudioContext;

const toLog = (i, max) => Math.pow(max, i / (max - 1)) - 1;
const lerp = (a, b, t) => (1 - t) * a + t * b;

const toHHMMSS = number => {
  const date = new Date(0, 0, 0);
  date.setSeconds(Math.round(number));
  let hours = date.getHours();
  const minutes = date.getMinutes();
  let seconds = date.getSeconds();

  if (hours === 0) {
    hours = '';
  } else if (minutes < 10) {
    hours += ':0';
  } else {
    hours += ':';
  }

  if (seconds < 10) {
    seconds = `0${seconds}`;
  }

  return `${hours}${minutes}:${seconds}`;
};

const makeLogarithmicMapper = (maxDomain, maxRange) => {
  const mapped = [];
  for (let i = 0; i < maxDomain; i++) {
    mapped[i] = toLog((i * maxRange) / maxDomain, maxRange);
  }

  return i => mapped[i];
};

document.addEventListener('DOMContentLoaded', () => {
  UIkit.use(Icons);
  enableFAIcons(faFileAudio);

  let visualizerWidth = 800;
  let visualizerHeight = 400;
  const volumeBarHeight = 10;

  const c = document.getElementById('visualizer');
  const ctx = c.getContext('2d');
  c.height = visualizerHeight;
  c.width = visualizerWidth;

  const fftSize = Math.pow(2, 11);
  let mapLogarithmic;

  const audioContext = new AudioContext();
  let source;
  const gainNode = audioContext.createGain();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = fftSize;
  analyser.smoothingTimeConstant = 0.8;

  const wavesurfer = WaveSurfer.create({
    container: '#wave',
    audioContext,
    interact: false,
    normalize: true,
    scrollParent: true,
    hideScrollbar: true,
    height: 100,
    progressColor: '#ef5350',
    waveColor: '#632828',
    cursorColor: '#fff',
  });
  wavesurfer.setMute(true);

  let wavesurferReady = Promise.resolve();

  let playing = false;
  let targetVolume = 0;
  let currentVolume = 0;
  const volDecay = 0.1;
  let startOffset = 0;
  let startTime = 0;
  let bufferLength;
  let volumeData;
  let frequencyData;
  let duration = 0;

  const resize = () => {
    visualizerWidth = document.getElementById('visualizerContainer').clientWidth;
    if (window.innerHeight <= 600) {
      visualizerHeight = 200;
    } else {
      visualizerHeight = 400;
    }
    c.width = visualizerWidth;
    c.height = visualizerHeight;

    if (source) {
      mapLogarithmic = makeLogarithmicMapper(visualizerWidth, bufferLength);
    }
  };

  const reset = () => {
    if (source) {
      source.disconnect();
      gainNode.disconnect();
      analyser.disconnect();
      source.stop();
      document.getElementById('name').innerHTML = '';
      document.getElementById('currentTime').innerHTML = '-:--';
      document.getElementById('duration').innerHTML = '-:--';
      source = null;
    }

    playing = false;
    startOffset = 0;
    targetVolume = 0;
    currentVolume = 0;
    ctx.clearRect(0, 0, visualizerWidth, visualizerHeight);
  };

  const draw = () => {
    analyser.getByteTimeDomainData(volumeData);
    analyser.getByteFrequencyData(frequencyData);
    ctx.clearRect(0, 0, visualizerWidth, visualizerHeight);

    const h = visualizerHeight - volumeBarHeight;
    for (let i = 0; i < visualizerWidth; i++) {
      const mappedIndex = mapLogarithmic(i);
      const p = mappedIndex % 1;
      const l = Math.max(0, Math.floor(mappedIndex));
      const r = Math.min(bufferLength - 1, Math.ceil(mappedIndex));
      const y = ((1 - p) * frequencyData[l] + p * frequencyData[r]) / 255;

      ctx.fillStyle = `hsl(0, 67%, ${Math.min(100, y * y * 70 + 10)}%)`;
      ctx.fillRect(i, (1 - y) * h, 1, y * h);
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
    if (currentVolume > 1) {
      currentVolume = 1;
    }

    ctx.fillStyle = `hsl(0, 67%, ${Math.min(100, currentVolume * currentVolume * 60 + 40)}%)`;
    const volumeBarWidth = visualizerWidth * currentVolume;
    ctx.fillRect(visualizerWidth / 2 - volumeBarWidth / 2, h, volumeBarWidth, volumeBarHeight);

    if (playing) {
      document.getElementById('currentTime').innerHTML = toHHMMSS(
        audioContext.currentTime - startTime + startOffset
      );
      if (audioContext.currentTime - startTime + startOffset >= duration) {
        reset();
        document.getElementById('details').classList.add('uk-hidden');
      } else {
        requestAnimationFrame(draw);
      }
    }
  };

  const play = () => {
    startTime = audioContext.currentTime;
    playing = true;
    source.start(0, startOffset % duration);
    wavesurfer.seekAndCenter(startOffset / duration);
    wavesurfer.play();
    draw();
  };

  const handleAudioBuffer = async dataBuffer => {
    reset();
    source = audioContext.createBufferSource();
    source.buffer = dataBuffer;
    source.connect(gainNode);
    gainNode.connect(analyser);
    analyser.connect(audioContext.destination);

    bufferLength = Math.ceil(analyser.frequencyBinCount * (20000 / 24000)); // Restrict buffer to 20000Hz
    volumeData = new Uint8Array(bufferLength);
    frequencyData = new Uint8Array(bufferLength);
    duration = dataBuffer.duration;
    mapLogarithmic = makeLogarithmicMapper(visualizerWidth, bufferLength);

    await wavesurferReady;
  };

  resize();
  reset();

  const fileInput = document.getElementById('fileInput');

  ['dragenter', 'dragover'].forEach(event => {
    fileInput.addEventListener(event, () => {
      fileInput.parentNode.classList.add('uk-active');
    });
  });
  ['dragleave', 'dragend', 'drop'].forEach(event => {
    fileInput.addEventListener(event, () => {
      fileInput.parentNode.classList.remove('uk-active');
    });
  });

  fileInput.addEventListener('change', ev => {
    const { files } = ev.target;
    if (files.length !== 0) {
      const reader = new FileReader();
      reader.onload = ({ target: { result: contents } }) => {
        UIkit.notification(`${files[0].name} uploaded!`, {
          pos: 'bottom-right',
          status: 'success',
        });
        const notification = UIkit.notification('Decoding audio data...', {
          pos: 'bottom-right',
          timeout: 0,
        });

        audioContext
          .decodeAudioData(contents)
          .then(buffer => {
            const name = document.getElementById('name');
            mm.parseBlob(files[0])
              .then(metadata => {
                name.textContent = `${metadata.common.title}\n${metadata.common.artist}`;
              })
              .catch(() => {
                name.textContent = files[0].name;
              });

            return handleAudioBuffer(buffer);
          })
          .then(() => {
            notification.close();
            UIkit.notification('Audio data decoded!', { pos: 'bottom-right', status: 'success' });

            play();

            document.getElementById('duration').innerHTML = toHHMMSS(duration);
            document.getElementById('details').classList.remove('uk-hidden');
            document.getElementById('visualizerContainer').classList.remove('bordered');
          })
          .catch(error => {
            console.error(error);

            notification.close();
            UIkit.notification('Decoding error. Make sure the file is an audio file.', {
              status: 'danger',
              pos: 'bottom-right',
            });
          });
      };

      reader.readAsArrayBuffer(files[0]);
      wavesurfer.loadBlob(files[0]);
      wavesurferReady = new Promise(resolve => {
        function wsReady() {
          wavesurfer.un('ready', wsReady);
          resolve();
        }

        wavesurfer.on('ready', wsReady);
      });
    }
  });

  window.addEventListener('resize', resize);
});
