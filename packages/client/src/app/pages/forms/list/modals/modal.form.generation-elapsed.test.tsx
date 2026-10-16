import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  formatElapsed,
  GenerationElapsed,
} from "./modal.form.generation-elapsed";

vi.mock("@ff-client/utils/translations", () => ({
  default: (value: string) => value,
}));
let root: Root;
let host: HTMLDivElement;
const origin = new Date("2026-10-16T05:00:00Z").getTime();
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(origin);
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
it("updates only elapsed time and freezes at completion", async () => {
  act(() =>
    root.render(<GenerationElapsed startedAt={origin} finishedAt={null} />),
  );
  expect(host.textContent).toContain("00:00");
  await act(async () => vi.advanceTimersByTimeAsync(65000));
  expect(host.textContent).toContain("01:05");
  act(() =>
    root.render(
      <GenerationElapsed startedAt={origin} finishedAt={origin + 65000} />,
    ),
  );
  await act(async () => vi.advanceTimersByTimeAsync(10000));
  expect(host.textContent).toContain("01:05");
  expect(host.querySelector("time")!.dateTime).toBe("PT65S");
  expect(host.firstElementChild!.getAttribute("aria-live")).toBe("off");
  expect(vi.getTimerCount()).toBe(0);
});
it("uses the original request time after reopening and catches up after backgrounding", () => {
  vi.setSystemTime(origin + 125000);
  act(() =>
    root.render(<GenerationElapsed startedAt={origin} finishedAt={null} />),
  );
  expect(host.textContent).toContain("02:05");
  vi.setSystemTime(origin + 185000);
  act(() => document.dispatchEvent(new Event("visibilitychange")));
  expect(host.textContent).toContain("03:05");
  act(() => root.unmount());
  expect(vi.getTimerCount()).toBe(0);
  root = createRoot(host);
});
it("does not invent elapsed time for an older request without a timestamp", () => {
  act(() =>
    root.render(<GenerationElapsed startedAt={null} finishedAt={null} />),
  );
  expect(host.textContent).toBe("");
  expect(vi.getTimerCount()).toBe(0);
});
it("formats seconds and hours and clamps a clock adjustment to zero", () => {
  expect(formatElapsed(9)).toBe("00:09");
  expect(formatElapsed(3599)).toBe("59:59");
  expect(formatElapsed(3605)).toBe("1:00:05");
  expect(formatElapsed(-1)).toBe("00:00");
});
