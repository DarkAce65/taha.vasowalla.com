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

  get value() {
    return this._value;
  }

  start() {
    this.timeoutId = setInterval(() => {
      this.value += 1;
      if (this.callback) {
        this.callback(this.value);
      }
    }, 1000);
  }

  pause() {
    if (this.timeoutId !== null) {
      clearInterval(this.timeoutId);
      this.timeoutId = null;
    }
  }

  stop() {
    this.pause();
    this.value = 0;
  }

  restart() {
    this.value = 0;
    this.start();
  }
}

export default Clock;
