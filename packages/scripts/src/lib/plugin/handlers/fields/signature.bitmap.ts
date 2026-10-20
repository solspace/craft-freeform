/**
 * Mirror the pinned SignaturePad 2.3.2's drawing geometry into an ink-only
 * bitmap. Display colors never have to be guessed or removed from pixels.
 */
export function mountSignatureBitmap(
  canvas: HTMLCanvasElement,
  pad: { _ctx: CanvasRenderingContext2D },
  penColor: string,
) {
  const display = pad._ctx;
  const bitmap = document.createElement("canvas");
  bitmap.width = canvas.width;
  bitmap.height = canvas.height;
  const ink = bitmap.getContext("2d");
  if (!display || !ink) return;
  ink.fillStyle = "#000000";
  const geometry = new Set([
    "beginPath",
    "moveTo",
    "lineTo",
    "bezierCurveTo",
    "quadraticCurveTo",
    "arc",
    "rect",
    "closePath",
    "fill",
    "stroke",
    "clearRect",
  ]);
  const synchronize = () => {
    const m = display.getTransform();
    ink.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
  };
  const proxy = new Proxy(display, {
    get(target, key) {
      const value = Reflect.get(target, key, target);
      if (typeof value !== "function") return value;
      if (!geometry.has(String(key))) return value.bind(target);
      return (...args: unknown[]) => {
        if (key === "beginPath" || key === "clearRect") synchronize();
        const mirror = Reflect.get(ink, key, ink) as (
          ...values: unknown[]
        ) => void;
        mirror.apply(ink, args);
        return value.apply(target, args);
      };
    },
    set(target, key, value) {
      return Reflect.set(target, key, value, target);
    },
  });
  pad._ctx = proxy;

  return {
    toDataURL: () => bitmap.toDataURL("image/png"),
    restore(image: HTMLImageElement) {
      ink.save();
      ink.setTransform(1, 0, 0, 1, 0, 0);
      ink.drawImage(image, 0, 0, bitmap.width, bitmap.height);
      ink.restore();
      // Recolor the canonical bitmap for display without repainting its paper.
      const layer = document.createElement("canvas");
      layer.width = bitmap.width;
      layer.height = bitmap.height;
      const context = layer.getContext("2d");
      if (!context) return;
      context.drawImage(image, 0, 0, layer.width, layer.height);
      // Opaque/colored legacy images retain their original pixels. Only a
      // black transparent bitmap can safely use the configured display ink.
      const pixels = context.getImageData(0, 0, layer.width, layer.height).data;
      let transparent = false;
      let black = true;
      for (let i = 0; i < pixels.length; i += 4) {
        if (!pixels[i + 3]) transparent = true;
        else if (pixels[i] || pixels[i + 1] || pixels[i + 2]) {
          black = false;
          break;
        }
      }
      if (!black || !transparent) {
        display.drawImage(image, 0, 0, bitmap.width, bitmap.height);
        return;
      }
      context.globalCompositeOperation = "source-in";
      context.fillStyle = penColor;
      context.fillRect(0, 0, layer.width, layer.height);
      display.drawImage(layer, 0, 0);
    },
    destroy() {
      pad._ctx = display;
    },
  };
}
