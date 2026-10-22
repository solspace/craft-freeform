import type Freeform from "@components/front-end/plugin/freeform";
import { createScript } from "@lib/plugin/helpers/html";
import type { FreeformHandler } from "types/form";
import { mountSignatureBitmap } from "./signature.bitmap";
import { mountResponsiveSignatureCanvas } from "./signature.responsive";

type SignaturePadOptions = {
  onBegin: () => void;
  onEnd: () => void;
  backgroundColor?: string;
  penColor?: string;
  dotSize?: string;
  maxWidth?: string;
  throttle: number;
};

declare const SignaturePad: new (
  canvas: HTMLCanvasElement,
  options: SignaturePadOptions,
) => {
  _ctx: CanvasRenderingContext2D;
  clear: () => void;
  toDataURL: () => string;
  off: () => void;
  _strokeMoveUpdate: (event: MouseEvent | Touch) => void;
};

type SignatureFieldState = {
  input: HTMLInputElement;
  refresh: () => void;
  reset: () => void;
  destroy: () => void;
};

let signaturePadLoading: Promise<void> | undefined;

const loadSignaturePad = () => {
  if (!signaturePadLoading) {
    signaturePadLoading = new Promise<void>((resolve) => {
      createScript(
        "https://cdn.jsdelivr.net/npm/signature_pad@2.3.2/dist/signature_pad.min.js",
        { onLoad: () => resolve() },
      );
    });
  }

  return signaturePadLoading;
};

class Signature implements FreeformHandler {
  freeform: Freeform;

  private fields = new Map<HTMLCanvasElement, SignatureFieldState>();
  private loading = false;

  constructor(freeform: Freeform) {
    this.freeform = freeform;

    freeform.form.addEventListener("reset", (event) => {
      // Wait for native reset and other listeners' preventDefault() calls.
      setTimeout(() => {
        if (event.defaultPrevented) return;
        this.reload();
        this.fields.forEach((field) => {
          field.reset();
        });
      }, 0);
    });

    this.reload();
  }

  reload = () => {
    const form = this.freeform.form;
    this.fields.forEach((field, canvas) => {
      if (!form.contains(canvas) || !form.contains(field.input)) {
        field.destroy();
        this.fields.delete(canvas);
      }
    });

    if (!this.freeform.has("data-scripts-signature")) {
      return;
    }

    if (typeof SignaturePad !== "function") {
      if (!this.loading) {
        this.loading = true;
        loadSignaturePad().then(() => {
          this.loading = false;
          if (typeof SignaturePad === "function") this.reload();
        });
      }
      return;
    }

    const canvasFields = form.querySelectorAll<HTMLCanvasElement>(
      "canvas[data-signature-field]",
    );
    canvasFields.forEach((canvas) => {
      const existing = this.fields.get(canvas);
      if (existing) {
        existing.refresh();
        return;
      }

      // Custom templates may include whitespace between the input and canvas.
      const input = canvas.previousElementSibling;
      if (!(input instanceof HTMLInputElement)) return;

      const { borderColor, backgroundColor, penColor, dotSize } =
        canvas.dataset;

      canvas.style.borderWidth = "1px";
      canvas.style.borderStyle = "solid";
      canvas.style.borderColor = borderColor;

      const clearButton = canvas.parentNode.querySelector<HTMLButtonElement>(
        "[data-signature-clear]",
      );
      // Hidden input .value also changes .defaultValue. Keep the original
      // server-rendered value separately so reset cannot reuse fresh ink.
      const initialValue = input.value;
      let currentValue = initialValue;
      let pendingImage: HTMLImageElement | undefined;
      let responsive:
        | ReturnType<typeof mountResponsiveSignatureCanvas>
        | undefined;
      const cancelRestore = () => {
        if (pendingImage) pendingImage.onload = null;
        pendingImage = undefined;
      };

      let bitmap: ReturnType<typeof mountSignatureBitmap>;
      let drawing = false;
      let moveTimer: ReturnType<typeof setTimeout> | undefined;
      let lastMove = 0;
      let pendingMove: MouseEvent | Touch | undefined;
      const cancelStroke = () => {
        drawing = false;
        clearTimeout(moveTimer);
        moveTimer = undefined;
        pendingMove = undefined;
      };
      const signaturePad = new SignaturePad(canvas, {
        onBegin: () => {
          cancelStroke();
          drawing = true;
          lastMove = 0;
          cancelRestore();
          responsive?.sync();
        },
        onEnd: () => {
          if (!drawing) return;
          cancelStroke();
          cancelRestore();
          currentValue = bitmap?.toDataURL() ?? signaturePad.toDataURL();
          input.value = currentValue;
        },
        backgroundColor,
        penColor,
        dotSize,
        maxWidth: dotSize,
        // 2.3.2's internal throttle cannot cancel its trailing timer. Keep
        // the same 5ms cadence below, with cancellation on reset/clear/removal.
        throttle: 0,
      });

      bitmap = mountSignatureBitmap(
        canvas,
        signaturePad,
        penColor || "#000000",
      );

      // This instance hook belongs to the pinned SignaturePad 2.3.2. Guard
      // touch moves too: that version processes them even without a new start.
      const move = signaturePad._strokeMoveUpdate.bind(signaturePad);
      signaturePad._strokeMoveUpdate = (event) => {
        if (!drawing) return;
        pendingMove = event;
        const remaining = 5 - (Date.now() - lastMove);
        const update = () => {
          moveTimer = undefined;
          if (!drawing || !pendingMove) return;
          lastMove = Date.now();
          const next = pendingMove;
          pendingMove = undefined;
          move(next);
        };
        if (remaining <= 0) {
          clearTimeout(moveTimer);
          update();
        } else if (moveTimer === undefined) {
          moveTimer = setTimeout(update, remaining);
        }
      };

      if (form.hasAttribute("data-freeform-signature-responsive")) {
        responsive = mountResponsiveSignatureCanvas(canvas);
      }
      const clearPad = () => {
        cancelStroke();
        if (responsive) {
          responsive.withBitmapCoordinates(() => signaturePad.clear());
        } else {
          signaturePad.clear();
        }
      };

      const clear = () => {
        cancelRestore();
        clearPad();
        currentValue = "";
        input.value = "";
      };
      clearButton?.addEventListener("click", clear);

      const restore = (value: string) => {
        cancelRestore();
        clearPad();
        if (!value) return;

        const img = new Image();
        pendingImage = img;
        img.onload = () => {
          if (pendingImage !== img) return;
          pendingImage = undefined;
          const draw = () => {
            if (bitmap) bitmap.restore(img);
            else
              canvas
                .getContext("2d")
                ?.drawImage(img, 0, 0, canvas.width, canvas.height);
          };
          if (responsive) responsive.withBitmapCoordinates(draw);
          else draw();
        };
        img.src = value;
      };

      this.fields.set(canvas, {
        input,
        refresh: () => {
          responsive?.sync();
          if (input.value !== currentValue) {
            currentValue = input.value;
            restore(currentValue);
          }
        },
        reset: () => {
          currentValue = initialValue;
          input.value = initialValue;
          restore(initialValue);
        },
        destroy: () => {
          cancelStroke();
          cancelRestore();
          signaturePad.off();
          bitmap?.destroy();
          responsive?.destroy();
          clearButton?.removeEventListener("click", clear);
        },
      });

      if (initialValue) restore(initialValue);
    });
  };
}

export default Signature;
