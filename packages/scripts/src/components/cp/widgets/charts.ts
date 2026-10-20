import {
  prepareChartData,
  type WidgetChartConfig,
  type WidgetChartType,
} from "@lib/cp/widgets/chart-data";
import { createChartTooltip } from "@lib/cp/widgets/chart-tooltip";
import type { ChartDataset, ChartOptions } from "chart.js";
import Chart from "chart.js/auto";

declare global {
  interface Window {
    FreeformDashboardChart: (
      root: HTMLElement | null,
      config: WidgetChartConfig,
    ) => void;
  }
}

// Keep Chart.js private so other Craft widgets can use their own version.
window.FreeformDashboardChart = (root, config) => {
  if (!root || root.dataset.initialized) return;
  root.dataset.initialized = "true";

  const { radial, total } = prepareChartData(config);
  root.querySelector("[data-chart-total]")!.textContent =
    total.toLocaleString();
  const canvas = root.querySelector("canvas")!;
  if (!total) {
    root.querySelector<HTMLElement>("[data-chart-plot]")!.hidden = true;
    root.querySelector<HTMLElement>("[data-chart-empty]")!.hidden = false;
    return;
  }

  const legend = root.querySelector("[data-chart-legend]")!;
  const options = config.options || {};
  options.responsive = true;
  options.maintainAspectRatio = false;
  options.animation = window.matchMedia("(prefers-reduced-motion: reduce)")
    .matches
    ? false
    : { duration: 250 };
  options.plugins = {
    ...options.plugins,
    legend: { display: false },
    tooltip: {
      enabled: false,
      filter: (item) => Number(item.raw) > 0,
      external: createChartTooltip(root, radial),
    },
  };
  const submissionTicks = {
    maxTicksLimit: 6,
    precision: 0,
    format: { maximumFractionDigits: 0 },
  };
  if (radial) {
    if (config.type === "polarArea") {
      options.scales = { r: { beginAtZero: true, ticks: submissionTicks } };
    }
    config.data.datasets[0].borderWidth = 2;
    if (config.type === "doughnut") {
      (options as ChartOptions<"doughnut">).cutout = "65%";
    }
  } else {
    options.scales = {
      ...options.scales,
      x: {
        type: "category",
        grid: { display: false },
        ticks: { maxTicksLimit: 8, maxRotation: 0 },
      },
      y: { type: "linear", beginAtZero: true, ticks: submissionTicks },
    };
    config.data.datasets.forEach((dataset) => {
      dataset.borderWidth = 2;
      if (config.type === "line") {
        const line = dataset as ChartDataset<"line", number[]>;
        line.pointRadius = 0;
        line.pointHoverRadius = 4;
        line.tension = 0.2;
      }
    });
    options.interaction = { mode: "index", intersect: false };
  }
  config.options = options;
  const chart = new Chart<WidgetChartType, number[], string>(canvas, config);
  const items = radial ? config.data.labels : config.data.datasets;
  items.forEach((item, index) => {
    const dataset = config.data.datasets[radial ? 0 : index];
    const label = radial ? String(item) : dataset.label || "";
    const count = radial
      ? dataset.data[index]
      : dataset.data.reduce((sum, value) => sum + Number(value), 0);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "freeform-chart-legend-item";
    button.setAttribute("aria-pressed", "true");
    button.title = label;

    const swatch = document.createElement("span");
    swatch.className = "freeform-chart-swatch";
    swatch.setAttribute("aria-hidden", "true");
    swatch.style.backgroundColor = String(
      radial && Array.isArray(dataset.backgroundColor)
        ? dataset.backgroundColor[index]
        : dataset.borderColor,
    );
    const name = document.createElement("span");
    name.className = "freeform-chart-label";
    name.textContent = label;
    const value = document.createElement("span");
    value.className = "freeform-chart-count";
    value.textContent = Number(count).toLocaleString();
    button.append(swatch, name, value);
    button.addEventListener("click", () => {
      if (radial) chart.toggleDataVisibility(index);
      else chart.setDatasetVisibility(index, !chart.isDatasetVisible(index));
      button.setAttribute(
        "aria-pressed",
        String(
          radial
            ? chart.getDataVisibility(index)
            : chart.isDatasetVisible(index),
        ),
      );
      chart.update();
    });
    legend.append(button);
  });

  // Craft replaces widget bodies when settings change, and removes deleted cards.
  const observer = new MutationObserver(() => {
    if (!root.isConnected) {
      chart.destroy();
      observer.disconnect();
    }
  });
  observer.observe(root.closest(".dashboard-grid") || document.body, {
    childList: true,
    subtree: true,
  });
};
