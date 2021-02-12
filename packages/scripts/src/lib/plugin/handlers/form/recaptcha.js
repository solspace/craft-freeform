import { EVENT_AJAX_AFTER_SUBMIT, EVENT_ON_SUBMIT } from '../../constants/event-types';

/* eslint-disable no-undef */
class RecaptchaHandler {
  _URL = 'https://www.google.com/recaptcha/api.js';

  _V2_CHECKBOX = 'v2_checkbox';
  _V2_INVISIBLE = 'v2_invisible';
  _V3 = 'v3';

  freeform;
  form;

  version;
  siteKey;
  action;

  recaptchaElement;
  isTokenSet = false;
  isBackButtonPressed = false;

  scriptAdded = false;

  constructor(freeform) {
    this.freeform = freeform;
    this.form = freeform.form;

    const { recaptcha, recaptchaKey, recaptchaAction } = this.form.dataset;

    if (!recaptcha) {
      return;
    }

    this.version = recaptcha;
    this.siteKey = recaptchaKey;
    this.action = recaptchaAction;

    if (!this.scriptAdded) {
      let url = this._URL;
      switch (this.version) {
        case this._V3:
          url += `?render=${this.siteKey}`;
          break;

        case this._V2_CHECKBOX:
          url += '?render=explicit';
          break;
      }

      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.defer = true;
      script.addEventListener('load', this.renderRecaptcha);
      document.body.appendChild(script);

      this.scriptAdded = true;
    } else {
      this.renderRecaptcha();
    }
  }

  reload = () => {
    switch (this.version) {
      case this._V2_CHECKBOX:
        this.reloadV2Checkbox();
        break;

      case this._V2_INVISIBLE:
        this.reloadV2Invisible();
        break;

      case this._V3:
        this.reloadV3();
        break;
    }
  };

  reloadV2Checkbox = () => {
    this.recaptchaElement = this.form.querySelector('.g-recaptcha');
    if (this.recaptchaElement) {
      grecaptcha.ready(() => {
        grecaptcha.render(this.recaptchaElement, {
          sitekey: this.siteKey,
        });
      });
    }
  };

  renderV2Checkbox() {
    this.form.addEventListener(EVENT_AJAX_AFTER_SUBMIT, () => {
      if (this.recaptchaElement) {
        grecaptcha.ready(() => grecaptcha.reset());
      }
    });

    this.reloadV2Checkbox();
  }

  reloadV2Invisible = () => {
    this.isTokenSet = false;

    const id = `${this.freeform.id}-recaptcha-v2-invisible`;

    let recaptchaElement = document.getElementById(id);
    if (!recaptchaElement) {
      recaptchaElement = document.createElement('div');
      recaptchaElement.id = id;
      this.recaptchaElement = recaptchaElement;
      this.form.appendChild(recaptchaElement);
    }

    grecaptcha.ready(() => {
      grecaptcha.render(recaptchaElement, {
        sitekey: this.siteKey,
        size: 'invisible',
        callback: (token) => {
          this.recaptchaElement.querySelector('*[name="g-recaptcha-response"]').value = token;

          this.isTokenSet = true;
          this.freeform.triggerSubmit(this.isBackButtonPressed);
        },
      });
    });
  };

  renderV2Invisible() {
    this.form.addEventListener(EVENT_ON_SUBMIT, (event) => {
      if (this.isTokenSet) {
        return;
      }

      event.preventDefault();

      const { isBackButtonPressed } = event;
      this.isBackButtonPressed = isBackButtonPressed;

      grecaptcha.ready(() => grecaptcha.execute());
    });

    this.form.addEventListener(EVENT_AJAX_AFTER_SUBMIT, () => {
      this.isTokenSet = false;
      grecaptcha.ready(() => grecaptcha.reset());
    });

    this.reloadV2Invisible();
  }

  reloadV3() {
    const recaptchaInput = document.createElement('input');
    recaptchaInput.type = 'hidden';
    recaptchaInput.name = 'g-recaptcha-response';

    this.isTokenSet = false;
    this.recaptchaElement = recaptchaInput;

    this.form.appendChild(recaptchaInput);
  }

  renderV3() {
    const { siteKey, action } = this;

    this.reloadV3();

    this.form.addEventListener(EVENT_ON_SUBMIT, (event) => {
      if (this.isTokenSet) {
        return;
      }

      event.preventDefault();
      const { isBackButtonPressed } = event;

      grecaptcha.ready(() => {
        grecaptcha.execute(siteKey, { action }).then((token) => {
          this.recaptchaElement.value = token;
          this.isTokenSet = true;

          this.freeform.triggerSubmit(isBackButtonPressed);
        });
      });
    });

    this.form.addEventListener(EVENT_AJAX_AFTER_SUBMIT, () => {
      this.isTokenSet = false;
    });
  }

  renderRecaptcha = () => {
    const interval = setInterval(() => {
      if (window.grecaptcha) {
        clearInterval(interval);

        switch (this.version) {
          case this._V2_CHECKBOX:
            this.renderV2Checkbox();
            break;

          case this._V2_INVISIBLE:
            this.renderV2Invisible();
            break;

          case this._V3:
            this.renderV3();
            break;
        }
      }
    }, 100);
  };
}

export default RecaptchaHandler;
