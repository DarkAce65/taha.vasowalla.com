import ToggleWrapper from './ToggleWrapper';
import { getElOrThrow } from './getEl';

class ValidatedInput {
  constructor(
    inputElement,
    { validationMessageElement, validator, stateCallback, inputCallback } = {}
  ) {
    this.input = getElOrThrow(inputElement);

    this._enableValidation = true;
    this._state = 'empty';
    this._listener = null;
    this._boundBlurListener = this._blurListener.bind(this, stateCallback);

    if (validationMessageElement) {
      this._validationMessage = getElOrThrow(validationMessageElement);
    } else {
      this._validationMessage = document.createElement('div');
      this.input.insertAdjacentElement('afterend', this._validationMessage);
    }

    this._validationMessage.setAttribute('hidden', '');
    this._validationMessageToggle = new ToggleWrapper(this._validationMessage, {
      animation: 'uk-animation-slide-top-small',
      mode: null,
    });

    ['beforeshow', 'show', 'shown', 'beforehide', 'hide', 'hidden'].forEach((eventType) =>
      this._validationMessage.addEventListener(eventType, (ev) => {
        if (ev.target === this._validationMessage) {
          ev.stopPropagation();
        }
      })
    );

    this.setValidation(validator, { stateCallback, inputCallback });
  }

  get enableValidation() {
    return this._enableValidation;
  }

  set enableValidation(value) {
    this._enableValidation = value;
    this.revalidate();
  }

  getValue() {
    return this.input.value;
  }

  setValue(value) {
    this.input.value = value;
    this.revalidate();
  }

  getState() {
    return this._state;
  }

  _setState(state, stateCallback = false) {
    if (state === this._state) {
      return;
    }

    switch (state) {
      case 'error':
        this._state = 'error';
        this.input.classList.remove('uk-form-success');
        this._validationMessage.classList.remove('uk-text-success');
        this.input.classList.add('uk-form-danger');
        this._validationMessage.classList.add('uk-text-danger');
        break;
      case 'success':
        this._state = 'success';
        this.input.classList.remove('uk-form-danger');
        this._validationMessage.classList.remove('uk-text-danger');
        this.input.classList.add('uk-form-success');
        this._validationMessage.classList.add('uk-text-success');
        break;
      case 'empty':
        this._state = 'empty';
        this.input.classList.remove('uk-form-success', 'uk-form-danger');
        this._validationMessage.classList.remove('uk-text-success', 'uk-text-danger');
        break;
      default:
        this._state = 'default';
        this.input.classList.remove('uk-form-success', 'uk-form-danger');
        this._validationMessage.classList.remove('uk-text-success', 'uk-text-danger');
        break;
    }

    if (stateCallback) {
      stateCallback(this._state);
    }
  }

  _blurListener(stateCallback) {
    if (!this._enableValidation) {
      return;
    }

    if (this.input.checkValidity && this.input.reportValidity) {
      if (!this.input.checkValidity()) {
        this.input.reportValidity();
        this._setState('error', stateCallback);
      }
    } else {
      this.setValue(this.getValue());
    }
  }

  removeValidation() {
    if (this._listener !== null) {
      this.input.removeEventListener('input', this._listener);
      this._listener = null;
    }
    if (this._boundBlurListener !== null) {
      this.input.removeEventListener('blur', this._boundBlurListener);
      this._boundBlurListener = null;
    }
  }

  setValidation(validator, { stateCallback, inputCallback } = {}) {
    this.removeValidation();
    this._listener = () => {
      if (
        this._enableValidation &&
        this.input.checkValidity &&
        this.input.reportValidity &&
        !this.input.checkValidity()
      ) {
        this._setState('error', stateCallback);
        this._validationMessageToggle.hide();
      } else {
        const validation = this._enableValidation && validator ? validator(this.getValue()) : false;

        if (!validation) {
          this._setState(this.getValue().length === 0 ? 'empty' : 'default', stateCallback);
          this._validationMessageToggle.hide();
        } else if (typeof validation === 'string') {
          this._setState('error', stateCallback);
          this._validationMessage.textContent = validation;
          this._validationMessageToggle.show();
        } else {
          this._setState(validation.type, stateCallback);
          if (validation.message) {
            this._validationMessage.textContent = validation.message;
          }

          if (this._validationMessage.textContent) {
            this._validationMessageToggle.show();
          } else {
            this._validationMessageToggle.hide();
          }
        }
      }

      if (inputCallback) {
        inputCallback(this.getValue(), this.getState());
      }
    };
    this._boundBlurListener = this._blurListener.bind(this, stateCallback);

    this.input.addEventListener('input', this._listener);
    this.input.addEventListener('blur', this._boundBlurListener);
  }

  revalidate() {
    this._listener();
  }

  reset() {
    this.setValue('');
  }
}

export default ValidatedInput;
