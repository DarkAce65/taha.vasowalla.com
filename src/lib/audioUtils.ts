export function toHHMMSS(number: number): string {
  const date = new Date(0, 0, 0);
  date.setSeconds(Math.round(number));
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  let hourMinuteSeparator = '';
  if (hours !== 0) {
    if (minutes < 10) {
      hourMinuteSeparator = ':0';
    } else {
      hourMinuteSeparator = ':';
    }
  }

  let minuteSecondSeparator = ':';
  if (seconds < 10) {
    minuteSecondSeparator += '0';
  }

  return `${hours}${hourMinuteSeparator}${minutes}${minuteSecondSeparator}${seconds}`;
}

const toLog = (i: number, max: number): number => Math.pow(max, i / (max - 1)) - 1;
export function makeLogarithmicMapper(
  maxDomain: number,
  maxRange: number,
): (index: number) => number {
  const mapped: number[] = [];
  for (let i = 0; i < maxDomain; i++) {
    mapped[i] = toLog((i * maxRange) / maxDomain, maxRange);
  }

  return (i) => mapped[i];
}

export class AudioAnalyserController {
  private _audioContext: AudioContext | null = null;

  private audioBuffer: AudioBuffer | null = null;
  private audioState: {
    sourceNode: AudioBufferSourceNode;
    analyserNode: AnalyserNode;
    isSourcePlaying: boolean;
    analyserBufferLength: number;
  } | null = null;

  private smoothingTimeConstant?: number;

  constructor({ smoothingTimeConstant }: { smoothingTimeConstant?: number } = {}) {
    this.smoothingTimeConstant = smoothingTimeConstant;
  }

  private get audioContext(): AudioContext {
    if (this._audioContext === null) {
      this._audioContext = new AudioContext({ latencyHint: 'playback' });
    }
    return this._audioContext;
  }

  private reset(): void {
    this.audioBuffer = null;
    if (this.audioState !== null) {
      this.audioState.sourceNode.disconnect();
      this.audioState.analyserNode.disconnect();
      this.audioState = null;
    }
  }

  private getAudioState(): NonNullable<typeof this.audioState> {
    if (this.audioState === null) {
      throw new Error('Audio nodes not initialized');
    }
    return this.audioState;
  }

  isPlaying(): boolean {
    return this.audioState?.isSourcePlaying ?? false;
  }

  getCurrentTime(): number {
    return this.audioContext.currentTime;
  }

  getDuration(): number {
    return this.audioBuffer?.duration ?? 0;
  }

  getAnalyserBufferLength(): number {
    const { analyserBufferLength } = this.getAudioState();
    return analyserBufferLength;
  }

  getAnalyserData(timeDomain: Uint8Array, frequencyDomain: Uint8Array): void {
    const { analyserNode } = this.getAudioState();

    analyserNode.getByteTimeDomainData(timeDomain);
    analyserNode.getByteFrequencyData(frequencyDomain);
  }

  async loadAudioBuffer(audioBuffer: AudioBuffer): Promise<void> {
    this.reset();

    const sourceNode = new AudioBufferSourceNode(this.audioContext, { buffer: audioBuffer });
    const analyserNode = new AnalyserNode(this.audioContext, {
      fftSize: Math.pow(2, 11),
      smoothingTimeConstant: this.smoothingTimeConstant,
    });

    sourceNode.connect(analyserNode);
    analyserNode.connect(this.audioContext.destination);

    sourceNode.addEventListener('ended', () => {
      if (this.audioState && this.audioState.sourceNode === sourceNode) {
        this.audioState.isSourcePlaying = false;
      }
    });

    this.audioBuffer = audioBuffer;
    this.audioState = {
      sourceNode,
      analyserNode,
      isSourcePlaying: false,
      analyserBufferLength: Math.ceil(analyserNode.frequencyBinCount * (20000 / 24000)), // Restrict buffer to 20000Hz
    };
  }

  async loadFile(fileContents: ArrayBuffer): Promise<void> {
    const buffer = await this.audioContext.decodeAudioData(fileContents);
    return this.loadAudioBuffer(buffer);
  }

  play(): void {
    if (this.audioState === null || this.isPlaying()) {
      return;
    }

    this.audioState.sourceNode.start();
    this.audioState.isSourcePlaying = true;
  }
}
