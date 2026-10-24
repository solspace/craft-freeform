export const rowInsertionIndex = (
  x: number,
  left: number,
  width: number,
  count: number,
): number => {
  if (width <= 0 || count <= 1) return 0;
  return Math.max(
    0,
    Math.min(count - 1, Math.floor((x - left) / (width / count))),
  );
};

export const isInsideContainer = (
  wrapper: HTMLElement,
  point: { x: number; y: number },
): boolean =>
  Array.from(
    wrapper.querySelectorAll(
      '[data-field-type="layout"], [data-field-type="group"]',
    ),
  ).some((element) => {
    const bounds = element.getBoundingClientRect();
    return (
      point.x >= bounds.left &&
      point.x <= bounds.right &&
      point.y >= bounds.top &&
      point.y <= bounds.bottom
    );
  });
