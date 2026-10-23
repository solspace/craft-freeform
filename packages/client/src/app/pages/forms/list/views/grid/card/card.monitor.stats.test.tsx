import type { TestStats } from "@ff-client/types/form-monitor";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { FormMonitorStats } from "./card.monitor.stats";

vi.mock("@ff-client/utils/translations", () => ({
  default: (message: string) => message,
}));
let root: Root;
let host: HTMLDivElement;
afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  vi.unstubAllGlobals();
});
const stats: TestStats = {
  success: 3,
  failed: 1,
  pending: 0,
  total: 4,
  percentage: { success: 75, failed: 25, pending: 0 },
};
function render(formMonitor: TestStats & { enabled: boolean }) {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() =>
    root.render(
      <FormMonitorStats
        formMonitor={formMonitor}
        showLastTest
        size="sm"
        align="right"
      />,
    ),
  );
}
it("shows no monitor information for disabled forms", () => {
  render({ ...stats, enabled: false });
  expect(host.textContent).toBe("");
});
it("shows pending uptime when a monitored form has no test data", () => {
  render({ ...stats, enabled: true, total: 0 });
  expect(host.textContent).toBe("Uptime: Pending");
});
it("renders uptime and the last test status without treating zero successes as missing data", () => {
  render({
    ...stats,
    enabled: true,
    success: 0,
    failed: 4,
    percentage: { success: 0, failed: 100, pending: 0 },
    lastTest: { status: "failed" } as TestStats["lastTest"],
  });
  expect(host.textContent).toContain("Last Test");
  expect(host.textContent).toContain("Uptime: 0%");
  expect(host.querySelector("svg")).not.toBeNull();
});
it("shows connection errors instead of a misleading uptime percentage", () => {
  render({
    ...stats,
    enabled: true,
    error: { exception: "connection", message: "Form Monitor unavailable" },
  });
  expect(host.textContent).toBe("Form Monitor unavailable");
  expect(host.textContent).not.toContain("75%");
});
