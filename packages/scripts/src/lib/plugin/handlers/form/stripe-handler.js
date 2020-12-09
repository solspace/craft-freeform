import { EVENT_AJAX_AFTER_SUBMIT, EVENT_ON_SUBMIT } from '@lib/plugin/constants/event-types';

class StripeHandler {
  stripeSubmitReady = false;
  scaTriggered = false;

  stripe;
  elements;
  cardNumber;
  cardExpiry;
  cardCvc;

  paymentFieldId;
  currencySelector;
  amountSelector;
  publicKey;
  usage;

  freeform;
  form;

  stripeLoaded = false;
  scriptAdded = false;

  constructor(freeform) {
    const { form } = freeform;
    if (form.dataset.stripe === undefined) {
      return;
    }

    this.freeform = freeform;
    this.form = form;

    if (form.dataset.stripe === undefined) {
      return;
    }

    this.paymentFieldId = form.dataset.stripePaymentFieldId;
    this.currencySelector = form.dataset.stripeCurrencySelector;
    this.amountSelector = form.dataset.stripeAmountSelector;
    this.publicKey = form.dataset.stripePublicKey;
    this.usage = form.dataset.stripeUsage;

    // Force AJAX on the payment form
    freeform.setOption('ajax', true);
    form.addEventListener(EVENT_ON_SUBMIT, this._handleSubmit);
    form.addEventListener(EVENT_AJAX_AFTER_SUBMIT, this._handleAfterSubmit);

    this._loadStripe();

    form.addEventListener(
      'reset',
      () => {
        this.cardNumber && this.cardNumber.clear();
        this.cardCvc && this.cardCvc.clear();
        this.cardExpiry && this.cardExpiry.clear();
      },
      false
    );
  }

  reload = () => {
    this.stripeSubmitReady = false;
    this._loadCreditCardFields();
  };

  _isStripePresent = () => {
    const numberDiv = document.getElementById(this.paymentFieldId + '_card_number');

    return numberDiv !== null;
  };

  _loadStripe = () => {
    if (!this.scriptAdded) {
      const script = document.createElement('script');
      script.addEventListener('load', this._loadCreditCardFields);
      script.src = 'https://js.stripe.com/v3/';
      document.body.appendChild(script);

      this.scriptAdded = true;
    }
  };

  _handleSubmit = (event) => {
    if (!this._isStripePresent()) {
      return;
    }

    if (!this.stripe) {
      alert('Stripe scripts not loaded yet');
      event.preventDefault();
      return;
    }

    this.freeform.lockSubmit();
    this.freeform._removeMessages();

    // Return true if payments have been processed and are ready
    if (this.stripeSubmitReady) {
      return;
    }

    const cardField = document.getElementById(this.paymentFieldId);
    event.preventDefault();

    if (this.usage === 'single_use') {
      this.stripe.createPaymentMethod('card', this.cardNumber, {}).then((result) => {
        if (result.error) {
          return this._showError(result.error.message);
        }

        cardField.value = result.paymentMethod.id;
        this.stripeSubmitReady = true;

        this.freeform.triggerSubmit();
      });
    } else {
      this.stripe.createToken(this.cardNumber).then((result) => {
        if (result.error) {
          return this._showError(result.error.message);
        }

        cardField.value = result.token.id;
        this.stripeSubmitReady = true;

        this.freeform.triggerSubmit();
      });
    }
  };

  _handleAfterSubmit = (event) => {
    if (!this._isStripePresent() || !this.stripe) {
      return;
    }

    const { response } = event;

    if (response.actions) {
      const cardField = document.getElementById(this.paymentFieldId);
      response.actions.forEach((action) => {
        if (action.name === 'stripe.single_payment.payment_intent_action') {
          const { payment_intent } = action.metadata;
          this.scaTriggered = true;

          cardField.value = payment_intent.id;

          this.stripe.handleCardAction(payment_intent.client_secret, this.cardNumber, {}).then((result) => {
            if (result.error) {
              this._resetStripeSubmit();
              return this._showError(result.error.message);
            }

            this.freeform.triggerSubmit();
          });
        }

        if (action.name === 'stripe.subscription.payment_intent_action') {
          const { subscription, payment_intent } = action.metadata;
          this.scaTriggered = true;

          cardField.value = subscription.id;

          this.stripe.handleCardPayment(payment_intent.client_secret, this.cardNumber, {}).then((result) => {
            if (result.error) {
              this._resetStripeSubmit();
              return this._showError(result.error.message);
            }

            this.freeform.triggerSubmit();
          });
        }
      });
    }
  };

  _showError = (message) => {
    this.freeform._renderFormErrors([message]);
    this.freeform.unlockSubmit();

    return false;
  };

  _loadCreditCardFields = () => {
    if (!this._isStripePresent()) {
      return;
    }

    const numberDivId = this.paymentFieldId + '_card_number';
    const cvcDivId = this.paymentFieldId + '_card_cvc';
    const expiryDivId = this.paymentFieldId + '_card_expiry';
    const numberDiv = document.getElementById(numberDivId);
    const cvcDiv = document.getElementById(cvcDivId);
    const expiryDiv = document.getElementById(expiryDivId);
    const numberPlaceholder = numberDiv.attributes.placeholder;
    const expiryPlaceholder = expiryDiv.attributes.placeholder;
    const cvcPlaceholder = cvcDiv.attributes.placeholder;

    const event = this.freeform._dispatchEvent('freeform-stripe-styling', { detail: {}, style: {} });
    const style = {
      ...event.detail,
      ...event.style,
    };

    // eslint-disable-next-line no-undef
    this.stripe = Stripe(this.publicKey);
    this.elements = this.stripe.elements();
    this.cardNumber = this.elements.create('cardNumber', {
      placeholder: numberPlaceholder ? numberPlaceholder.value : '',
      style,
    });
    this.cardExpiry = this.elements.create('cardExpiry', {
      placeholder: expiryPlaceholder ? expiryPlaceholder.value : '',
      style,
    });
    this.cardCvc = this.elements.create('cardCvc', {
      placeholder: cvcPlaceholder ? cvcPlaceholder.value : '',
      style,
    });

    this.cardNumber.mount('#' + numberDivId);
    this.cardExpiry.mount('#' + expiryDivId);
    this.cardCvc.mount('#' + cvcDivId);

    this.cardNumber.on('change', this._resetStripeSubmit);
    this.cardExpiry.on('change', this._resetStripeSubmit);
    this.cardCvc.on('change', this._resetStripeSubmit);

    if (this.amountSelector) {
      const amountInput = this.form.querySelector(this.amountSelector);
      if (amountInput) {
        amountInput.addEventListener('change', this._resetStripeSubmit);
      }
    }

    if (this.currencySelector) {
      const currencyInput = this.form.querySelector(this.currencySelector);
      if (currencyInput) {
        currencyInput.addEventListener('change', this._resetStripeSubmit);
      }
    }
  };

  _resetStripeSubmit = () => {
    this.stripeSubmitReady = false;
  };
}

export default StripeHandler;
