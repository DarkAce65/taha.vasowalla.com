import UIkit from 'uikit';

import { faFileAudio } from '@fortawesome/free-regular-svg-icons';
import * as mm from 'music-metadata-browser';

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
  let waveWidth = 800;
  const waveHeight = 100;
  const wavePixelsPerSecond = 20;

  const visualizerCanvas = getElOrThrow<HTMLCanvasElement>('#visualizer');
  const visualizerCtx = visualizerCanvas.getContext('2d')!;
  visualizerCanvas.height = visualizerHeight;
  visualizerCanvas.width = visualizerWidth;

  getElOrThrow('#waveCanvasContainer').style.height = `${waveHeight}px`;
  const waveProgressCanvas = getElOrThrow<HTMLCanvasElement>('#waveProgress');
  const waveProgressCtx = waveProgressCanvas.getContext('2d')!;
  waveProgressCanvas.height = waveHeight;
  waveProgressCanvas.width = waveWidth;
  const waveCanvas = getElOrThrow<HTMLCanvasElement>('#wave');
  const waveCtx = waveCanvas.getContext('2d')!;
  waveCanvas.height = waveHeight;
  waveCanvas.width = waveWidth;

  let volumeData: Uint8Array<ArrayBuffer>;
  let frequencyData: Uint8Array<ArrayBuffer>;

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
    visualizerCtx.clearRect(0, 0, visualizerWidth, visualizerHeight);

    const bufferLength = audioAnalyser.getAnalyserBufferLength();

    const h = visualizerHeight - volumeBarHeight;

    let barX = 0;
    for (const value of mapLogarithmic(frequencyData)) {
      const barY = value / 255;

      visualizerCtx.fillStyle = `hsl(9, 93%, ${Math.min(100, barY * barY * 70 + 10)}%)`;
      visualizerCtx.fillRect(barX, (1 - barY) * h, 1, barY * h);
      barX += 1;
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

    visualizerCtx.fillStyle = `hsl(9, 93%, ${Math.min(100, currentVolume * currentVolume * 60 + 40)}%)`;
    const volumeBarWidth = visualizerWidth * currentVolume;
    visualizerCtx.fillRect(
      visualizerWidth / 2 - volumeBarWidth / 2,
      h,
      volumeBarWidth,
      volumeBarHeight,
    );

    const progress = audioAnalyser.getProgress();

    const scroll = progress * waveWidth - visualizerWidth / 2;
    const left = Math.min(Math.max(0, scroll), waveWidth - visualizerWidth);
    getElOrThrow('#waveCanvasContainer').style.left = `${-left}px`;
    const end = waveWidth * progress;
    waveProgressCanvas.style.clipPath = `polygon(0 0, ${end}px 0, ${end}px ${waveHeight}px, 0 ${waveHeight}px)`;
  }

  function condenseWaveformData(
    rawChannelData: [Float32Array, Float32Array],
    length: number,
  ): [Float32Array, Float32Array] {
    const [channel0, channel1] = rawChannelData;
    const channelLength = channel0.length;
    const step = channelLength / length;
    const condensedData: [Float32Array, Float32Array] = [
      new Float32Array(length),
      new Float32Array(length),
    ];
    for (let i = 0; i < length; i++) {
      let max0 = 0;
      let max1 = 0;
      for (let j = Math.floor(i * step); j < Math.floor((i + 1) * step); j++) {
        if (channel0[j] > max0) max0 = channel0[j];
        if (channel1[j] > max1) max1 = channel1[j];
      }
      condensedData[0][i] = max0;
      condensedData[1][i] = max1;
    }

    return condensedData;
  }

  function drawWaveform(): void {
    waveWidth = Math.max(
      visualizerWidth,
      Math.round(audioAnalyser.getDuration() * wavePixelsPerSecond),
    );
    waveProgressCanvas.width = waveWidth * window.devicePixelRatio;
    waveProgressCanvas.height = waveHeight * window.devicePixelRatio;
    waveCanvas.width = waveWidth * window.devicePixelRatio;
    waveCanvas.height = waveHeight * window.devicePixelRatio;
    getElOrThrow('#waveContainer').style.width = `${waveWidth}px`;
    waveProgressCtx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const [channel0, channel1] = condenseWaveformData(audioAnalyser.getChannelData(), waveWidth);

    waveProgressCtx.clearRect(0, 0, waveWidth, waveHeight);
    waveCtx.clearRect(0, 0, waveWidth, waveHeight);
    waveProgressCtx.fillStyle = COLORS.RED;

    const halfHeight = waveHeight / 2;
    waveProgressCtx.beginPath();
    waveProgressCtx.moveTo(0, halfHeight);
    for (let i = 0; i < waveWidth; i++) {
      waveProgressCtx.lineTo(i, -Math.max(0.5, channel0[i] * halfHeight) + halfHeight);
    }
    waveProgressCtx.lineTo(waveWidth, halfHeight);
    for (let i = waveWidth - 1; i >= 0; i--) {
      waveProgressCtx.lineTo(i, +Math.max(0.5, channel1[i] * halfHeight) + halfHeight);
    }
    waveProgressCtx.closePath();
    waveProgressCtx.fill();

    waveCtx.drawImage(waveProgressCanvas, 0, 0);
  }

  function resize(): void {
    visualizerWidth = getElOrThrow('#visualizerContainer').clientWidth;
    if (window.innerHeight <= 600) {
      visualizerHeight = 200;
    } else {
      visualizerHeight = 400;
    }

    const roundedPixelRatio = Math.max(1, Math.round(window.devicePixelRatio));
    visualizerCanvas.width = visualizerWidth * roundedPixelRatio;
    visualizerCanvas.height = visualizerHeight * roundedPixelRatio;
    visualizerCanvas.style.width = `${visualizerWidth}px`;
    visualizerCanvas.style.height = `${visualizerHeight}px`;
    visualizerCtx.scale(roundedPixelRatio, roundedPixelRatio);

    if (audioAnalyser.isPlaying()) {
      mapLogarithmic = makeLogarithmicMapper(
        audioAnalyser.getAnalyserBufferLength(),
        visualizerWidth,
      );

      drawWaveform();
    }
  }

  function reset(): void {
    getElOrThrow('#name').textContent = '';
    getElOrThrow('#currentTime').textContent = '-:--';
    getElOrThrow('#duration').textContent = '-:--';

    targetVolume = 0;
    currentVolume = 0;
    visualizerCtx.clearRect(0, 0, visualizerWidth, visualizerHeight);

    waveProgressCanvas.style.clipPath = '';
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
            getElOrThrow('#duration').textContent = toHHMMSS(audioAnalyser.getDuration());
            getElOrThrow('#details').classList.remove('uk-hidden');
            getElOrThrow('#visualizerContainer').classList.remove('bordered');

            const bufferLength = audioAnalyser.getAnalyserBufferLength();
            volumeData = new Uint8Array(bufferLength);
            frequencyData = new Uint8Array(bufferLength);
            mapLogarithmic = makeLogarithmicMapper(bufferLength, visualizerWidth);

            drawWaveform();

            audioAnalyser.play();
            cancelAnimationFrame(animationHandle);
            draw();
          });
      };

      reader.readAsArrayBuffer(files[0]);
    }
  });

  window.addEventListener('resize', resize);
});
