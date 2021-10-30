import ToggleWrapper from './ToggleWrapper';
import { Selector, getElOrThrow } from './getEl';

type State = 'empty' | 'default' | 'success' | 'error';

type Validator = (input: string) => { type: State; message?: string } | string | false;

type StateCallback = (state: State) => void;
type InputCallback = (input: string, state: State) => void;

interface ValidatedInputOptions {
  customValidator?: Validator;
  validationMessageElement?: Selector;
  stateCallback?: StateCallback;
  inputCallback?: InputCallback;
}

class ValidatedInput {
  private readonly _input: HTMLInputElement;
  private readonly validationMessage: HTMLElement;
  private readonly validationMessageToggle: ToggleWrapper;

  private _enableValidation = true;
  private _state: State;

  private listener?: () => void;
  private boundBlurListener?: () => void;

  constructor(
    inputElement: Selector<HTMLInputElement>,
    {
      customValidator,
      validationMessageElement,
      stateCallback,
      inputCallback,
    }: ValidatedInputOptions = {}
  ) {
    this._input = getElOrThrow<HTMLInputElement>(inputElement);
    this._state = 'empty';

    if (validationMessageElement) {
      this.validationMessage = getElOrThrow(validationMessageElement);
    } else {
      this.validationMessage = document.createElement('div');
      this._input.insertAdjacentElement('afterend', this.validationMessage);
    }

    this.validationMessage.setAttribute('hidden', '');
    this.validationMessageToggle = new ToggleWrapper(this.validationMessage, {
      animation: 'uk-animation-slide-top-small',
      mode: '',
    });

    ['beforeshow', 'show', 'shown', 'beforehide', 'hide', 'hidden'].forEach((eventType) =>
      this.validationMessage.addEventListener(eventType, (ev) => {
        if (ev.target === this.validationMessage) {
          ev.stopPropagation();
        }
      })
    );

    this._setValidation(customValidator, { stateCallback, inputCallback });
  }

  get enableValidation(): boolean {
    return this._enableValidation;
  }

  set enableValidation(value: boolean) {
    this._enableValidation = value;
    this.revalidate();
  }

  get input(): HTMLInputElement {
    return this._input;
  }

  get value(): string {
    return this._input.value;
  }

  set value(value: string) {
    this._input.value = value;
    this.revalidate();
  }

  get state(): State {
    return this._state;
  }

  private setState(state: State, stateCallback?: StateCallback): void {
    if (state === this._state) {
      return;
    }

    switch (state) {
      case 'error':
        this._state = 'error';
        this._input.classList.remove('uk-form-success');
        this.validationMessage.classList.remove('uk-text-success');
        this._input.classList.add('uk-form-danger');
        this.validationMessage.classList.add('uk-text-danger');
        break;
      case 'success':
        this._state = 'success';
        this._input.classList.remove('uk-form-danger');
        this.validationMessage.classList.remove('uk-text-danger');
        this._input.classList.add('uk-form-success');
        this.validationMessage.classList.add('uk-text-success');
        break;
      case 'empty':
        this._state = 'empty';
        this._input.classList.remove('uk-form-success', 'uk-form-danger');
        this.validationMessage.classList.remove('uk-text-success', 'uk-text-danger');
        break;
      default:
        this._state = 'default';
        this._input.classList.remove('uk-form-success', 'uk-form-danger');
        this.validationMessage.classList.remove('uk-text-success', 'uk-text-danger');
        break;
    }

    if (stateCallback) {
      stateCallback(this._state);
    }
  }

  private blurListener(stateCallback?: StateCallback): void {
    if (!this.enableValidation) {
      return;
    }

    if (this._input.checkValidity && this._input.reportValidity) {
      if (!this._input.checkValidity()) {
        this._input.reportValidity();
        this.setState('error', stateCallback);
      }
    } else {
      // eslint-disable-next-line no-self-assign
      this.value = this.value;
    }
  }

  private _setValidation(
    validator?: Validator,
    {
      stateCallback,
      inputCallback,
    }: { stateCallback?: StateCallback; inputCallback?: InputCallback } = {}
  ): void {
    this.removeValidation();
    this.listener = () => {
      if (this.enableValidation) {
        if (this._input.checkValidity && !this._input.checkValidity()) {
          this.setState('error', stateCallback);
          this.validationMessageToggle.hide();
        } else if (validator) {
          const validation = validator(this.value);

          if (!validation) {
            this.setState(this.value.length === 0 ? 'empty' : 'default', stateCallback);
            this.validationMessageToggle.hide();
          } else if (typeof validation === 'string') {
            this.setState('error', stateCallback);
            this.validationMessage.textContent = validation;
            this.validationMessageToggle.show();
          } else {
            this.setState(validation.type, stateCallback);
            if (validation.message) {
              this.validationMessage.textContent = validation.message;
            }

            if (this.validationMessage.textContent) {
              this.validationMessageToggle.show();
            } else {
              this.validationMessageToggle.hide();
            }
          }
        } else {
          this.setState(this.value.length === 0 ? 'empty' : 'default', stateCallback);
          this.validationMessageToggle.hide();
        }
      }

      if (inputCallback) {
        inputCallback(this.value, this.state);
      }
    };
    this.boundBlurListener = this.blurListener.bind(this, stateCallback);

    this._input.addEventListener('input', this.listener);
    this._input.addEventListener('blur', this.boundBlurListener);
  }

  setValidation(
    validator: Validator,
    callbacks?: { stateCallback?: StateCallback; inputCallback?: InputCallback }
  ): void {
    this._setValidation(validator, callbacks);
  }

  removeValidation(): void {
    if (this.listener) {
      this._input.removeEventListener('input', this.listener);
      this.listener = undefined;
    }
    if (this.boundBlurListener) {
      this._input.removeEventListener('blur', this.boundBlurListener);
      this.boundBlurListener = undefined;
    }
  }

  revalidate(): void {
    if (this.listener) {
      this.listener();
    }
  }

  reset(): void {
    this.value = '';
  }
}

export default ValidatedInput;
