import reflow from './reflow';
import getTransitionDuration from './getTransitionDuration';

class SimpleModal {
  constructor({ selector, onOpenChange }) {
    this._selector = selector;
    this._element = null;
    this._innerContent = null;
    this._overlay = null;
    this._animating = false;
    this._open = false;
    this._onOpenChange = onOpenChange;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', this.initialize.bind(this));
    } else {
      this.initialize();
    }
  }

  initialize() {
    this._element = document.querySelector(this._selector);
    this._element.classList.add('modal--closed');
    this._innerContent = this._element.querySelector('.modal__inner');
    this._overlay = document.createElement('div');
    this._overlay.classList.add('modal__overlay');
  }

  open() {
    if (this._open || this._animating) {
      return;
    }

    this._animating = true;

    const modalDuration = getTransitionDuration(this._innerContent);
    const overlayDuration = getTransitionDuration(this._overlay);

    this._element.classList.remove('modal--closed');
    document.body.appendChild(this._overlay);
    reflow(this._element);
    reflow(this._overlay);
    this._element.classList.add('modal--visible');
    this._overlay.classList.add('modal__overlay--visible');

    setTimeout(() => {
      this._animating = false;
      this._open = true;

      if (this._onOpenChange) {
        this._onOpenChange(this._open);
      }
    }, Math.max(modalDuration, overlayDuration));
  }

  close() {
    if (!this._open || this._animating) {
      return;
    }

    this._animating = true;

    this._element.classList.remove('modal--visible');
    this._overlay.classList.remove('modal__overlay--visible');

    const modalDuration = getTransitionDuration(this._innerContent);
    const overlayDuration = getTransitionDuration(this._overlay);
    setTimeout(() => this._element.classList.add('modal--closed'), modalDuration);
    setTimeout(() => this._overlay.parentNode.removeChild(this._overlay), overlayDuration);

    setTimeout(() => {
      this._animating = false;
      this._open = false;

      if (this._onOpenChange) {
        this._onOpenChange(this._open);
      }
    }, Math.max(modalDuration, overlayDuration));
  }
}

export default SimpleModal;
