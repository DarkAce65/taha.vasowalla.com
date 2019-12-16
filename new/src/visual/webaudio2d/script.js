import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';
import { faExpand, faPause } from '@fortawesome/free-solid-svg-icons';
import { faFileAudio } from '@fortawesome/free-regular-svg-icons';
import WaveSurfer from 'wavesurfer.js';

import enableFAIcons from '../../lib/enableFAIcons';
import requestAnimationFrame from '../../lib/requestAnimationFrame';

const AudioContext = window.AudioContext || window.webkitAudioContext;

const toLog = (i, max) => Math.pow(max, i / (max - 1)) - 1;

const lerp = (a, b, t) => a + t * (b - a);

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
  enableFAIcons(faPause, faFileAudio, faExpand);

  const fftSize = Math.pow(2, 11);

  let visualizerWidth = 800;
  let visualizerHeight = 400;
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

  const c = document.getElementById('visualizer');
  const ctx = c.getContext('2d');
  c.height = visualizerHeight;
  c.width = visualizerWidth;
  ctx.fillStyle = '#0F0';
  ctx.font = '16px serif';

  let targetVolume = 0;
  let currentVolume = 0;
  const volDecay = 0.1;
  let startOffset = 0;
  let startTime = 0;
  let bufferLength;
  let volumeData;
  let frequencyData;
  let duration = 0;
  let playing = false;

  const resize = () => {
    visualizerWidth = document.querySelector('#visualizerContainer').clientWidth;
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

  resize();

  const reset = () => {
    if (source) {
      source.disconnect();
      gainNode.disconnect();
      analyser.disconnect();
      source.stop();
      document.getElementById('filename').innerHTML = '';
      document.getElementById('currentTime').innerHTML = '-:--';
      document.getElementById('duration').innerHTML = '-:--';
      source = null;
    }

    playing = false;
    startOffset = 0;
    targetVolume = 0;
    currentVolume = 0;
    ctx.clearRect(0, 0, visualizerWidth, visualizerHeight);
    ctx.fillStyle = 'hsl(0, 67%, 20%)';
    ctx.fillRect(0, visualizerHeight - 1, visualizerWidth, 1);
  };

  const draw = () => {
    analyser.getByteTimeDomainData(volumeData);
    analyser.getByteFrequencyData(frequencyData);
    ctx.clearRect(0, 0, visualizerWidth, visualizerHeight);
    targetVolume = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = volumeData[i] - 128;
      targetVolume += v * v;
    }

    for (let i = 0; i < visualizerWidth; i++) {
      const mappedIndex = mapLogarithmic(i);
      const p = mappedIndex % 1;
      const l = Math.max(0, Math.floor(mappedIndex));
      const r = Math.min(bufferLength - 1, Math.ceil(mappedIndex));
      const y = ((1 - p) * frequencyData[l] + p * frequencyData[r]) / 255;

      ctx.fillStyle = `hsl(0, 67%, ${Math.min(100, (y * y + 0.1) * 80)}%)`;
      ctx.fillRect(i, (1 - y) * visualizerHeight, 1, y * visualizerHeight);
    }

    targetVolume = Math.sqrt(targetVolume / bufferLength) / 85;
    if (currentVolume < targetVolume) {
      currentVolume = targetVolume;
    } else {
      currentVolume = lerp(currentVolume, targetVolume, volDecay);
    }
    if (currentVolume > 1) {
      currentVolume = 1;
    }

    ctx.fillStyle = '#fff';
    ctx.fillRect(10, 1210, currentVolume * (visualizerWidth - 20), 25);
    if (playing) {
      document.getElementById('currentTime').innerHTML = toHHMMSS(
        audioContext.currentTime - startTime + startOffset
      );
      if (audioContext.currentTime - startTime + startOffset >= duration) {
        playing = false;
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

    bufferLength = analyser.frequencyBinCount;
    volumeData = new Uint8Array(bufferLength);
    frequencyData = new Uint8Array(bufferLength);
    duration = dataBuffer.duration;
    mapLogarithmic = makeLogarithmicMapper(visualizerWidth, bufferLength);

    await wavesurferReady;
  };

  document.querySelector('#fileInput').addEventListener('change', e => {
    const { files } = e.target;
    if (files.length !== 0) {
      const reader = new FileReader();
      reader.onload = ({ target: { result: contents } }) => {
        UIkit.notification(`${files[0].name} uploaded!`, {
          pos: 'top-right',
          status: 'success',
        });
        const notification = UIkit.notification('Decoding audio data...', {
          pos: 'top-right',
          timeout: 0,
        });

        audioContext
          .decodeAudioData(contents)
          .then(buffer => {
            document.querySelector('#filename').textContent = files[0].name;

            return handleAudioBuffer(buffer);
          })
          .then(() => {
            notification.close();
            UIkit.notification('Audio data decoded!', { pos: 'top-right', status: 'success' });
          })
          .catch(() => {
            notification.close();
            UIkit.notification('Decoding error. Make sure the file is an audio file.', {
              status: 'danger',
              pos: 'top-right',
            });
          })
          .then(() => {
            play();
            document.getElementById('duration').innerHTML = toHHMMSS(duration);
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
