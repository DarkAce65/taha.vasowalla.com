class Clock {
  private _value: number;
  public callback?: (time: number) => void;
  private timeoutId: ReturnType<typeof setInterval> | null;

  constructor() {
    this._value = 0;
    this.timeoutId = null;
  }

  set value(value: number) {
    this._value = value;

    if (this.callback) {
      this.callback(value);
    }
  }

  get value(): number {
    return this._value;
  }

  start(): void {
    this.timeoutId = setInterval(() => {
      this.value += 1;
      if (this.callback) {
        this.callback(this.value);
      }
    }, 1000);
  }

  pause(): void {
    if (this.timeoutId !== null) {
      clearInterval(this.timeoutId);
      this.timeoutId = null;
    }
  }

  stop(): void {
    this.pause();
    this.value = 0;
  }

  restart(): void {
    this.value = 0;
    this.start();
  }
}

export default Clock;
