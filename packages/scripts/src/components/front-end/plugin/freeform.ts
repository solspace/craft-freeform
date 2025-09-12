import events from '@lib/plugin/constants/event-types';
import { SuccessBehavior } from '@lib/plugin/constants/form';
import BackButtonHandler from '@lib/plugin/handlers/fields/back-button';
import CardsHandler from '@lib/plugin/handlers/fields/cards';
import DatePickerHandler from '@lib/plugin/handlers/fields/datepicker';
import DragAndDropHandler from '@lib/plugin/handlers/fields/drag-and-drop';
import InputMaskHandler from '@lib/plugin/handlers/fields/input-mask';
import RatingHandler from '@lib/plugin/handlers/fields/rating';
import SignatureHandler from '@lib/plugin/handlers/fields/signature';
import TableHandler from '@lib/plugin/handlers/fields/table';
import GoogleTagManager from '@lib/plugin/handlers/form/google-tag-manager';
import RuleHandler from '@lib/plugin/handlers/form/rules';
import SaveFormHandler from '@lib/plugin/handlers/form/save-form';
import { ajax } from '@lib/plugin/helpers/ajax';
import { isSafari } from '@lib/plugin/helpers/browser-check';
import { fetchCsrf } from '@lib/plugin/helpers/csrf';
import { dispatchCustomEvent } from '@lib/plugin/helpers/event-handling';
import type { Callback, FreeformResponseWithToken } from 'types/events';
import type { FreeformEventParameters, FreeformHandler, FreeformHandlerConstructor, FreeformOptions } from 'types/form';

import { removeFieldMessages, removeMessages } from './errors/errors.remove';
import { renderErrors, renderFieldErrors, renderSuccess } from './errors/errors.render';

export default class Freeform {
  static _BACK_BUTTON_NAME = 'form_previous_page_button';
  static instances = new WeakMap<HTMLFormElement, Freeform>();

  id: string;
  form: HTMLFormElement;
  options: FreeformOptions = {
    ajax: false,
    disableReset: false,
    disableSubmit: false,
    autoScroll: false,
    scrollToAnchor: false,
    scrollOffset: 0,
    scrollElement: window,
    showProcessingSpinner: false,
    showProcessingText: false,
    processingText: null,
    prevButtonName: 'form_previous_page_button',

    skipHtmlReload: false,

    successBannerMessage: 'Form has been submitted successfully!',
    errorBannerMessage: 'Sorry, there was an error submitting the form. Please try again.',

    errorClassBanner: 'freeform-form-errors',
    errorClassList: 'freeform-errors',
    errorClassField: 'freeform-has-errors',
    successClassBanner: 'freeform-form-success',

    removeMessages: null,
    renderSuccess: null,
    renderFormErrors: null,
    renderFieldErrors: null,
  };

  _initializedHandlers: FreeformHandler[] = [];
  _handlers: FreeformHandlerConstructor[] = [
    BackButtonHandler,
    RuleHandler,
    DatePickerHandler,
    InputMaskHandler,
    RatingHandler,
    SignatureHandler,
    TableHandler,
    GoogleTagManager,
    DragAndDropHandler,
    SaveFormHandler,
    CardsHandler,
  ];

  _lastButtonPressed?: HTMLButtonElement;
  _lockList: Set<string> = new Set<string>();
  _disableList: Set<string> = new Set<string>();

  static getInstance = (form: HTMLFormElement): Freeform => Freeform.instances.get(form);

  constructor(form: HTMLFormElement) {
    if (Freeform.instances.get(form)) {
      return Freeform.instances.get(form);
    }

    this.id = form.dataset.id;
    this.form = form;

    this._setInstances();

    const options: FreeformOptions = {
      ajax: form.getAttribute('data-ajax') !== null,
      disableReset: form.getAttribute('data-disable-reset') !== null,
      scrollToAnchor: form.getAttribute('data-scroll-to-anchor') !== null,
      autoScroll: form.getAttribute('data-auto-scroll') !== null,
      disableSubmit: form.getAttribute('data-disable-submit') !== null,
      showProcessingSpinner: form.getAttribute('data-show-processing-spinner') !== null,
      showProcessingText: form.getAttribute('data-show-processing-text') !== null,
      processingText: form.getAttribute('data-processing-text'),
      successBannerMessage: form.getAttribute('data-success-message'),
      errorBannerMessage: form.getAttribute('data-error-message'),
      skipHtmlReload: form.getAttribute('data-skip-html-reload') !== null,
    };

    this.options = {
      ...this.options,
      ...options,
    };

    this.disableSubmit('init');

    const stateCheck = setInterval(async () => {
      if (document.readyState === 'complete') {
        clearInterval(stateCheck);

        const readyEvent = this._dispatchEvent(events.form.ready, { options: {} });

        this.options = {
          ...this.options,
          ...readyEvent.options,
        };

        this._setUp();
        this._initHandlers();

        this.enableSubmit('init');

        const { scrollToAnchor } = this.options;
        if (scrollToAnchor) {
          this._scrollToForm();
        }
      }
    }, 50);
  }

