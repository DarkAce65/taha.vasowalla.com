/* eslint-disable @typescript-eslint/no-explicit-any */

class DeferredPromise<T> {
  resolved = false;

  readonly promise: Promise<T>;
  private resolvePromise: (value?: T) => void;
  private rejectPromise: (reason?: any) => void;

  constructor() {
    this.resolved = false;
    this.promise = new Promise((resolve, reject) => {
      this.resolvePromise = resolve;
      this.rejectPromise = reject;
    });
  }

  resolve(value?: T): void {
    this.resolved = true;
    this.resolvePromise(value);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  reject(reason?: any): void {
    this.rejectPromise(reason);
  }
}

export default DeferredPromise;
