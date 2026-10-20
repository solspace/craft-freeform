import type { ChartConfiguration } from "chart.js";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { SubmissionActivityChart } from "./settings.usage.chart";

const fixture = vi.hoisted(() => ({
  charts: [] as Array<{
    config: ChartConfiguration<"line", number[], string>;
    visibility: boolean[];
    destroy: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  }>,
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));
vi.mock("chart.js", () => ({
  CategoryScale: {},
  LinearScale: {},
  LineController: {},
  LineElement: {},
  PointElement: {},
  Tooltip: {},
  Chart: class {
    static register = vi.fn();
    visibility = [true, true];
    destroy = vi.fn();
    update = vi.fn();
    constructor(
      _canvas: HTMLCanvasElement,
      public config: ChartConfiguration<"line", number[], string>,
    ) {
      fixture.charts.push(this);
    }
    isDatasetVisible(index: number) {
      return this.visibility[index];
    }
    setDatasetVisibility(index: number, visible: boolean) {
      this.visibility[index] = visible;
    }
  },
}));
let root: Root;
let container: HTMLDivElement;
const onDaysChange = vi.fn();
const daily = Array.from({ length: 90 }, (_, index) => ({
  date: new Date(Date.UTC(2026, 6, 23 + index)).toISOString().slice(0, 10),
  submissions: index === 89 ? 3 : 0,
  spam: index === 88 ? 1 : 0,
}));
beforeEach(() => {
  fixture.charts.length = 0;
  onDaysChange.mockClear();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

it("plots all 90 days and toggles the selected series through its legend", () => {
  act(() =>
    root.render(
      <SubmissionActivityChart
        daily={daily}
        days={90}
        onDaysChange={onDaysChange}
      />,
    ),
  );
  const chart = fixture.charts[0];
  expect(chart.config.data.labels).toHaveLength(90);
  expect(
    chart.config.data.datasets.map((series) => series.data.at(-1)),
  ).toEqual([3, 0]);
  expect(chart.config.options.animation).toBe(false);
  const buttons = container.querySelectorAll("button");
  expect(Array.from(buttons).map((button) => button.textContent)).toEqual([
    "Submissions3",
    "Stored spam1",
  ]);
  act(() => buttons[1].click());
  expect(chart.visibility).toEqual([true, false]);
  expect(buttons[1].getAttribute("aria-pressed")).toBe("false");
  expect(chart.update).toHaveBeenCalledOnce();
});

it("destroys the canvas chart and removes its tooltip when leaving the page", () => {
  act(() =>
    root.render(
      <SubmissionActivityChart
        daily={daily}
        days={90}
        onDaysChange={onDaysChange}
      />,
    ),
  );
  const chart = fixture.charts[0];
  const page = container.firstElementChild!;
  expect(page.querySelectorAll('[role="tooltip"]')).toHaveLength(1);
  act(() => root.render(null));
  expect(chart.destroy).toHaveBeenCalledOnce();
  expect(page.querySelector('[role="tooltip"]')).toBeNull();
  act(() =>
    root.render(
      <SubmissionActivityChart
        daily={daily}
        days={90}
        onDaysChange={onDaysChange}
      />,
    ),
  );
  expect(container.querySelectorAll('[role="tooltip"]')).toHaveLength(1);
});

it("shows the empty message inside the chart until either series has activity", () => {
  const empty = daily.map((day) => ({ ...day, submissions: 0, spam: 0 }));
  act(() =>
    root.render(
      <SubmissionActivityChart
        daily={empty}
        days={90}
        onDaysChange={onDaysChange}
      />,
    ),
  );
  expect(container.querySelector('.chart [role="status"]')!.textContent).toBe(
    "No stored submissions or spam in this period.",
  );
  const spamOnly = empty.map((day, index) => ({
    ...day,
    spam: index === 89 ? 1 : 0,
  }));
  act(() =>
    root.render(
      <SubmissionActivityChart
        daily={spamOnly}
        days={90}
        onDaysChange={onDaysChange}
      />,
    ),
  );
  expect(
    container.querySelector('[role="status"]')!.hasAttribute("hidden"),
  ).toBe(true);
});

it("offers four periods and shows loading feedback while the selected range loads", () => {
  act(() =>
    root.render(
      <SubmissionActivityChart
        daily={daily}
        days={90}
        onDaysChange={onDaysChange}
      />,
    ),
  );
  const select = container.querySelector("select")!;
  expect(select.value).toBe("90");
  expect(Array.from(select.options).map((option) => option.text)).toEqual([
    "Last 7 days",
    "Last 30 days",
    "Last 90 days",
    "Last year",
  ]);
  act(() => {
    select.value = "7";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
  expect(onDaysChange).toHaveBeenCalledWith(7);
  act(() =>
    root.render(
      <SubmissionActivityChart
        daily={daily}
        days={7}
        onDaysChange={onDaysChange}
        loading
      />,
    ),
  );
  expect(container.querySelector('[role="status"]')!.textContent).toBe(
    "Loading statistics…",
  );
  expect(
    container.querySelector('[role="status"]')!.hasAttribute("hidden"),
  ).toBe(false);
  expect(container.querySelector(".chart")!.getAttribute("aria-busy")).toBe(
    "true",
  );
});
