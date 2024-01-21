import UIkit from 'uikit';

import { faFileAudio } from '@fortawesome/free-regular-svg-icons';
import chroma from 'chroma-js';
import * as mm from 'music-metadata-browser';
import WaveSurfer from 'wavesurfer.js';

import { AudioAnalyserController, makeLogarithmicMapper, toHHMMSS } from '~/lib/audioUtils';
import { COLORS } from '~/lib/colors';
import enableIcons from '~/lib/enableIcons';
import { getElOrThrow } from '~/lib/getEl';
import { lerp } from '~/lib/utils';

document.addEventListener('DOMContentLoaded', () => {
  enableIcons({ uikit: true, faIcons: [faFileAudio] });

  const audioAnalyser = new AudioAnalyserController({ smoothingTimeConstant: 0.8 });

  let visualizerWidth = 800;
  let visualizerHeight = 400;
  const volumeBarHeight = 10;

  const canvas = getElOrThrow<HTMLCanvasElement>('#visualizer');
  const ctx = canvas.getContext('2d')!;
  canvas.height = visualizerHeight;
  canvas.width = visualizerWidth;

  const wavesurfer = WaveSurfer.create({
    container: '#wave',
    cursorColor: COLORS.WHITE,
    height: 100,
    hideScrollbar: true,
    interact: false,
    minPxPerSec: 20,
    normalize: true,
    progressColor: COLORS.RED,
    waveColor: chroma(COLORS.RED).luminance(0.05).hex(),
  });
  wavesurfer.setMuted(true);

  let wavesurferReady = Promise.resolve();

  let volumeData: Uint8Array;
  let frequencyData: Uint8Array;

  let targetVolume = 0;
  let currentVolume = 0;
  const volDecay = 0.1;
  let mapLogarithmic: ReturnType<typeof makeLogarithmicMapper>;

  let animationHandle: number;
  function draw(): void {
    if (!audioAnalyser.isPlaying()) {
      reset();
      getElOrThrow('#details').classList.add('uk-hidden');
      return;
    }

    animationHandle = requestAnimationFrame(draw);

    getElOrThrow('#currentTime').textContent = toHHMMSS(audioAnalyser.getCurrentTime());

    audioAnalyser.getAnalyserData(volumeData, frequencyData);
    ctx.clearRect(0, 0, visualizerWidth, visualizerHeight);

    const bufferLength = audioAnalyser.getAnalyserBufferLength();

    const h = visualizerHeight - volumeBarHeight;
    for (let i = 0; i < visualizerWidth; i++) {
      const mappedIndex = mapLogarithmic(i);
      const betweenIndexOffset = mappedIndex % 1;
      const leftIndex = Math.max(0, Math.floor(mappedIndex));
      const rightIndex = Math.min(bufferLength - 1, Math.ceil(mappedIndex));
      const y =
        ((1 - betweenIndexOffset) * frequencyData[leftIndex] +
          betweenIndexOffset * frequencyData[rightIndex]) /
        255;

      ctx.fillStyle = `hsl(9, 93%, ${Math.min(100, y * y * 70 + 10)}%)`;
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

    ctx.fillStyle = `hsl(9, 93%, ${Math.min(100, currentVolume * currentVolume * 60 + 40)}%)`;
    const volumeBarWidth = visualizerWidth * currentVolume;
    ctx.fillRect(visualizerWidth / 2 - volumeBarWidth / 2, h, volumeBarWidth, volumeBarHeight);
  }

  function resize(): void {
    visualizerWidth = getElOrThrow('#visualizerContainer').clientWidth;
    if (window.innerHeight <= 600) {
      visualizerHeight = 200;
    } else {
      visualizerHeight = 400;
    }
    canvas.width = visualizerWidth;
    canvas.height = visualizerHeight;

    if (audioAnalyser.isPlaying()) {
      mapLogarithmic = makeLogarithmicMapper(
        visualizerWidth,
        audioAnalyser.getAnalyserBufferLength(),
      );
    }
  }

  function reset(): void {
    getElOrThrow('#name').textContent = '';
    getElOrThrow('#currentTime').textContent = '-:--';
    getElOrThrow('#duration').textContent = '-:--';

    targetVolume = 0;
    currentVolume = 0;
    ctx.clearRect(0, 0, visualizerWidth, visualizerHeight);
  }

  resize();
  reset();

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
          .then(async () => {
            await wavesurferReady;

            notification.close(false);
            UIkit.notification('Audio data decoded!', { pos: 'bottom-right', status: 'success' });

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
            getElOrThrow('#duration').textContent = toHHMMSS(audioAnalyser.getDuration());
            getElOrThrow('#details').classList.remove('uk-hidden');
            getElOrThrow('#visualizerContainer').classList.remove('bordered');

            const bufferLength = audioAnalyser.getAnalyserBufferLength();
            volumeData = new Uint8Array(bufferLength);
            frequencyData = new Uint8Array(bufferLength);
            mapLogarithmic = makeLogarithmicMapper(visualizerWidth, bufferLength);

            audioAnalyser.play();
            wavesurfer.seekTo(0);
            wavesurfer.play();
            cancelAnimationFrame(animationHandle);
            draw();
          })
          .catch(() => {
            notification.close(false);
            UIkit.notification('Decoding error. Make sure the file is an audio file.', {
              status: 'danger',
              pos: 'bottom-right',
            });
          });
      };

      reader.readAsArrayBuffer(files[0]);
      wavesurferReady = wavesurfer.load(URL.createObjectURL(files[0]));
    }
  });

  window.addEventListener('resize', resize);
});
