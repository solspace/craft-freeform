/** Reserve the active tab, then fill remaining space in navigation order. */
export function fitTabs(
  widths: number[],
  available: number,
  moreWidth: number,
  active: number,
): number[] {
  if (!widths.length) return [];
  if (widths.reduce((sum, width) => sum + width, 0) <= available)
    return widths.map((_, index) => index);

  const current = Math.max(0, Math.min(active, widths.length - 1));
  const visible = [current];
  let used = widths[current] + moreWidth;
  widths.forEach((width, index) => {
    if (index !== current && used + width <= available) {
      visible.push(index);
      used += width;
    }
  });
  return visible.sort((a, b) => a - b);
}
