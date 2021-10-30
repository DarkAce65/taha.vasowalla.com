import UIkit from 'uikit';

import DeferredPromise from './DeferredPromise';
import { Selector, getElOrThrow } from './getEl';

const MODEL_FETCHER_ACTIVE_KEY = 'MODAL_FETCHER_ACTIVE';

const getModalValues = (
  modalEl: Selector,
  submitButton: Selector<HTMLButtonElement>,
  inputEls?: HTMLInputElement[]
): Promise<string[]> => {
  const resolvedModalEl = getElOrThrow(modalEl);
  if (resolvedModalEl.dataset[MODEL_FETCHER_ACTIVE_KEY]) {
    throw new Error(`${modalEl} is already in use by another value fetcher`);
  }
  resolvedModalEl.dataset[MODEL_FETCHER_ACTIVE_KEY] = 'true';
  const resolvedSubmitButton = getElOrThrow(submitButton, modalEl);

  const modal = UIkit.modal(modalEl);
  const deferred = new DeferredPromise<string[]>();

  const onSubmit = (): void => {
    removeListeners();
    if (inputEls) {
      const inputValues = inputEls.map((input) => getElOrThrow(input).value);
      deferred.resolve(inputValues);
    } else {
      deferred.resolve([]);
    }
    modal.hide();
  };

  const onHide = (): void => {
    removeListeners();
    deferred.reject();
  };

  function removeListeners(): void {
    resolvedSubmitButton.removeEventListener('click', onSubmit);
    resolvedModalEl.removeEventListener('hide', onHide);
    delete resolvedModalEl.dataset[MODEL_FETCHER_ACTIVE_KEY];
  }

  modal.show();
  resolvedSubmitButton.addEventListener('click', onSubmit);
  resolvedModalEl.addEventListener('hide', onHide);

  return deferred.promise;
};

export default getModalValues;
