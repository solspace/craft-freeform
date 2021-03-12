/* eslint-disable no-undef */
class InputMask {
  freeform;
  scriptAdded = false;
  constructor(freeform) {
    this.freeform = freeform;

    if (!this.scriptAdded) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/imask/6.0.7/imask.min.js';
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
