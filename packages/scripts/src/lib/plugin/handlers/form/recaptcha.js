import { EVENT_AJAX_AFTER_SUBMIT, EVENT_ON_SUBMIT } from '../../constants/event-types';

/* eslint-disable no-undef */
class RecaptchaHandler {
  _G_URL = 'https://www.google.com/recaptcha/api.js';
  _H_URL = 'https://js.hcaptcha.com/1/api.js';

  _V2_CHECKBOX = 'v2_checkbox';
  _V2_INVISIBLE = 'v2_invisible';
  _V3 = 'v3';
  _H_CHECKBOX = 'h_checkbox';
  _H_INVISIBLE = 'h_invisible';

  freeform;
  form;

  version;
  siteKey;
  action;
  lazyLoad = false;

  captchaId;
  captchaElement;
  isTokenSet = false;

  scriptAdded = false;

  constructor(freeform) {
    this.freeform = freeform;
    this.form = freeform.form;

    const { recaptcha, recaptchaKey, recaptchaAction, recaptchaLazyLoad } = this.form.dataset;

    if (!recaptcha) {
      return;
    }

    this.version = recaptcha;
    this.siteKey = recaptchaKey;
    this.action = recaptchaAction;
    this.lazyLoad = recaptchaLazyLoad !== undefined;

    const loadScripts = () => {
      this.form.removeEventListener('input', loadScripts);

      if (!this.scriptAdded) {
        let url = this._G_URL;
        if (this.isHCaptcha(recaptcha)) {
          url = this._H_URL;
        }

        switch (this.version) {
          case this._V3:
            url += `?render=${this.siteKey}`;
            break;

          case this._V2_CHECKBOX:
          case this._H_CHECKBOX:
            url += '?render=explicit';
            break;
        }

        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.defer = true;
        script.addEventListener('load', this.renderCaptcha);
        document.body.appendChild(script);

        this.scriptAdded = true;
      } else {
        this.renderCaptcha();
      }
    };

    if (this.lazyLoad) {
      this.form.addEventListener('input', loadScripts);
    } else {
      loadScripts();
    }
  }

  isHCaptcha = (type) => [this._H_CHECKBOX, this._H_INVISIBLE].includes(type);

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

      case this._H_CHECKBOX:
        this.reloadHCheckbox();
        break;

      case this._H_INVISIBLE:
        this.reloadHInvisible();
        break;
    }
  };

  reloadV2Checkbox = () => {
    this.captchaElement = this.form.querySelector('.g-recaptcha');
    if (this.captchaElement) {
      grecaptcha.ready(() => {
        grecaptcha.render(this.captchaElement, {
          sitekey: this.siteKey,
        });
      });
    }
  };

  renderV2Checkbox() {
    this.form.addEventListener(EVENT_AJAX_AFTER_SUBMIT, () => {
      if (this.captchaElement) {
        grecaptcha.ready(() => grecaptcha.reset());
      }
    });

    this.reloadV2Checkbox();
  }

  reloadHCheckbox() {
    this.captchaElement = this.form.querySelector('.h-captcha');
    if (this.captchaElement) {
      this.captchaId = hcaptcha.render(this.captchaElement, {
        sitekey: this.siteKey,
      });
    }
  }

  renderHCheckbox() {
    this.form.addEventListener(EVENT_AJAX_AFTER_SUBMIT, () => {
      if (this.captchaElement) {
        hcaptcha.reset(this.captchaId);
      }
    });

    this.reloadHCheckbox();
  }

  reloadV2Invisible = () => {
    this.isTokenSet = false;

    const id = `${this.freeform.id}-recaptcha-v2-invisible`;

    let recaptchaElement = document.getElementById(id);
    if (!recaptchaElement) {
      recaptchaElement = document.createElement('div');
      recaptchaElement.id = id;
      this.captchaElement = recaptchaElement;
      this.form.appendChild(recaptchaElement);
    }

    grecaptcha.ready(() => {
      grecaptcha.render(recaptchaElement, {
        sitekey: this.siteKey,
        size: 'invisible',
        callback: (token) => {
          this.captchaElement.querySelector('*[name="g-recaptcha-response"]').value = token;

          this.isTokenSet = true;
          this.freeform.triggerResubmit();
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

      grecaptcha.ready(() => grecaptcha.execute());
    });

    this.form.addEventListener(EVENT_AJAX_AFTER_SUBMIT, () => {
      this.isTokenSet = false;
      grecaptcha.ready(() => grecaptcha.reset());
    });

    this.reloadV2Invisible();
  }

  reloadHInvisible = () => {
    this.isTokenSet = false;

    const id = `${this.freeform.id}-recaptcha-v2-invisible`;

    let hCaptchaElement = document.getElementById(id);
    if (!hCaptchaElement) {
      hCaptchaElement = document.createElement('div');
      hCaptchaElement.id = id;
      this.captchaElement = hCaptchaElement;
      this.form.appendChild(hCaptchaElement);
    }

    this.captchaId = hcaptcha.render(hCaptchaElement, {
      sitekey: this.siteKey,
      size: 'invisible',
      callback: (token) => {
        this.captchaElement.querySelector('*[name="h-captcha-response"]').value = token;

        this.isTokenSet = true;
        this.freeform.triggerResubmit();
      },
    });
  };

  renderHInvisible() {
    this.form.addEventListener(EVENT_ON_SUBMIT, (event) => {
      if (this.isTokenSet) {
        return;
      }

      event.preventDefault();

      hcaptcha.execute(this.captchaId);
    });

    this.form.addEventListener(EVENT_AJAX_AFTER_SUBMIT, () => {
      this.isTokenSet = false;
      hcaptcha.reset(this.captchaId);
    });

    this.reloadHInvisible();
  }

  reloadV3() {
    const recaptchaInput = document.createElement('input');
    recaptchaInput.type = 'hidden';
    recaptchaInput.name = 'g-recaptcha-response';

    this.isTokenSet = false;
    this.captchaElement = recaptchaInput;

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

      grecaptcha.ready(() => {
        grecaptcha.execute(siteKey, { action }).then((token) => {
          this.captchaElement.value = token;
          this.isTokenSet = true;

          this.freeform.triggerResubmit();
        });
      });
    });

    this.form.addEventListener(EVENT_AJAX_AFTER_SUBMIT, () => {
      this.isTokenSet = false;
    });
  }

  renderCaptcha = () => {
    const interval = setInterval(() => {
      if (window.grecaptcha || window.hcaptcha) {
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

          case this._H_CHECKBOX:
            this.renderHCheckbox();
            break;

          case this._H_INVISIBLE:
            this.renderHInvisible();
            break;
        }
      }
    }, 100);
  };
}

export default RecaptchaHandler;
