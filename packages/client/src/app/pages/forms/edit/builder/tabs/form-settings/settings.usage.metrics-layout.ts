import { useLayoutEffect, useRef, useState } from "react";

type PriorityMetric = { value: string; label: string; note: string };

export const needsRulesSpace = (
  columns: number,
  width: number,
  gap: number,
  preferredCardWidth: number,
) => columns >= 5 && (width - gap * 5) / 6 < preferredCardWidth;

export const useMetricRulesLayout = (priorities: PriorityMetric[]) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hideRules, setHideRules] = useState(false);

  useLayoutEffect(() => {
    const grid = ref.current;
    if (!grid) return;
    const context = document.createElement("canvas").getContext("2d");
    if (!context) return;

    const measureText = (text: string, element: Element, size?: number) => {
      const style = getComputedStyle(element);
      context.font = `${style.fontStyle} ${style.fontWeight} ${size ? `${size}px` : style.fontSize} ${style.fontFamily}`;
      return (
        context.measureText(text).width +
        (Number.parseFloat(style.letterSpacing) || 0) *
          Math.max(0, Array.from(text).length - 1)
      );
    };

    const measure = () => {
      const style = getComputedStyle(grid);
      const cards = grid.querySelectorAll(".metric-card[data-priority='true']");
      const preferredWidths = priorities.map((metric, index) => {
        const card = cards[index];
        if (!card) return 0;
        const cardStyle = getComputedStyle(card);
        const value = card.querySelector(".metric-value");
        const label = card.querySelector(".metric-label");
        const note = card.querySelector(".metric-details .muted");
        if (!value || !label || !note) return 0;
        const inset = [
          cardStyle.paddingLeft,
          cardStyle.paddingRight,
          cardStyle.borderLeftWidth,
          cardStyle.borderRightWidth,
          cardStyle.columnGap,
        ].reduce((sum, value) => sum + (Number.parseFloat(value) || 0), 0);
        // Reserve the count's full size before responsive font sizing reduces it.
        return (
          inset +
          measureText(metric.value, value, 42) +
          Math.max(
            measureText(metric.label, label),
            measureText(metric.note, note),
          ) +
          4
        );
      });
      setHideRules(
        needsRulesSpace(
          style.gridTemplateColumns.split(" ").length,
          grid.clientWidth,
          Number.parseFloat(style.columnGap) || 0,
          Math.max(...preferredWidths),
        ),
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    document.fonts?.addEventListener("loadingdone", measure);
    return () => {
      observer.disconnect();
      document.fonts?.removeEventListener("loadingdone", measure);
    };
  }, [priorities]);

  return { ref, hideRules };
};
