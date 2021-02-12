import * as EventTypes from '@lib/plugin/constants/event-types';
import DatePickerHandler from '@lib/plugin/handlers/fields/datepicker';
import InputMaskHandler from '@lib/plugin/handlers/fields/input-mask';
import SignatureHandler from '@lib/plugin/handlers/fields/signature';
import TableHandler from '@lib/plugin/handlers/fields/table';
import RecaptchaHandler from '@lib/plugin/handlers/form/recaptcha';
import RuleSetHandler from '@lib/plugin/handlers/form/rule-set';
import StripeHandler from '@lib/plugin/handlers/form/stripe-handler';
import GoogleTagManager from '@lib/plugin/handlers/form/google-tag-manager';
import { isSafari } from '@lib/plugin/helpers/browser-check';
import { addClass, getClassArray, removeClass } from '@lib/plugin/helpers/elements';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

export default class Freeform {
  static _BACK_BUTTON_NAME = 'form_previous_page_button';
  static instances = new WeakMap();

  id;
  form;
  options = {
    ajax: false,
    disableSubmit: false,
    scrollToAnchor: false,
    scrollOffset: 0,
    scrollElement: window,
    showSpinner: false,
    showLoadingText: false,
    loadingText: null,
    prevButtonName: 'form_previous_page_button',

    successBannerMessage: 'Form has been submitted successfully!',
    errorBannerMessage: 'Sorry, there was an error submitting the form. Please try again.',

    errorClassBanner: 'ff-form-errors',
    errorClassList: 'ff-errors',
    errorClassField: 'ff-has-errors',
    successClassBanner: 'ff-form-success',

    removeMessages: null,
    renderSuccess: null,
    renderFormErrors: null,
    renderFieldErrors: null,
  };

  _initializedHandlers = [];
  _handlers = [
    StripeHandler,
    RuleSetHandler,
    RecaptchaHandler,
    DatePickerHandler,
    InputMaskHandler,
    SignatureHandler,
    TableHandler,
    GoogleTagManager,
  ];

  _beforeSubmitCallbackStack = [];
  _successfulAjaxSubmitCallbackStack = [];
  _failedAjaxSubmitCallbackStack = [];
  _afterAjaxSubmitCallbackStack = [];
  _ruleSet;
  _stripeHandler;
  _recaptcha;

  /**
   * Get a plugin instance
   *
   * @param {Element} form
   * @returns {Freeform}
   */
  static getInstance = (form) => Freeform.instances.get(form);

  /**
   * Constructor
   *
   * @param {Element} form
   */
  constructor(form) {
    this.id = form.dataset.id;
    this.form = form;

    this.lockSubmit(undefined, true);
    this._setInstances();

    const options = {
      ajax: form.getAttribute('data-ajax') !== null,
      scrollToAnchor: form.getAttribute('data-scroll-to-anchor'),
      disableSubmit: form.getAttribute('data-disable-submit') !== null,
      hasRules: form.getAttribute('data-has-rules') !== null,
      showSpinner: form.getAttribute('data-show-spinner') !== null,
      showLoadingText: form.getAttribute('data-show-loading-text') !== null,
      loadingText: form.getAttribute('data-loading-text'),
      successBannerMessage: form.getAttribute('data-success-message'),
      errorBannerMessage: form.getAttribute('data-error-message'),
    };

    this.options = {
      ...this.options,
      ...options,
    };

    const stateCheck = setInterval(() => {
      if (document.readyState === 'complete') {
        clearInterval(stateCheck);

        const readyEvent = this._dispatchEvent(EventTypes.EVENT_READY, { options: {} });

        this.options = {
          ...this.options,
          ...readyEvent.options,
        };

        this._setUp();
        this._attachListeners();
        this._initHandlers();

        const { scrollToAnchor, scrollOffset, scrollElement } = this.options;
        if (scrollToAnchor) {
          const y = form.getBoundingClientRect().top + window.pageYOffset + scrollOffset;
          scrollElement.scrollTo({ top: y, behavior: 'smooth' });
        }

        this.unlockSubmit(true);
      }
    }, 50);
  }

  _setUp = () => {
    const submitButtons = this.form.querySelectorAll('button[type="submit"]');
    submitButtons.forEach((button) => {
      button.dataset.originalText = button.innerText;
      button.dataset.loadingText = this.options.loadingText;
    });
  };

