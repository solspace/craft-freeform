import type { TooltipModel } from "chart.js";
import type { WidgetChartType } from "./chart-data";
import { getWidgetFrameHost } from "./frame-session";

type TooltipState = Pick<
  TooltipModel<WidgetChartType>,
  "opacity" | "dataPoints" | "title" | "caretX" | "caretY"
>;

export function createChartTooltip(root: HTMLElement, radial: boolean) {
  const plot = root.querySelector<HTMLElement>("[data-chart-plot]")!;
  const canvas = plot.querySelector("canvas")!;
  const frameWindow = root.ownerDocument.defaultView!;
  const host = getWidgetFrameHost(frameWindow);
  const frame = host ? (frameWindow.frameElement as HTMLIFrameElement) : null;
  const doc = host?.document || root.ownerDocument;
  const element = doc.createElement("div");
  element.className = "freeform-chart-tooltip";
  element.setAttribute("role", "tooltip");
  element.hidden = true;
  const portal = host ? doc.createElement("div") : null;
  if (portal) {
    portal.className = "freeform-dashboard-chart";
    Object.assign(portal.style, {
      position: "fixed",
      inset: "0",
      height: "0",
      pointerEvents: "none",
      zIndex: "1000",
    });
    element.style.position = "fixed";
    portal.append(element);
    doc.body.append(portal);
  } else plot.append(element);
  const hide = () => {
    element.hidden = true;
  };
  if (host) {
    host.addEventListener("scroll", hide, true);
    host.addEventListener("resize", hide);
    canvas.addEventListener("pointerleave", hide);
  }
  const destroy = () => {
    portal?.remove();
    element.remove();
    host?.removeEventListener("scroll", hide, true);
    host?.removeEventListener("resize", hide);
    canvas.removeEventListener("pointerleave", hide);
    frameWindow.removeEventListener("pagehide", destroy);
  };
  if (host) frameWindow.addEventListener("pagehide", destroy, { once: true });
  let previousContent = "";

  const render = ({ tooltip }: { tooltip: TooltipState }) => {
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
    const bounds = host
      ? { width: host.innerWidth, height: host.innerHeight }
      : plotRect;
    const content = JSON.stringify({
      title,
      rows,
      more,
      width: bounds.width,
      height: bounds.height,
    });

    // Pointer movement only changes position; rebuild content when values change.
    if (content !== previousContent) {
      element.replaceChildren();
      const heading = doc.createElement("div");
      heading.className = "freeform-chart-tooltip-title";
      heading.textContent = title;
      element.append(heading);
      const body = doc.createElement("div");
      body.className = "freeform-chart-tooltip-body";
      for (const row of rows) {
        const line = doc.createElement("div");
        line.className = "freeform-chart-tooltip-row";
        const swatch = doc.createElement("span");
        swatch.className = "freeform-chart-tooltip-swatch";
        swatch.style.backgroundColor = String(row.color);
        swatch.setAttribute("aria-hidden", "true");
        const label = doc.createElement("span");
        label.className = "freeform-chart-tooltip-label";
        label.textContent = row.label;
        const value = doc.createElement("strong");
        value.textContent = row.count.toLocaleString();
        line.append(swatch, label, value);
        body.append(line);
      }
      element.append(body);
      const footer = doc.createElement("div");
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
        element.offsetHeight > bounds.height - 16 &&
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
    const frameRect = frame?.getBoundingClientRect();
    const scaleX =
      frameRect && frame?.clientWidth ? frameRect.width / frame.clientWidth : 1;
    const scaleY =
      frameRect && frame?.clientHeight
        ? frameRect.height / frame.clientHeight
        : 1;
    const x = frameRect
      ? frameRect.left +
        (canvasRect.left + (anchor?.x ?? tooltip.caretX)) * scaleX
      : canvasRect.left - plotRect.left + (anchor?.x ?? tooltip.caretX);
    const y = frameRect
      ? frameRect.top +
        (canvasRect.top + (anchor?.y ?? tooltip.caretY)) * scaleY
      : canvasRect.top - plotRect.top + (anchor?.y ?? tooltip.caretY);
    const width = element.offsetWidth;
    const height = element.offsetHeight;
    const left = x + 14 + width <= bounds.width - 8 ? x + 14 : x - width - 14;
    element.style.left = `${Math.max(8, Math.min(left, bounds.width - width - 8))}px`;
    element.style.top = `${Math.max(8, Math.min(y - height / 2, bounds.height - height - 8))}px`;
  };
  return Object.assign(render, { destroy });
}
