class DeferredPromise {
  constructor() {
    this.resolved = false;
    this.promise = new Promise((resolve, reject) => {
      this.resolve = (...args) => {
        this.resolved = true;
        resolve(...args);
      };
      this.reject = reject;
    });
  }
}

export default DeferredPromise;
