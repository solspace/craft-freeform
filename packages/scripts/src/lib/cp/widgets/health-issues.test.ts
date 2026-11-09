import { afterEach, expect, it, vi } from "vitest";
import { fitHealthIssues } from "./health-issues";

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("shows more complete issues as space grows and restores the compact list on resize", () => {
  let resize = () => {};
  const disconnect = vi.fn();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
        resize = callback;
      }
      observe() {}
      disconnect = disconnect;
    },
  );
  let bottom = 210;
  let rowHeight = 42;
  document.body.innerHTML = `<section class="ff-health-widget"><div class="ff-health-content"><section class="ff-health-recent"><ul style="row-gap:2px">${Array.from({ length: 8 }, (_, i) => `<li><a href="#${i}">Issue ${i}</a></li>`).join("")}</ul></section></div></section>`;
  const widget = document.querySelector<HTMLElement>(".ff-health-widget")!;
  const content = widget.querySelector<HTMLElement>(".ff-health-content")!;
  const list = widget.querySelector("ul")!;
  const rows = Array.from(list.querySelectorAll("li"));
  vi.spyOn(content, "getBoundingClientRect").mockImplementation(
    () => ({ bottom }) as DOMRect,
  );
  vi.spyOn(list, "getBoundingClientRect").mockReturnValue({
    top: 23,
  } as DOMRect);
  for (const row of rows)
    vi.spyOn(row, "getBoundingClientRect").mockImplementation(
      () => ({ height: row.hidden ? 0 : rowHeight }) as DOMRect,
    );
  const visible = () =>
    rows.filter((row) => !row.hidden).map((row) => row.textContent);
  fitHealthIssues(widget);
  expect(visible()).toEqual(["Issue 0", "Issue 1", "Issue 2", "Issue 3"]);
  bottom = 330;
  resize();
  expect(visible()).toHaveLength(7);
  bottom = 90;
  rowHeight = 20;
  resize();
  expect(visible()).toEqual(["Issue 0", "Issue 1", "Issue 2"]);
  bottom = 500;
  resize();
  expect(visible()).toHaveLength(8);
  window.dispatchEvent(new Event("pagehide"));
  expect(disconnect).toHaveBeenCalledOnce();
});