  _initHandlers = () => {
    this._handlers.forEach((handler) => {
      this._initializedHandlers.push(new handler(this));
    });
  };

  _resetHandlers = () => {
    this._initializedHandlers.forEach((handler) => (handler.reload ? handler.reload() : null));
  };

  /**
   * Allows setting any options
   *
   * @param {string} name
   * @param {*} value
   */
  setOption = (name, value) => {
    this.options[name] = value;
  };

  /**
   * Attach a callback before submit
   *
   * @param {function} callback
   * @deprecated use the `freeform-on-submit` event
   */
  addOnSubmitCallback(callback) {
    if (typeof callback === 'function') {
      this._beforeSubmitCallbackStack.push(callback);
    }
  }

  /**
   * Attach a callback on a successful AJAX request
   *
   * @param {function} callback
   * @deprecated use the `freeform-ajax-success` event
   */
  addOnSuccessfulAjaxSubmit(callback) {
    if (typeof callback === 'function') {
      this._successfulAjaxSubmitCallbackStack.push(callback);
    }
  }

  /**
   * Attach a callback on a failed AJAX request
   *
   * @param {function} callback
   * @deprecated use the `freeform-ajax-error` event
   */
  addOnFailedAjaxSubmit(callback) {
    if (typeof callback === 'function') {
      this._failedAjaxSubmitCallbackStack.push(callback);
    }
  }

  /**
   * Attach a callback on a failed AJAX request
   *
   * @param {function} callback
   * @deprecated use the `freeform-ajax-after-submit` event
   */
  addOnAfterAjaxSubmit(callback) {
    if (typeof callback === 'function') {
      this._afterAjaxSubmitCallbackStack.push(callback);
    }
  }

  lockSubmit = (submitter, force = false) => {
    const { disableSubmit, showSpinner, showLoadingText } = this.options;

    if (submitter && showSpinner) {
      submitter.classList.add('ff-loading');
    }

    if (submitter && showLoadingText) {
      submitter.innerText = submitter.dataset.loadingText;
    }

    const submitButtons = this._getSubmitButtons();
    for (let i = 0; i < submitButtons.length; i++) {
      const submit = submitButtons[i];

      if (disableSubmit || force) {
        submit.disabled = true;
      }
    }
  };

  unlockSubmit = (force = false) => {
    const { disableSubmit, showSpinner, showLoadingText } = this.options;

    const submitButtons = this._getSubmitButtons();
    for (let i = 0; i < submitButtons.length; i++) {
      const submit = submitButtons[i];

      if (disableSubmit || force) {
        submit.disabled = false;
      }

      if (showSpinner) {
        submit.classList.remove('ff-loading');
      }

      if (showLoadingText) {
        submit.innerText = submit.dataset.originalText;
      }
    }
  };

  triggerSubmit = (clickBack = false) => {
    this.unlockSubmit();
    const submitButtons = clickBack ? this._getBackButtons() : this._getSubmitButtons();
    if (submitButtons.length) {
      submitButtons[0].click();
    }
  };

  _setInstances = () => {
    const { form } = this;

    Freeform.instances.set(form, this);
    form.freeform = this;
  };

  /**
   * Attaches event listeners
   *
   * @private
   */
  _attachListeners = () => {
    this.form.addEventListener('submit', this._onSubmit);
    const inputs = this.form.querySelectorAll('input, select, textarea');
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];