  _scrollToForm = (): void => {
    const { scrollOffset, scrollElement } = this.options;
    const y = this.form.getBoundingClientRect().top + window.scrollY + scrollOffset;
    scrollElement.scrollTo({ top: y, behavior: this._isReducedMotion() ? 'instant' : 'smooth' });
  };

  _isReducedMotion = (): boolean => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    return !mediaQuery || mediaQuery.matches;
  };

  _setUp = (): void => {
    this._attachListeners();

    const submitButtons = this._getSubmitButtons();
    submitButtons.forEach((button) => {
      button.dataset.originalText = button.innerHTML;
      button.dataset.processingText = this.options.processingText;
    });
  };

  _initHandlers = () => {
    this._handlers.forEach((handler) => {
      this._initializedHandlers.push(new handler(this));
    });
  };

  _resetHandlers = (): void => {
    this._initializedHandlers.forEach((handler) => (handler.reload ? handler.reload() : null));
  };

  has = (attribute: string): boolean => {
    return this.form.getAttribute(attribute) !== null;
  };

  setOption = <K extends keyof FreeformOptions>(name: K, value: FreeformOptions[K]) => {
    this.options[name] = value;
  };

  disableForm = (): void => {
    this.form.dataset.freeformDisabled = '';
  };

  enableForm = (): void => {
    delete this.form.dataset.freeformDisabled;
  };

  disableSubmit = (id: string = 'freeform') => {
    this._disableList.add(id);

    const submitButtons = Array.from(this._getSubmitButtons());
    for (const submit of submitButtons) {
      submit.disabled = true;
      submit.ariaDisabled = 'true';
      submit.dataset.disabled = 'true';
    }
  };

  enableSubmit = (id: string = 'freeform') => {
    this._disableList.delete(id);

    if (this._disableList.size > 0) {
      return;
    }

    const submitButtons = Array.from(this._getSubmitButtons());
    for (const submit of submitButtons) {
      submit.disabled = false;
      submit.ariaDisabled = undefined;
      delete submit.dataset.disabled;
    }
  };

  lockSubmit = (id: string = 'freeform') => {
    this._lockList.add(id);

    // Perform the actual lock only initially
    if (this._lockList.size > 1) {
      return;
    }

    const { disableSubmit, showProcessingSpinner, showProcessingText } = this.options;

    if (disableSubmit) {
      this.disableSubmit(id);
    }

    let lastButton: HTMLButtonElement | undefined = this._lastButtonPressed;
    if (!lastButton) {
      lastButton = (this._getSubmitButtons()[0] as HTMLButtonElement) || undefined;
    }

    if (lastButton) {
      if (showProcessingSpinner) {
        lastButton.classList.add('freeform-processing');
      }

      if (showProcessingText) {
        lastButton.innerHTML = lastButton.dataset.processingText;
      }
    }
  };

  unlockSubmit = (id: string = 'freeform'): void => {
    this._lockList.delete(id);
    if (this._lockList.size > 0) {
      return;
    }

    this._unlockSubmitButtons(id);
  };

  forceUnlockSubmit = (): void => {
    this._lockList.clear();
    this._unlockSubmitButtons();
  };

  triggerResubmit = (): void => {
    this.unlockSubmit();

    if (this._lastButtonPressed) {
      this._lastButtonPressed.click();
    } else {
      this.triggerSubmit();
    }
  };

  triggerSubmit = (): void => {
    this.unlockSubmit();

    const submitButton = this._getMainSubmitButton();
    if (submitButton) {
      submitButton.click();
    }
  };

  _unlockSubmitButtons = (id?: string): void => {
    const { disableSubmit, showProcessingSpinner, showProcessingText } = this.options;

    if (disableSubmit) {
      this.enableSubmit(id);
    }

    const submitButtons = this._getSubmitButtons();
    for (let i = 0; i < submitButtons.length; i++) {
      const submit = submitButtons[i];

      if (showProcessingSpinner) {
        submit.classList.remove('freeform-processing');
      }

      if (showProcessingText) {
        submit.innerHTML = submit.dataset.originalText;
      }
    }
  };

  _setInstances = (): void => {
    const { form } = this;

    Freeform.instances.set(form, this);
    form.freeform = this;
  };

  /**
   * Attaches event listeners
   */
  _attachListeners = (): void => {
    const form = this.form;
    const hasFormListeners = form.dataset.formListenersAttached === '1';
    if (!hasFormListeners) {
      form.dataset.formListenersAttached = '1';
    }

    const actionInput = this.form.querySelector<HTMLInputElement>('input[name=freeform-action]');
    const actionButtons = form.querySelectorAll<HTMLButtonElement>('[data-freeform-action]');

    if (actionInput) {
      actionButtons.forEach((button) =>
        button.addEventListener('click', () => {
          this._lastButtonPressed = button;
          actionInput.value = button.getAttribute('data-freeform-action');
        })
      );
    }

    if (!hasFormListeners) {
      if (actionInput) {
        form.addEventListener(events.form.ajaxAfterSubmit, () => {
          actionInput.value = 'submit';
        });
      }

      form.addEventListener('submit', this._onSubmit);
      form.addEventListener('keydown', (event: KeyboardEvent) => {
        const isEnter = event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.metaKey;
        const isInput = event.target instanceof HTMLInputElement;
        if (isEnter && isInput) {
          event.preventDefault();
          event.stopPropagation();

          const submitButton = this._getMainSubmitButton();
          if (submitButton) {
            this.triggerSubmit();
          }
        }
      });
    }

    const inputs = form.querySelectorAll<HTMLInputElement>('input, select, textarea');
    inputs.forEach((input) =>
      input.addEventListener('change', (event) => {
        this._removeMessageFromField(event.target as HTMLInputElement);
      })
    );
  };

  /**
   * Perform form submit
   */
  _onSubmit = async (event: SubmitEvent) => {
    this.lockSubmit();

    event.preventDefault();
    event.stopPropagation();

    const {
      options: { ajax },
    } = this;

    const pressedButton = event.submitter as HTMLButtonElement;
    let isBackButtonPressed = false;
    if (pressedButton && pressedButton.name && pressedButton.name === Freeform._BACK_BUTTON_NAME) {
      isBackButtonPressed = true;
    }

    const submitCallbacks: Record<number, Callback[]> = {};

    const onSubmitEvent = this._dispatchEvent(events.form.submit, {
      isBackButtonPressed,
      cancelable: true,
      addCallback: (callback: Callback, priority: number = 0): void => {
        if (submitCallbacks[priority] === undefined) {
          submitCallbacks[priority] = [];
        }

        submitCallbacks[priority].push(callback);
      },
    });

    if (onSubmitEvent.defaultPrevented) {
      this.forceUnlockSubmit();
      this._dispatchEvent(events.form.afterFailedSubmit, { cancelable: false });

      return false;
    }

    const sortedCallbacks = Object.entries(submitCallbacks)
      .sort(([priorityA], [priorityB]) => Number(priorityA) - Number(priorityB))
      .flatMap(([, callbackList]) => callbackList);

    for (const callback of sortedCallbacks) {
      const callbackResult = await callback();
      if (callbackResult === false) {
        this.forceUnlockSubmit();
        this._dispatchEvent(events.form.afterFailedSubmit, { cancelable: false });
        return false;
      }
    }

    if (ajax) {
      this._onSubmitAjax(event);

      return false;
    }

    const csrf = await fetchCsrf();
    if (csrf) {
      let csrfInput = this.form.querySelector<HTMLInputElement>(`input[name="${csrf.name}"]`);
      if (!csrfInput) {
        csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = csrf.name;
        this.form.appendChild(csrfInput);
      }

      csrfInput.value = csrf.value;
    }

    this.form.submit();
  };

  /**
   * Removes all success and error messages
   */
  _removeMessages = (): void => {
    const event = this._dispatchEvent(events.form.removeMessages);
    if (event.defaultPrevented) {
      return;
    }

    if (typeof this.options.removeMessages === 'function') {
      this.options.removeMessages = this.options.removeMessages.bind(this);
      return this.options.removeMessages();
    }

    removeMessages.call(this);
  };

  _removeMessageFromField = (field: HTMLInputElement): void => {
    const event = this._dispatchEvent(events.form.fieldRemoveMessages, { field });
    if (event.defaultPrevented) {
      return;
    }

    const container = field.closest<HTMLElement>('[data-field-container]');
    removeFieldMessages(container);
  };

  /**
   * Renders the successful form submit message
   *
   * @returns {*}
   * @private
   */
  _renderSuccessBanner = (): void => {
    const event = this._dispatchEvent(events.form.renderSuccess);
    if (event.defaultPrevented) {
      return;
    }

    if (typeof this.options.renderSuccess === 'function') {
      this.options.renderSuccess = this.options.renderSuccess.bind(this);
      return this.options.renderSuccess();
    }

    renderSuccess.call(this);
  };

  _renderFieldErrors = (errors: Record<string, string[]>) => {
    const event = this._dispatchEvent(events.form.renderFieldErrors, { errors });
    if (event.defaultPrevented) {
      return false;
    }

    if (typeof this.options.renderFieldErrors === 'function') {
      this.options.renderFieldErrors = this.options.renderFieldErrors.bind(this);
      return this.options.renderFieldErrors(errors);
    }

    renderFieldErrors.call(this, errors);
  };

  _renderFormErrors = (errors: string[]) => {
    const event = this._dispatchEvent(events.form.renderFormErrors, { errors });
    if (event.defaultPrevented) {
      return false;
    }

    if (typeof this.options.renderFormErrors === 'function') {
      this.options.renderFormErrors = this.options.renderFormErrors.bind(this);
      return this.options.renderFormErrors(errors);
    }

    renderErrors.call(this, errors);
  };

  _prepareFormData = () => {
    const { form } = this;

    const data = new FormData(form);

    // Safari hack - remove empty file upload inputs
    // Otherwise an ajax call with empty file uploads causes immense lag
    if (isSafari()) {
      for (let i = 0; i < form.elements.length; i++) {
        const element = form.elements[i] as HTMLInputElement;

        if (element.type === 'file') {
          if (element.value === '') {
            data.delete(element.name);
          }
        }
      }
    }

    return data;
  };

  quickSave = async (secret: string, token?: string): Promise<string | false | undefined> => {
    const { form } = this;
    const data = this._prepareFormData();
    data.set('action', 'freeform/submit/quick-save');
    data.set('storage-secret', secret);
    if (token) {
      data.set('token', token);
    }

    let response;
    try {
      response = await ajax<FreeformResponseWithToken>(form.getAttribute('action') || window.location.href, {
        method: form.getAttribute('method'),
        data,
      });
    } catch (error) {
      if (error?.response?.status === 417) {
        this.unlockSubmit();

        return false;
      }
    }

    this._removeMessages();

    const responseData = response.data;

    if (response.status === 200) {
      const { success, errors, formErrors, storageToken } = responseData;

      if (success) {
        return storageToken;
      }

      if (errors || formErrors) {
        this._dispatchEvent(events.form.ajaxError, { request: response, response: responseData, errors, formErrors });
        this._dispatchEvent(events.form.afterFailedSubmit, { cancelable: false });
        this._renderFieldErrors(errors);
        this._renderFormErrors(formErrors);
      }

      if (this.options.autoScroll) {
        this._scrollToForm();
      }
    } else {
      this._dispatchEvent(events.form.ajaxError, { request: response, response: responseData });
      this._dispatchEvent(events.form.afterFailedSubmit, { cancelable: false });
    }

    this.unlockSubmit();

    return;
  };

  _onSubmitAjax = (event: SubmitEvent) => {
    const { form } = this;

    const data = this._prepareFormData();
    const request = new XMLHttpRequest();

    const submitter = event.submitter as HTMLButtonElement | undefined;
    if (submitter && submitter.name) {
      data.append(submitter.name, '1');
    }

    const method = form.getAttribute('method') || 'POST';
    const url = form.getAttribute('action') || window.location.href;

    const submitEvent = this._dispatchEvent(events.form.ajaxBeforeSubmit, { data, request });
    if (submitEvent.defaultPrevented) {
      return;
    }

    ajax(url, {
      data,
      method,
      request,
    }).then((serverResponse) => {
      this._removeMessages();

      if (serverResponse.status === 200) {
        const response = serverResponse.data as FreeformResponseWithToken;
        const { success, finished, actions = [], errors, formErrors, returnUrl } = response;

        const onBeforeSuccess = this._dispatchEvent(events.form.ajaxBeforeSuccess, { request, response });
        if (onBeforeSuccess.defaultPrevented) {
          return;
        }

        if (!actions.length) {
          if (success) {
            if (finished && response.onSuccess === SuccessBehavior.RedirectReturnUrl && returnUrl) {
              const redirectEvent = this._dispatchEvent(events.form.ajaxSuccess, { request, response });

              if (redirectEvent.defaultPrevented) {
                return;
              }

              window.location.href = returnUrl;
              return;
            }

            if (response.html !== null && !this.options.skipHtmlReload) {
              form.innerHTML = response.html.replace(/<form[^>]*>/, '').replace('</form>', '');
            }

            if (!this.options.skipHtmlReload) {
              this._resetHandlers();
              this._setUp();
            }

            if (finished) {
              if (!this.options.disableReset) {
                // Reset the form so that the user may enter fresh information
                // if a submission is not being edited
                form.reset();
                this._dispatchEvent(events.form.reset);
              }

              if (response.onSuccess === SuccessBehavior.Reload) {
                this._renderSuccessBanner();
              }
            }

            this._dispatchEvent(events.form.ajaxSuccess, { request, response });
          } else if (errors || formErrors) {
            this._dispatchEvent(events.form.ajaxError, { request, response, errors, formErrors });
            this._dispatchEvent(events.form.afterFailedSubmit, { cancelable: false });
            this._renderFieldErrors(errors);
            this._renderFormErrors(formErrors);
          }
        } else {
          this._dispatchEvent(events.form.handleActions, { response, actions, cancelable: false });
        }

        const payload = response?.freeform_payload;
        if (payload) {
          const payloadInput = form.querySelector<HTMLInputElement>('input[name^=freeform_payload]');
          if (payloadInput) {
            payloadInput.value = payload;
          }
        }

        this._dispatchEvent(events.form.ajaxAfterSubmit, {
          data,
          request,
          response,
          cancelable: false,
        });

        if (this.options.autoScroll) {
          this._scrollToForm();
        }
      } else {
        const response = request.response;

        this._dispatchEvent(events.form.ajaxError, { request, response });
      }

      this.unlockSubmit();
    });
  };

  _getMainSubmitButton = (): HTMLButtonElement | HTMLInputElement | undefined =>
    this.form.querySelector<HTMLButtonElement | HTMLInputElement>(`*[type=submit][data-freeform-action="submit"]`);

  _getSubmitButtons = (): NodeListOf<HTMLButtonElement | HTMLInputElement> => {
    const buttons = this.form.querySelectorAll<HTMLButtonElement | HTMLInputElement>(
      `*[type=submit][data-freeform-action]`
    );

    if (buttons.length) {
      return buttons;
    }

    // Fallback to any submit buttons if none have the `data-freeform-action` attribute
    return this.form.querySelectorAll(`*[type=submit]`);
  };

  _getBackButtons = (): NodeListOf<HTMLButtonElement | HTMLInputElement> => {
    return this.form.querySelectorAll<HTMLButtonElement | HTMLInputElement>(
      `*[type=submit][data-freeform-action="back"]`
    );
  };

  _dispatchEvent = <T extends object = Record<string, never>>(
    name: string,
    parameters?: FreeformEventParameters<T>,
    element?: HTMLElement
  ): Event & T => {
    const event = dispatchCustomEvent(
      name,
      {
        ...parameters,
        form: this.form,
        freeform: this,
      },
      element
    );

    document.dispatchEvent(event);
    this.form.dispatchEvent(event);

    return event;
  };
}

// Attach to all forms
const forms = document.querySelectorAll<HTMLFormElement>('form[data-freeform]');
forms.forEach((form) => {
  new Freeform(form);
});

const recursiveFreeformAttachment = (node: HTMLFormElement) => {
  if (node.nodeName === 'FORM' && node.dataset?.freeform !== undefined) {
    new Freeform(node);
  }

  node?.childNodes.forEach(recursiveFreeformAttachment);
};

// Add an observer which listens for new forms
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type !== 'childList') {
      return;
    }

    mutation.addedNodes.forEach((node) => {
      recursiveFreeformAttachment(node as HTMLFormElement);
    });
  });
});

let retries = 0;
let timeout: ReturnType<typeof setTimeout>;

const runObserver = () => {
  if (retries > 25) {
    console.warn('Freeform observer timed out');
    return clearTimeout(timeout);
  }

  // Start the observer
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    retries++;
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(runObserver, 50);
  }
};

runObserver();
