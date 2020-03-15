import { getElOrThrow } from './getEl';
import makeToggleWrapper from './makeToggleWrapper';

class ValidatedInput {
  constructor(
    inputElement,
    { validationMessageElement, validator, stateCallback, inputCallback } = {}
  ) {
    this.input = getElOrThrow(inputElement);

    this._state = 'default';

    if (validationMessageElement) {
      this._validationMessage = getElOrThrow(validationMessageElement);
    } else {
      this._validationMessage = document.createElement('div');
      this.input.insertAdjacentElement('afterend', this._validationMessage);
    }

    this._validationMessage.setAttribute('hidden', '');
    this._validationMessageToggle = makeToggleWrapper(this._validationMessage, {
      animation: 'uk-animation-slide-top-small',
      mode: null,
    });
    this._listener = null;

    if (validator) {
      this.setValidation(validator, { stateCallback, inputCallback });
    }
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

  getValue() {
    return this.input.value;
  }

  getState() {
    return this._state;
  }

  removeValidation() {
    if (this._listener !== null) {
      this.input.removeEventListener('input', this._listener);
      this._listener = null;
    }
  }

  setValidation(validator, { stateCallback, inputCallback } = {}) {
    this.removeValidation();
    this._listener = () => {
      const validation = validator(this.getValue());

      if (!validation) {
        this._setState('default', stateCallback);
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

        if (validation.type && this._validationMessage.textContent) {
          this._validationMessageToggle.show();
        } else {
          this._validationMessageToggle.hide();
        }
      }

      if (inputCallback) {
        inputCallback(this.getValue(), this.getState());
      }
    };

    this.input.addEventListener('input', this._listener);
  }

  reset() {
    this.input.value = '';
    this._setState('default');
  }
}

export default ValidatedInput;
