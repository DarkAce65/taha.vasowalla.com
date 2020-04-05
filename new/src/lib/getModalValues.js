import UIkit from 'uikit';

import DeferredPromise from './DeferredPromise';
import { getElOrThrow } from './getEl';

const MODAL_FETCHER_ACTIVE = 'MODAL_FETCHER_ACTIVE';

const getModalValues = (modalEl, submitButton, inputEls) => {
  const resolvedModalEl = getElOrThrow(modalEl);
  if (resolvedModalEl.dataset[MODAL_FETCHER_ACTIVE]) {
    throw new Error(`${modalEl} is already in use by another value fetcher`);
  }
  resolvedModalEl.dataset[MODAL_FETCHER_ACTIVE] = true;
  const resolvedSubmitButton = getElOrThrow(submitButton, modalEl);

  const modal = UIkit.modal(modalEl);
  const deferred = new DeferredPromise();

  const onSubmit = () => {
    removeListeners();
    if (inputEls) {
      const inputValues = inputEls.map((input) => getElOrThrow(input, modalEl).value);
      deferred.resolve(inputValues);
    } else {
      deferred.resolve();
    }
    modal.hide();
  };

  const onHide = () => {
    removeListeners();
    deferred.reject();
  };

  function removeListeners() {
    resolvedSubmitButton.removeEventListener('click', onSubmit);
    resolvedModalEl.removeEventListener('hide', onHide);
    delete resolvedModalEl.dataset[MODAL_FETCHER_ACTIVE];
  }

  modal.show();
  resolvedSubmitButton.addEventListener('click', onSubmit);
  resolvedModalEl.addEventListener('hide', onHide);

  return deferred.promise;
};

export default getModalValues;
