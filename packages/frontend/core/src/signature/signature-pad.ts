import { getSignatureDataUrl, type SignatureConfig } from "./signature.js";

export type SignaturePadController = {
  update: (value: unknown, force?: boolean) => void;
  clear: () => void;
  destroy: () => void;
};

export function mountSignaturePad(
  canvas: HTMLCanvasElement,
  config: SignatureConfig,
  callbacks: {
    onChange: (value: string) => void;
    onInkChange: (hasInk: boolean) => void;
    isEnabled: () => boolean;
  },
): SignaturePadController {
  const width = config.width ?? 400;
  const height = config.height ?? 100;
  const ratio = canvas.ownerDocument.defaultView?.devicePixelRatio || 1;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const context = canvas.getContext("2d");
  context?.setTransform(ratio, 0, 0, ratio, 0, 0);
  // Display colors never enter newly drawn signature exports.
  const bitmap = canvas.ownerDocument.createElement("canvas");
  bitmap.width = canvas.width;
  bitmap.height = canvas.height;
  const ink = bitmap?.getContext("2d");
  ink?.setTransform(ratio, 0, 0, ratio, 0, 0);
  let currentValue: string | undefined;
  let sourceValue: unknown;
  let hasInk = false;
  let hasValue = false;
  let pointerId: number | null = null;
  let moved = false;
  let lastPoint = { x: 0, y: 0 };
  let pendingImage: HTMLImageElement | undefined;

  function setInk(value: boolean) {
    hasInk = value;
    callbacks.onInkChange(value);
  }

  function cancelImage() {
    if (pendingImage) {
      pendingImage.onload = null;
      pendingImage.onerror = null;
    }
    pendingImage = undefined;
  }

  function stopDrawing() {
    if (pointerId !== null && canvas.hasPointerCapture?.(pointerId)) {
      canvas.releasePointerCapture(pointerId);
    }
    pointerId = null;
    moved = false;
  }

  function paintBackground() {
    ink?.clearRect(0, 0, width, height);
    if (!context) return;
    context.clearRect(0, 0, width, height);
    context.fillStyle = config.backgroundColor || "rgba(0,0,0,0)";
    context.fillRect(0, 0, width, height);
  }

  function update(value: unknown, force = false) {
    // Invalid nonempty presets must remain clearable without rewriting them
    // automatically. Image decoding and the controlled value are independent.
    hasValue = value != null && value !== "";
    const next = getSignatureDataUrl(value) ?? "";
    if (next === currentValue && value === sourceValue && !force) return;
    sourceValue = value;
    stopDrawing();
    cancelImage();
    currentValue = next;
    paintBackground();
    setInk(Boolean(next));
    if (!next || !context) return;

    const image = new Image();
    pendingImage = image;
    image.onload = () => {
      if (pendingImage !== image) return;
      pendingImage = undefined;
      if (ink) {
        ink.drawImage(image, 0, 0, width, height);
        const layer = canvas.ownerDocument.createElement("canvas");
        layer.width = canvas.width;
        layer.height = canvas.height;
        const colored = layer.getContext("2d");
        if (colored) {
          colored.drawImage(image, 0, 0, layer.width, layer.height);
          // Preserve original legacy colors/backgrounds on restore. Recolor
          // only black transparent bitmaps for the custom display appearance.
          const pixels = colored.getImageData(
            0,
            0,
            layer.width,
            layer.height,
          ).data;
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
            context.drawImage(image, 0, 0, width, height);
            return;
          }
          colored.globalCompositeOperation = "source-in";
          colored.fillStyle = config.penColor || "#000000";
          colored.fillRect(0, 0, layer.width, layer.height);
          context.drawImage(layer, 0, 0, width, height);
        }
      } else context.drawImage(image, 0, 0, width, height);
    };
    image.onerror = () => {
      if (pendingImage !== image) return;
      pendingImage = undefined;
      setInk(false);
    };
    image.src = next;
  }

  function point(event: PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    return {
      x: ((event.clientX - rect.left) / rect.width) * width,
      y: ((event.clientY - rect.top) / rect.height) * height,
    };
  }

  function begin(event: PointerEvent) {
    if (
      !context ||
      !callbacks.isEnabled() ||
      pointerId !== null ||
      event.button !== 0 ||
      event.isPrimary === false
    )
      return;
    const position = point(event);
    if (!position) return;
    pointerId = event.pointerId;
    moved = false;
    lastPoint = position;
    canvas.setPointerCapture?.(event.pointerId);
    context.strokeStyle = config.penColor || "#000000";
    context.lineWidth = config.penDotSize ?? 2.5;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(position.x, position.y);
    if (ink) {
      ink.strokeStyle = "#000000";
      ink.lineWidth = config.penDotSize ?? 2.5;
      ink.lineCap = "round";
      ink.lineJoin = "round";
      ink.beginPath();
      ink.moveTo(position.x, position.y);
    }
  }

  function move(event: PointerEvent) {
    if (!context || event.pointerId !== pointerId || !callbacks.isEnabled())
      return;
    const position = point(event);
    if (!position || (position.x === lastPoint.x && position.y === lastPoint.y))
      return;
    cancelImage();
    lastPoint = position;
    context.lineTo(position.x, position.y);
    context.stroke();
    ink?.lineTo(position.x, position.y);
    ink?.stroke();
    moved = true;
    setInk(true);
  }

  function end(event: PointerEvent) {
    if (event.pointerId !== pointerId) return;
    const changed = moved;
    stopDrawing();
    if (!changed) return;
    currentValue = (ink ? bitmap : canvas).toDataURL("image/png");
    hasValue = true;
    sourceValue = currentValue;
    callbacks.onChange(currentValue);
  }

  canvas.addEventListener("pointerdown", begin);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
  canvas.addEventListener("pointerleave", end);

  return {
    update,
    clear() {
      const changed = hasInk || hasValue;
      stopDrawing();
      cancelImage();
      currentValue = "";
      hasValue = false;
      sourceValue = "";
      paintBackground();
      setInk(false);
      if (changed) callbacks.onChange("");
    },
    destroy() {
      stopDrawing();
      cancelImage();
      canvas.removeEventListener("pointerdown", begin);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", end);
      canvas.removeEventListener("pointercancel", end);
      canvas.removeEventListener("pointerleave", end);
    },
  };
}
