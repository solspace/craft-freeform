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
    constructor(canvas, config) {
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
        datasets: [{ label: "<b>Contact</b>", data: [3], borderColor: "red" }],
      },
    });
    expect(el.querySelector("b")).toBeNull();
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
});
