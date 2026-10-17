type Rectangle = Pick<DOMRect, "left" | "right" | "top" | "bottom">;

/** Find an exposed part of the real target; never put the guide on the dialog. */
export function visibleBuilderPoint(
  target: Rectangle,
  modal: Rectangle,
  width: number,
  height: number,
  canvas?: Rectangle,
  exactControl = false,
  compactControl = false,
) {
  if (exactControl) {
    const x = (target.left + target.right) / 2;
    const y = (target.top + target.bottom) / 2;
    if (
      x < 20 ||
      x > width - 20 ||
      y < 24 ||
      y > height - 24 ||
      (canvas &&
        (x < canvas.left ||
          x > canvas.right ||
          y < canvas.top ||
          y > canvas.bottom)) ||
      (x >= modal.left - 8 &&
        x <= modal.right + 8 &&
        y >= modal.top - 8 &&
        y <= modal.bottom + 8)
    )
      return undefined;
    return { x, y, labelWidth: Math.max(50, Math.min(230, width - x - 40)) };
  }
  const left = Math.max(20, target.left, canvas?.left ?? 0);
  const right = Math.min(width - 20, target.right, canvas?.right ?? width);
  const top = Math.max(24, target.top, canvas?.top ?? 0);
  const bottom = Math.min(height - 24, target.bottom, canvas?.bottom ?? height);
  const regions = [
    { left: Math.max(left, modal.right + 18), right, top, bottom },
    { left, right: Math.min(right, modal.left - 18), top, bottom },
    { left, right, top, bottom: Math.min(bottom, modal.top - 18) },
    { left, right, top: Math.max(top, modal.bottom + 18), bottom },
  ];
  const region = regions.find(
    (part) =>
      part.right - part.left >= (compactControl ? 16 : 80) &&
      part.bottom - part.top >= (compactControl ? 12 : 24),
  );
  if (!region) return undefined;
  return {
    x: compactControl ? (region.left + region.right) / 2 : region.left + 6,
    y: compactControl ? (region.top + region.bottom) / 2 : region.top + 8,
    labelWidth: Math.max(50, Math.min(230, region.right - region.left - 38)),
  };
}
