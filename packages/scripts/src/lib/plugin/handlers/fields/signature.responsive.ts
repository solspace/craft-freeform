/** Scale screen coordinates into the original bitmap without resizing it. */
export function mountResponsiveSignatureCanvas(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  const view = canvas.ownerDocument.defaultView;
  const wrapper = canvas.closest<HTMLElement>(".freeform-signature-wrapper");
  const widthProperty = "--ff-signature-max-width";
  const originalWidth = wrapper?.style.getPropertyValue(widthProperty);
  const originalPriority = wrapper?.style.getPropertyPriority(widthProperty);

  const sync = () => {
    if (wrapper) {
      const configuredScale = Number(
        canvas.closest("form")?.dataset.freeformSignatureMaxScale,
      );
      const scale =
        configuredScale > 0 && Number.isFinite(canvas.width * configuredScale)
          ? configuredScale
          : 1.25;
      // Bound the wrapper too, so its border and Clear button follow the pad.
      wrapper.style.setProperty(widthProperty, `${canvas.width * scale}px`);
    }
    if (!context || !view) return;
    const rect = canvas.getBoundingClientRect();
    const style = view.getComputedStyle(canvas);
    const left =
      (Number.parseFloat(style.borderLeftWidth) || 0) +
      (Number.parseFloat(style.paddingLeft) || 0);
    const top =
      (Number.parseFloat(style.borderTopWidth) || 0) +
      (Number.parseFloat(style.paddingTop) || 0);
    const width =
      rect.width -
      left -
      (Number.parseFloat(style.borderRightWidth) || 0) -
      (Number.parseFloat(style.paddingRight) || 0);
    const height =
      rect.height -
      top -
      (Number.parseFloat(style.borderBottomWidth) || 0) -
      (Number.parseFloat(style.paddingBottom) || 0);
    // Hidden tabs and pages can report zero dimensions until they are shown.
    if (width <= 0 || height <= 0) return;
    const scaleX = canvas.width / width;
    const scaleY = canvas.height / height;
    context.setTransform(scaleX, 0, 0, scaleY, -left * scaleX, -top * scaleY);
  };

  const observer =
    typeof ResizeObserver === "function" ? new ResizeObserver(sync) : undefined;
  observer?.observe(canvas);
  view?.addEventListener("resize", sync);
  sync();

  return {
    sync,
    withBitmapCoordinates(action: () => void) {
      if (!context) {
        action();
        return;
      }
      context.save();
      context.setTransform(1, 0, 0, 1, 0, 0);
      try {
        action();
      } finally {
        context.restore();
        sync();
      }
    },
    destroy() {
      observer?.disconnect();
      view?.removeEventListener("resize", sync);
      context?.setTransform(1, 0, 0, 1, 0, 0);
      if (originalWidth) {
        wrapper?.style.setProperty(
          widthProperty,
          originalWidth,
          originalPriority,
        );
      } else {
        wrapper?.style.removeProperty(widthProperty);
      }
    },
  };
}
