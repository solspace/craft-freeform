import type { TooltipModel } from "chart.js";
import type { WidgetChartType } from "./chart-data";

type TooltipState = Pick<
  TooltipModel<WidgetChartType>,
  "opacity" | "dataPoints" | "title" | "caretX" | "caretY"
>;

export function createChartTooltip(root: HTMLElement, radial: boolean) {
  const plot = root.querySelector<HTMLElement>("[data-chart-plot]")!;
  const canvas = plot.querySelector("canvas")!;
  const element = document.createElement("div");
  element.className = "freeform-chart-tooltip";
  element.setAttribute("role", "tooltip");
  element.hidden = true;
  plot.append(element);
  let previousContent = "";

  return ({ tooltip }: { tooltip: TooltipState }) => {
    const points = (tooltip.dataPoints || [])
      .filter((point) => Number(point.raw) > 0)
      .sort((a, b) => Number(b.raw) - Number(a.raw));
    if (!tooltip.opacity || !points.length) {
      element.hidden = true;
      return;
    }

    const rows = points.slice(0, 8).map((point) => ({
      label: radial
        ? root.dataset.chartSubmissionsLabel || "Submissions"
        : point.dataset.label || "",
      count: Number(point.raw),
      color:
        radial && Array.isArray(point.dataset.backgroundColor)
          ? point.dataset.backgroundColor[point.dataIndex]
          : point.dataset.borderColor,
    }));
    const title = radial ? points[0].label : (tooltip.title || []).join(" ");
    const more = points.length - rows.length;
    const plotRect = plot.getBoundingClientRect();
    const content = JSON.stringify({
      title,
      rows,
      more,
      width: plotRect.width,
      height: plotRect.height,
    });

    // Pointer movement only changes position; rebuild content when values change.
    if (content !== previousContent) {
      element.replaceChildren();
      const heading = document.createElement("div");
      heading.className = "freeform-chart-tooltip-title";
      heading.textContent = title;
      element.append(heading);
      const body = document.createElement("div");
      body.className = "freeform-chart-tooltip-body";
      for (const row of rows) {
        const line = document.createElement("div");
        line.className = "freeform-chart-tooltip-row";
        const swatch = document.createElement("span");
        swatch.className = "freeform-chart-tooltip-swatch";
        swatch.style.backgroundColor = String(row.color);
        swatch.setAttribute("aria-hidden", "true");
        const label = document.createElement("span");
        label.className = "freeform-chart-tooltip-label";
        label.textContent = row.label;
        const value = document.createElement("strong");
        value.textContent = row.count.toLocaleString();
        line.append(swatch, label, value);
        body.append(line);
      }
      element.append(body);
      const footer = document.createElement("div");
      footer.className = "freeform-chart-tooltip-footer";
      const setMore = (count: number) => {
        footer.hidden = !count;
        footer.textContent = count
          ? (
              root.dataset.chartMoreFormsLabel ||
              "{count} more forms in the legend"
            ).replace("{count}", count.toLocaleString())
          : "";
      };
      setMore(more);
      element.append(footer);
      element.hidden = false;
      let omitted = more;
      while (
        element.offsetHeight > plotRect.height - 16 &&
        body.children.length > 1
      ) {
        body.lastElementChild!.remove();
        setMore(++omitted);
      }
      previousContent = content;
    }

    element.hidden = false;
    const canvasRect = canvas.getBoundingClientRect();
    // Index-mode caret positions include inactive series at the baseline.
    // Anchor linear tooltips to a point with submissions instead.
    const anchor = radial ? null : points[0].element;
    const x = canvasRect.left - plotRect.left + (anchor?.x ?? tooltip.caretX);
    const y = canvasRect.top - plotRect.top + (anchor?.y ?? tooltip.caretY);
    const width = element.offsetWidth;
    const height = element.offsetHeight;
    const left = x + 14 + width <= plotRect.width - 8 ? x + 14 : x - width - 14;
    element.style.left = `${Math.max(8, Math.min(left, plotRect.width - width - 8))}px`;
    element.style.top = `${Math.max(8, Math.min(y - height / 2, plotRect.height - height - 8))}px`;
  };
}
