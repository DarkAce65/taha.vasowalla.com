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

export function makeLogarithmicMapper(
  domain: number,
  range: number,
): (input: ArrayLike<number>) => Generator<number> {
  const buckets = new Array(range).fill(undefined).map<number[]>(() => []);

  const logDomain = Math.log(domain);
  for (let i = 0; i < domain; i++) {
    if (i === 0) {
      buckets[0].push(i);
    } else {
      const bucketIndex = Math.min(Math.floor((Math.log(i + 1) / logDomain) * range), range - 1);
      buckets[bucketIndex].push(i);
    }
  }

  const condensedBuckets: { bucket: number[]; width: number }[] = [];
  for (const bucket of buckets) {
    if (bucket.length === 0) {
      condensedBuckets[condensedBuckets.length - 1].width += 1;
    } else {
      condensedBuckets.push({ bucket, width: 1 });
    }
  }

  return function* logarithmicMapper(input) {
    const maxValues: (number | null)[] = new Array(condensedBuckets.length).fill(null);
    function getMaxValue(index: number): number {
      if (maxValues[index] === null) {
        const { bucket } = condensedBuckets[index];
        let max = input[bucket[0]];
        for (let i = 1; i < bucket.length; i++) {
          if (input[bucket[i]] > max) max = input[bucket[i]];
        }
        maxValues[index] = max;
      }
      return maxValues[index];
    }
    for (let i = 0; i < condensedBuckets.length; i++) {
      const currentValue = getMaxValue(i);
      const { width } = condensedBuckets[i];
      if (width > 1) {
        const nextValue = getMaxValue(i + 1);
        for (let j = 0; j < width; j++) {
          yield currentValue + (nextValue - currentValue) * (j / width);
        }
      } else {
        yield currentValue;
      }
    }
  };
}

class PlaybackPositionBufferNode {
  readonly sourceNode: AudioBufferSourceNode;
  readonly outputNode: ChannelMergerNode;
  private readonly splitterNode: ChannelSplitterNode;
  private readonly analyserNode: AnalyserNode;

  private readonly playbackSampleArray: Float32Array<ArrayBuffer>;

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

  getProgress(): number {
    const { bufferNode } = this.getAudioState();
    return bufferNode.playbackPosition;
  }

  getCurrentTime(): number {
    return this.getProgress() * this.audioBuffer!.duration;
  }

  getDuration(): number {
    return this.audioBuffer?.duration ?? 0;
  }

  getAnalyserBufferLength(): number {
    const { analyserBufferLength } = this.getAudioState();
    return analyserBufferLength;
  }

  getAnalyserData(
    timeDomain: Uint8Array<ArrayBuffer>,
    frequencyDomain: Uint8Array<ArrayBuffer>,
  ): void {
    const { analyserNode } = this.getAudioState();

    analyserNode.getByteTimeDomainData(timeDomain);
    analyserNode.getByteFrequencyData(frequencyDomain);
  }

  getChannelData(): [Float32Array, Float32Array] {
    const audioBuffer = this.audioBuffer!;
    const channel0 = audioBuffer.getChannelData(0);
    const channel1 = audioBuffer.numberOfChannels === 1 ? channel0 : audioBuffer.getChannelData(1);

    let max = 0;
    for (let i = 0; i < audioBuffer.length; i++) {
      if (Math.abs(channel0[i]) > max) max = Math.abs(channel0[i]);
      if (Math.abs(channel1[i]) > max) max = Math.abs(channel1[i]);
    }

    return [channel0.map((v) => v / max), channel1.map((v) => v / max)];
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
