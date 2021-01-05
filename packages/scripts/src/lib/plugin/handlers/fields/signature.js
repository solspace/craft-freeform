/* eslint-disable no-undef */
class Signature {
  freeform;
  scriptAdded = false;
  constructor(freeform) {
    this.freeform = freeform;

    if (!this.scriptAdded) {
      const script = document.createElement('script');
      script.src = '//cdn.jsdelivr.net/npm/signature_pad@2.3.2/dist/signature_pad.min.js';
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
    const canvasFields = this.freeform.form.querySelectorAll('canvas[data-signature-field]');
    canvasFields.forEach((canvas) => {
      const onEnd = () => {
        input.value = signaturePad.toDataURL();
      };

      const { borderColor, backgroundColor, penColor, dotSize } = canvas.dataset;

      canvas.style.borderWidth = '1px';
      canvas.style.borderStyle = 'solid';
      canvas.style.borderColor = borderColor;

      const input = canvas.previousSibling;
      const clearButton = canvas.parentNode.querySelector('[data-signature-clear]');
      const value = input.value;

      const signaturePad = new SignaturePad(canvas, {
        onEnd,
        backgroundColor,
        penColor,
        dotSize,
        maxWidth: dotSize,
        throttle: 5,
      });

      if (clearButton) {
        clearButton.addEventListener('click', () => {
          signaturePad.clear();
          input.value = '';
        });
      }

      if (value) {
        const img = new Image();
        signaturePad.clear();
        img.src = value;
        img.onload = () => {
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        };
      }
    });
  };
}

export default Signature;
