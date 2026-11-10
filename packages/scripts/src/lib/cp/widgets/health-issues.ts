/** Show complete issue rows, expanding and shrinking with the widget itself. */
export const fitHealthIssues = (widget: HTMLElement): void => {
  const content = widget.querySelector<HTMLElement>(".ff-health-content");
  const list = widget.querySelector<HTMLElement>(".ff-health-recent ul");
  if (!content || !list) return;
  const rows = Array.from(list.querySelectorAll<HTMLElement>(":scope > li"));
  const layout = () => {
    // Reveal first so rows hidden at the previous size can be measured again.
    for (const row of rows) row.hidden = false;
    const available =
      content.getBoundingClientRect().bottom - list.getBoundingClientRect().top;
    const gap = Number.parseFloat(getComputedStyle(list).rowGap) || 0;
    let used = 0;
    let full = false;
    for (const row of rows) {
      const height = row.getBoundingClientRect().height;
      full ||= used + height > available + 0.5;
      row.hidden = full;
      if (!full) used += height + gap;
    }
  };
  layout();
  // The root has a fixed viewport-based height; hiding rows cannot resize it.
  const observer = new ResizeObserver(layout);
  observer.observe(widget);
  document.fonts?.ready.then(layout);
  window.addEventListener("pagehide", () => observer.disconnect(), {
    once: true,
  });
};
