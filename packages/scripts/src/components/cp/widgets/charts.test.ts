import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const chart = vi.hoisted(() => ({
  update: vi.fn(),
  destroy: vi.fn(),
  toggleDataVisibility: vi.fn(),
  getDataVisibility: vi.fn(),
  setDatasetVisibility: vi.fn(),
  isDatasetVisible: vi.fn(),
}));
const construct = vi.hoisted(() => vi.fn());
vi.mock("chart.js/auto", () => ({
  default: class {
    constructor(canvas: HTMLCanvasElement, config: unknown) {
      construct(canvas, config);
      Object.assign(this, chart);
    }
  },
}));

import "./charts";

function root() {
  const el = document.createElement("div");
  el.innerHTML = `<span data-chart-total></span>
    <div data-chart-plot><canvas></canvas></div>
    <p data-chart-empty hidden>No submissions</p>
    <div data-chart-legend></div>`;
  document.body.append(el);
  return el;
}

describe("dashboard charts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
  });

  afterEach(async () => {
    document.body.replaceChildren();
    await Promise.resolve();
    vi.unstubAllGlobals();
  });

  it("shows an empty state without constructing a chart for an inactive range", () => {
    const el = root();
    window.FreeformDashboardChart(el, {
      type: "line",
      data: { labels: ["Oct 20"], datasets: [{ data: [0] }] },
    });
    expect(construct).not.toHaveBeenCalled();
    expect(el.querySelector<HTMLElement>("[data-chart-plot]")!.hidden).toBe(
      true,
    );
    expect(el.querySelector<HTMLElement>("[data-chart-empty]")!.hidden).toBe(
      false,
    );
  });

  it("toggles linear series, renders names as text and destroys removed charts", async () => {
    const el = root();
    window.FreeformDashboardChart(el, {
      type: "line",
      data: {
        labels: ["Oct 20"],
        datasets: [
          { label: "<b>Contact</b>", data: [3], borderColor: "red" },
          { label: "Orders", data: [2], borderColor: "blue" },
        ],
      },
    });
    expect(el.querySelector("b")).toBeNull();
    expect(el.querySelector<HTMLElement>("[data-chart-legend]")!.hidden).toBe(
      false,
    );
    const button = el.querySelector("button")!;
    expect(button.textContent).toBe("<b>Contact</b>3");
    chart.isDatasetVisible.mockReturnValueOnce(true).mockReturnValueOnce(false);
    button.click();
    expect(chart.setDatasetVisibility).toHaveBeenCalledWith(0, false);
    expect(button.getAttribute("aria-pressed")).toBe("false");
    expect(chart.update).toHaveBeenCalledOnce();
    expect(construct.mock.calls[0][1].options.animation).toBe(false);
    el.remove();
    await Promise.resolve();
    expect(chart.destroy).toHaveBeenCalledOnce();
  });

  it.each([
    { type: "line" as const, label: "Contact" },
    { type: "line" as const, label: "Submissions" },
    { type: "bar" as const, label: "Contact" },
    { type: "doughnut" as const, label: "Contact" },
  ])(
    "reclaims the legend area for a single $type series ($label)",
    ({ type, label }) => {
      const el = root();
      window.FreeformDashboardChart(el, {
        type,
        data: {
          labels: [label],
          datasets: [{ label, data: [3] }],
        },
      });
      expect(el.querySelector<HTMLElement>("[data-chart-legend]")!.hidden).toBe(
        true,
      );
      expect(el.dataset.chartLegend).toBe("none");
      expect(construct).toHaveBeenCalledOnce();
      expect(el.querySelector("[data-chart-total]")!.textContent).toBe("3");
    },
  );

  it("toggles radial slices independently and prevents duplicate initialization", () => {
    const el = root();
    const config = {
      type: "doughnut" as const,
      data: {
        labels: ["Contact", "Orders"],
        datasets: [{ data: [3, 2], backgroundColor: ["red", "blue"] }],
      },
    };
    window.FreeformDashboardChart(el, config);
    window.FreeformDashboardChart(el, config);
    expect(construct).toHaveBeenCalledOnce();
    chart.getDataVisibility.mockReturnValue(false);
    el.querySelectorAll("button")[1].click();
    expect(chart.toggleDataVisibility).toHaveBeenCalledWith(1);
    expect(el.querySelectorAll("button")[1].getAttribute("aria-pressed")).toBe(
      "false",
    );
    expect(el.querySelector("[data-chart-total]")!.textContent).toBe("5");
  });
  it("uses Craft's current surface for radial separators and repaints theme changes", async () => {
    const el = root();
    el.style.setProperty("--pane-bg", "#161b22");
    window.FreeformDashboardChart(el, {
      type: "doughnut",
      data: { labels: ["Contact"], datasets: [{ data: [3] }] },
    });
    const config = construct.mock.calls[0][1];
    expect(config.data.datasets[0].borderColor()).toBe("#161b22");
    el.style.setProperty("--pane-bg", "#ffffff");
    document.documentElement.setAttribute("data-test-theme", "light");
    await Promise.resolve();
    expect(config.data.datasets[0].borderColor()).toBe("#ffffff");
    expect(chart.update).toHaveBeenCalledWith("none");
    el.remove();
    await Promise.resolve();
    chart.update.mockClear();
    document.documentElement.removeAttribute("data-test-theme");
    await Promise.resolve();
    expect(chart.update).not.toHaveBeenCalled();
  });

  it("keeps explicitly configured radial separator colors", () => {
    window.FreeformDashboardChart(root(), {
      type: "pie",
      data: {
        labels: ["Contact"],
        datasets: [{ data: [3], borderColor: "red" }],
      },
    });
    expect(construct.mock.calls[0][1].data.datasets[0].borderColor).toBe("red");
  });

  it("updates scale labels and grid when the effective Craft palette changes", async () => {
    const el = root();
    el.style.setProperty("--light-text-color", "#8b949e");
    el.style.setProperty("--hairline-color", "#30363d");
    window.FreeformDashboardChart(el, {
      type: "line",
      data: { labels: ["Nov 7"], datasets: [{ label: "Contact", data: [3] }] },
    });
    const scales = construct.mock.calls[0][1].options.scales;
    expect(scales.x.ticks.color()).toBe("#8b949e");
    expect(scales.y.ticks.color()).toBe("#8b949e");
    expect(scales.y.grid.color()).toBe("#30363d");
    el.style.setProperty("--hairline-color", "#dce4ec");
    document.documentElement.setAttribute("data-scale-theme", "light");
    await Promise.resolve();
    expect(scales.y.grid.color()).toBe("#dce4ec");
    expect(chart.update).toHaveBeenCalledWith("none");
    document.documentElement.removeAttribute("data-scale-theme");
  });
});
