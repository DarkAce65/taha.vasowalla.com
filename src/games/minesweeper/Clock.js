class Clock {
  constructor() {
    this._value = 0;
    this.callback = null;
    this._timeoutId = null;
  }

  set value(value) {
    this._value = value;

    if (this.callback) {
      this.callback(value);
    }
  }

  get value() {
    return this._value;
  }

  start() {
    this._timeoutId = setInterval(() => {
      this.value += 1;
      if (this.callback) {
        this.callback(this.value);
      }
    }, 1000);
  }

  pause() {
    clearInterval(this._timeoutId);
    this._timeoutId = null;
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
