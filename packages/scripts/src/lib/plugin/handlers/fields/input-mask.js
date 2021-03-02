/* eslint-disable no-undef */
class InputMask {
  freeform;
  scriptAdded = false;
  constructor(freeform) {
    this.freeform = freeform;

    if (!this.freeform.has('data-scripts-js-mask')) {
      return;
    }

    if (!this.scriptAdded) {
      const script = document.createElement('script');
      script.src = '//unpkg.com/imask';
      script.async = false;
      script.defer = false;
      script.addEventListener('load', () => {
        this.reload();
      });
      document.body.appendChild(script);

      this.scriptAdded = true;
    }
  }

  reload = () => {
    if (!this.freeform.has('data-scripts-js-mask')) {
      return;
    }

    const maskedInputs = this.freeform.form.querySelectorAll('*[data-masked-input]');
    maskedInputs.forEach((input) => {
      const mask = input.getAttribute('data-pattern');
      if (mask) {
        new IMask(input, { mask });
      }
    });
  };
}

export default InputMask;
