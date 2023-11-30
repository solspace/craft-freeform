import type Freeform from '@components/front-end/plugin/freeform';
import type { FreeformHandler } from 'types/form';

class Signature implements FreeformHandler {
  freeform: Freeform;
  scriptAdded = false;

  constructor(freeform: Freeform) {
    this.freeform = freeform;
    if (!this.freeform.has('data-scripts-signature')) {
      return;
    }

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
    if (!this.freeform.has('data-scripts-signature')) {
      return;
    }

    const canvasFields = this.freeform.form.querySelectorAll<HTMLCanvasElement>('canvas[data-signature-field]');
    canvasFields.forEach((canvas) => {
      const onEnd = () => {
        input.value = signaturePad.toDataURL();
      };

      const { borderColor, backgroundColor, penColor, dotSize } = canvas.dataset;

      canvas.style.borderWidth = '1px';
      canvas.style.borderStyle = 'solid';
      canvas.style.borderColor = borderColor;

      const input = canvas.previousSibling as HTMLInputElement;
      const clearButton = canvas.parentNode.querySelector<HTMLButtonElement>('[data-signature-clear]');
      const value = input.value;

      // @ts-expect-error: SignaturePad types are not included
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
