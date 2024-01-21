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

class PlaybackPositionBufferNode {
  readonly sourceNode: AudioBufferSourceNode;
  readonly outputNode: ChannelMergerNode;
  private readonly splitterNode: ChannelSplitterNode;
  private readonly analyserNode: AnalyserNode;

  private readonly playbackSampleArray: Float32Array;

  constructor(
    private readonly context: AudioContext,
    { buffer, ...options }: ConstructorParameters<typeof AudioBufferSourceNode>[1] = {},
  ) {
    this.sourceNode = new AudioBufferSourceNode(this.context, options);
    this.outputNode = new ChannelMergerNode(this.context);
    this.splitterNode = new ChannelSplitterNode(this.context);
    this.analyserNode = new AnalyserNode(this.context);
    this.playbackSampleArray = new Float32Array(1);

    if (buffer) {
      this.buffer = buffer;
    }
  }

  set buffer(audioBuffer: AudioBuffer) {
    const bufferWithPlaybackData = new AudioBuffer({
      length: audioBuffer.length,
      sampleRate: audioBuffer.sampleRate,
      numberOfChannels: audioBuffer.numberOfChannels + 1,
    });

    for (let index = 0; index < audioBuffer.numberOfChannels; index++) {
      bufferWithPlaybackData.copyToChannel(audioBuffer.getChannelData(index), index);
    }

    const playbackPositionChannel = audioBuffer.numberOfChannels;
    const playbackPositionSamples = new Float32Array(audioBuffer.length);
    for (let i = 0; i < audioBuffer.length; i++) {
      playbackPositionSamples[i] = i / audioBuffer.length;
    }
    bufferWithPlaybackData.copyToChannel(playbackPositionSamples, playbackPositionChannel);

    this.sourceNode.buffer = bufferWithPlaybackData;

    this.sourceNode.connect(this.splitterNode);
    for (let index = 0; index < audioBuffer.numberOfChannels; index++) {
      this.splitterNode.connect(this.outputNode, index, index);
    }
    this.splitterNode.connect(this.analyserNode, playbackPositionChannel);
  }

  get playbackPosition(): number {
    this.analyserNode.getFloatTimeDomainData(this.playbackSampleArray);
    return this.playbackSampleArray[0];
  }

  disconnect(): void {
    this.sourceNode.disconnect();
    this.outputNode.disconnect();
    this.splitterNode.disconnect();
    this.analyserNode.disconnect();
  }
}

export class AudioAnalyserController {
  private _audioContext: AudioContext | null = null;

  private audioBuffer: AudioBuffer | null = null;
  private audioState: {
    bufferNode: PlaybackPositionBufferNode;
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
      this.audioState.bufferNode.disconnect();
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
    const { bufferNode } = this.getAudioState();
    return bufferNode.playbackPosition * this.audioBuffer!.duration;
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

  loadAudioBuffer(audioBuffer: AudioBuffer): void {
    this.reset();

    const bufferNode = new PlaybackPositionBufferNode(this.audioContext, { buffer: audioBuffer });
    const analyserNode = new AnalyserNode(this.audioContext, {
      fftSize: Math.pow(2, 11),
      smoothingTimeConstant: this.smoothingTimeConstant,
    });

    bufferNode.outputNode.connect(analyserNode);
    analyserNode.connect(this.audioContext.destination);

    bufferNode.sourceNode.addEventListener('ended', () => {
      if (this.audioState && this.audioState.bufferNode === bufferNode) {
        this.audioState.isSourcePlaying = false;
      }
    });

    this.audioBuffer = audioBuffer;
    this.audioState = {
      bufferNode,
      analyserNode,
      isSourcePlaying: false,
      analyserBufferLength: Math.ceil(analyserNode.frequencyBinCount * (20000 / 24000)), // Restrict buffer to 20000Hz
    };
  }

  async loadFile(fileContents: ArrayBuffer): Promise<void> {
    const buffer = await this.audioContext.decodeAudioData(fileContents);
    this.loadAudioBuffer(buffer);
  }

  play(): void {
    if (this.audioState === null || this.isPlaying()) {
      return;
    }

    this.audioState.bufferNode.sourceNode.start();
    this.audioState.isSourcePlaying = true;
  }
}