      input.addEventListener('change', (event) => {
        this._removeMessageFrom(event.target);
      });
    }
  };

  /**
   * Perform form submit
   *
   * @param {Event} event
   * @returns {boolean}
   * @private
   */
  _onSubmit = (event) => {
    this.lockSubmit(event.submitter);

    const { form, options } = this;
    let callbacksPassThrough = true;

    const pressedButton = event.submitter;
    let isBackButtonPressed = false;
    if (pressedButton && pressedButton.name && pressedButton.name === Freeform._BACK_BUTTON_NAME) {
      isBackButtonPressed = true;
    }

    const onSubmitEvent = this._dispatchEvent(EventTypes.EVENT_ON_SUBMIT, { isBackButtonPressed, cancelable: true });
    if (onSubmitEvent.defaultPrevented) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }

    for (let i = 0; i < this._beforeSubmitCallbackStack.length; i++) {
      const callback = this._beforeSubmitCallbackStack[i];
      const boundCallback = callback.bind(this);
      if (!boundCallback(form, options, isBackButtonPressed)) {
        callbacksPassThrough = false;
      }
    }

    if (!callbacksPassThrough) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }

    if (options.ajax) {
      event.preventDefault();
      event.stopPropagation();

      this._onSubmitAjax(event);

      return false;
    } else {
      if (event.submitter && event.submitter.name === Freeform._BACK_BUTTON_NAME) {
        const back = document.createElement('input');
        back.type = 'hidden';
        back.name = Freeform._BACK_BUTTON_NAME;
        back.value = '';
        this.form.appendChild(back);
      }
    }

    return true;
  };

  /**
   * Removes all success and error messages
   *
   * @returns {*}
   * @private
   */
  _removeMessages = () => {
    const event = this._dispatchEvent(EventTypes.EVENT_REMOVE_MESSAGES);
    if (event.defaultPrevented) {
      return false;
    }

    if (typeof this.options.removeMessages === 'function') {
      this.options.removeMessages = this.options.removeMessages.bind(this);
      return this.options.removeMessages();
    }

    const { form, options } = this;
    const { successClassBanner, errorClassBanner, errorClassList, errorClassField } = options;

    // Remove any existing errors that are being shown
    form.querySelectorAll(`.${getClassArray(errorClassList).join('.')}`).remove();
    const fieldsWithErrors = form.querySelectorAll(`.${getClassArray(errorClassField).join('.')}`);
    for (let fieldIndex = 0; fieldIndex < fieldsWithErrors.length; fieldIndex++) {
      const field = fieldsWithErrors[fieldIndex];
      this._removeMessageFrom(field);
    }

    // Remove success messages
    form.querySelectorAll(`.${getClassArray(successClassBanner).join('.')}`).remove();
    document.querySelectorAll(`.${getClassArray(errorClassBanner).join('.')}`).remove();
  };

  _removeMessageFrom = (field) => {
    const event = this._dispatchEvent(EventTypes.EVENT_FIELD_REMOVE_MESSAGES, { field });
    if (event.defaultPrevented) {
      return false;
    }

    const { options } = this;
    const { errorClassList, errorClassField } = options;

    let errorContainerNode = field.parentNode;
    if (field.type) {
      if (field.type === 'radio' || (field.type === 'checkbox' && /\[]$/.test(field.name))) {
        errorContainerNode = field.parentNode.parentNode;
      }
    }

    const errorList = errorContainerNode.querySelector(`.${errorClassList}`);
    if (errorList) {
      errorList.remove();
    }

    const fields = errorContainerNode.querySelectorAll('input, select, textarea');
    for (let i = 0; i < fields.length; i++) {
      removeClass(fields[i], errorClassField);
    }
  };

  /**
   * Renders the successful form submit message
   *
   * @returns {*}
   * @private
   */
  _renderSuccessBanner = () => {
    const event = this._dispatchEvent(EventTypes.EVENT_RENDER_SUCCESS);
    if (event.defaultPrevented) {
      return false;
    }

    if (typeof this.options.renderSuccess === 'function') {
      this.options.renderSuccess = this.options.renderSuccess.bind(this);
      return this.options.renderSuccess();
    }

    const { form, options } = this;
    const { successBannerMessage, successClassBanner } = options;

    const successMessage = document.createElement('div');
    addClass(successMessage, successClassBanner);

    const paragraph = document.createElement('p');
    paragraph.appendChild(document.createTextNode(successBannerMessage));

    successMessage.appendChild(paragraph);

    form.insertBefore(successMessage, form.childNodes[0]);
  };

  /**
   * @param {Object<string, string>} errors
   * @private
   */
  _renderFieldErrors = (errors) => {
    const event = this._dispatchEvent(EventTypes.EVENT_RENDER_FIELD_ERRORS, { errors });
    if (event.defaultPrevented) {
      return false;
    }

    if (typeof this.options.renderFieldErrors === 'function') {
      this.options.renderFieldErrors = this.options.renderFieldErrors.bind(this);
      return this.options.renderFieldErrors(errors);
    }

    const { form, options } = this;
    const { errorClassList, errorClassField } = options;

    for (const key in errors) {
      const messages = errors[key];
      const errorsList = document.createElement('ul');
      addClass(errorsList, errorClassList);

      for (let messageIndex = 0; messageIndex < messages.length; messageIndex++) {
        const message = messages[messageIndex];
        const listItem = document.createElement('li');
        listItem.appendChild(document.createTextNode(message));
        errorsList.appendChild(listItem);
      }

      const inputList = form.querySelectorAll(
        `*[name="${key}"], *[name="${key}[0][0]"], *[type=file][name="${key}"], *[type=file][name="${key}[]"]`
      );
      for (let inputIndex = 0; inputIndex < inputList.length; inputIndex++) {
        const input = inputList[inputIndex];

        addClass(input, errorClassField);
        input.parentElement.appendChild(errorsList);
      }

      const groupInputList = form.querySelectorAll(
        `input[type=checkbox][name="${key}[]"], input[type=radio][name="${key}"]`
      );
      for (let inputIndex = 0; inputIndex < groupInputList.length; inputIndex++) {
        const input = groupInputList[inputIndex];

        addClass(input, errorClassField);
        input.parentElement.parentElement.appendChild(errorsList);
      }
    }
  };

  /**
   * @param {Array<string>} errors
   * @private
   */
  _renderFormErrors = (errors) => {
    const event = this._dispatchEvent(EventTypes.EVENT_RENDER_FORM_ERRORS, { errors });
    if (event.defaultPrevented) {
      return false;
    }

    if (typeof this.options.renderFormErrors === 'function') {
      this.options.renderFormErrors = this.options.renderFormErrors.bind(this);
      return this.options.renderFormErrors(errors);
    }

    const { form, options } = this;
    const { errorClassBanner, errorBannerMessage } = options;

    const errorBlock = document.createElement('div');
    addClass(errorBlock, errorClassBanner);

    const paragraph = document.createElement('p');
    paragraph.appendChild(document.createTextNode(errorBannerMessage));
    errorBlock.appendChild(paragraph);

    if (errors.length) {
      const errorsList = document.createElement('ul');
      for (let messageIndex = 0; messageIndex < errors.length; messageIndex++) {
        const message = errors[messageIndex];
        const listItem = document.createElement('li');

        listItem.appendChild(document.createTextNode(message));
        errorsList.appendChild(listItem);
      }

      errorBlock.appendChild(errorsList);
    }

    form.insertBefore(errorBlock, form.childNodes[0]);
  };

  /**
   * @param {Event} event
   * @param {Element} form
   * @param {Object} response
   * @private
   */
  _onSuccessfulSubmit = (event, form, response) => {
    for (let i = 0; i < this._successfulAjaxSubmitCallbackStack.length; i++) {
      const callback = this._successfulAjaxSubmitCallbackStack[i];
      callback(event, form, response);
    }
  };

  /**
   * @param {Event} event
   * @param {Element} form
   * @param {Object} response
   * @private
   */
  _onFailedSubmit = (event, form, response) => {
    for (let i = 0; i < this._failedAjaxSubmitCallbackStack.length; i++) {
      const callback = this._failedAjaxSubmitCallbackStack[i];
      callback(event, form, response);
    }
  };

  /**
   * @param {Event} event
   * @param {Element} form
   * @param {Object} response
   * @private
   */
  _onAfterSubmit = (event, form, response) => {
    for (let i = 0; i < this._afterAjaxSubmitCallbackStack.length; i++) {
      const callback = this._afterAjaxSubmitCallbackStack[i];
      callback(event, form, response);
    }
  };

  /**
   * @param {Event} event
   * @returns {boolean}
   * @private
   */
  _onSubmitAjax = (event) => {
    const { form } = this;

    const data = new FormData(form);
    const request = new XMLHttpRequest();

    // Safari hack - remove empty file upload inputs
    // Otherwise an ajax call with empty file uploads causes immense lag
    if (isSafari()) {
      for (let i = 0; i < form.elements.length; i++) {
        if (form.elements[i].type === 'file') {
          if (form.elements[i].value === '') {
            const elem = form.elements[i];
            data.delete(elem.name);
          }
        }
      }
    }

    if (event.submitter && event.submitter.name) {
      data.append(event.submitter.name, '1');
    }

    const method = form.getAttribute('method');
    const action = form.getAttribute('action');

    request.open(method, action ? action : window.location.href, true);
    request.setRequestHeader('Cache-Control', 'no-cache');
    request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    request.setRequestHeader('HTTP_X_REQUESTED_WITH', 'XMLHttpRequest');
    request.onload = () => {
      this._removeMessages();

      if (request.status === 200) {
        const response = JSON.parse(request.response);
        const { success, finished, actions = [], errors, formErrors, honeypot, multipage } = response;

        if (!actions.length) {
          if (success) {
            if (multipage) {
              form.innerHTML = response.html.replace(/<form[^>]*>/, '').replace('</form>', '');
              this._resetHandlers();
              this._setUp();
            }

            if (finished) {
              if (!form.querySelector('input[name="formSubmissionToken"]')) {
                // Reset the form so that the user may enter fresh information
                // if a submission is not being edited
                form.reset();
              }

              this._renderSuccessBanner();
            }

            this._dispatchEvent(EventTypes.EVENT_AJAX_SUCCESS, { request, response });
            this._onSuccessfulSubmit(event, form, response);
          } else if (errors || formErrors) {
            this._dispatchEvent(EventTypes.EVENT_AJAX_ERROR, { request, response, errors, formErrors });
            this._onFailedSubmit(event, form, response);
            this._renderFieldErrors(errors);
            this._renderFormErrors(formErrors);
          }
        }

        if (honeypot) {
          const honeypotInput = form.querySelector('input[name^=freeform_form_handle]');
          if (honeypotInput) {
            honeypotInput.setAttribute('name', honeypot.name);
            honeypotInput.setAttribute('id', honeypot.name);
            honeypotInput.value = honeypot.hash;
          }
        }

        this._dispatchEvent(EventTypes.EVENT_AJAX_AFTER_SUBMIT, {
          data,
          request,
          response,
          cancelable: false,
        });
        this._onAfterSubmit(event, form, response);
      } else {
        console.error(request);
      }

      this.unlockSubmit(form);
    };

    const submitEvent = this._dispatchEvent(EventTypes.EVENT_AJAX_BEFORE_SUBMIT, { data, request });
    if (submitEvent.defaultPrevented) {
      return;
    }

    request.send(data);
  };

  /**
   * @returns {NodeListOf<Element> | Array<Element>}
   * @private
   */
  _getSubmitButtons = () => {
    return this.form.querySelectorAll(`*[type=submit]`);
  };

  /**
   * @returns {NodeListOf<Element> | Array<Element>}
   * @private
   */
  _getBackButtons = () => {
    const { prevButtonName } = this.options;

    return this.form.querySelectorAll(`*[type=submit][name="${prevButtonName}"]`);
  };

  _createNewEvent = (eventName, bubbles = true, cancelable = true) => {
    if (typeof Event === 'function') {
      return new Event(eventName, { bubbles, cancelable });
    }

    const event = document.createEvent('Event');
    event.initEvent(eventName, bubbles, cancelable);

    return event;
  };

  _dispatchEvent = (eventName, parameters = {}, element) => {
    const bubbles = parameters.bubbles ?? false;
    const cancelable = parameters.cancelable ?? true;

    delete parameters.bubbles;
    delete parameters.cancelable;

    parameters.freeform = this;
    parameters.form = this.form;

    const event = this._createNewEvent(eventName, bubbles, cancelable);
    Object.assign(event, parameters);

    if (!element) {
      element = this.form;
    }

    element.dispatchEvent(event);
    document.dispatchEvent(event);

    return event;
  };
}

// Add remove prototypes
Element.prototype.remove = function () {
  this.parentElement.removeChild(this);
};

NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
  for (var i = this.length - 1; i >= 0; i--) {
    if (this[i] && this[i].parentElement) {
      this[i].parentElement.removeChild(this[i]);
    }
  }
};

// Attach to all forms
const forms = document.querySelectorAll('form[data-freeform]');
forms.forEach((form) => {
  new Freeform(form);
});

// Add an observer which listens for new forms
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (!mutation.type === 'childList') {
      return;
    }

    mutation.addedNodes.forEach((node) => {
      if (node.nodeName !== 'FORM') {
        return;
      }

      if (node.dataset.freeform !== undefined) {
        new Freeform(node);
      }
    });
  });
});

// Start the observer
observer.observe(document.body, { childList: true, subtree: true });
