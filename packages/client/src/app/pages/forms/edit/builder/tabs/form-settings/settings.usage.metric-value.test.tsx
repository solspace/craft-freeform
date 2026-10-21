import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { UsageMetricValue } from "./settings.usage.metric-value";

it.each([
  [0, "0"],
  [999, "999"],
  [999.9, "999.9"],
  [1000, "1K"],
  [2831, "2.8K"],
  [80800, "80.8K"],
  [400800, "400K"],
  [999950, "999K"],
  [4200000, "4.2M"],
  [80800000, "80.8M"],
  [400800000, "400M"],
  [1234567890, "1.2B"],
  [1234567890123, "1.2T"],
  [Number.MAX_SAFE_INTEGER, "9000T"],
])(
  "shows a compact total for %s and exposes its exact count",
  (value, compact) => {
    const host = document.createElement("div");
    host.innerHTML = renderToStaticMarkup(<UsageMetricValue value={value} />);

    expect(host.querySelector('[aria-hidden="true"]')?.textContent).toBe(
      compact,
    );
    expect(host.querySelector(".visually-hidden")?.textContent).toBe(
      value.toLocaleString(),
    );
    expect(host.querySelector("strong")?.title).toBe(value.toLocaleString());
  },
);

it("keeps unavailable totals distinct from zero", () => {
  const host = document.createElement("div");
  host.innerHTML = renderToStaticMarkup(<UsageMetricValue />);

  expect(host.querySelector('[aria-hidden="true"]')?.textContent).toBe("—");
  expect(host.querySelector(".visually-hidden")?.textContent).toBe("—");
});
