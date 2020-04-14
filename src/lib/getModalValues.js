import UIkit from 'uikit';

import DeferredPromise from './DeferredPromise';
import { getElOrThrow } from './getEl';

const activeModalFetcherKey = 'modalFetcherActive';

const getModalValues = (modalEl, submitButton, inputEls) => {
  const resolvedModalEl = getElOrThrow(modalEl);
  if (resolvedModalEl.dataset[activeModalFetcherKey]) {
    throw new Error(`${modalEl} is already in use by another value fetcher`);
  }
  resolvedModalEl.dataset[activeModalFetcherKey] = true;
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
    delete resolvedModalEl.dataset[activeModalFetcherKey];
  }

  modal.show();
  resolvedSubmitButton.addEventListener('click', onSubmit);
  resolvedModalEl.addEventListener('hide', onHide);

  return deferred.promise;
};

export default getModalValues;
