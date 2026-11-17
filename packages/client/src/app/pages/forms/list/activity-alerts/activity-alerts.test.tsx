import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ActivityAlerts } from "./activity-alerts";
import type { ActivityAlertsResponse } from "./activity-alerts.queries";

const fixture = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("axios", () => ({ default: { get: fixture.get, delete: vi.fn() } }));
vi.mock("@ff-client/utils/urls", () => ({
  generateUrl: (path: string) => `https://craft5.test/admin/freeform/${path}`,
}));

let client: QueryClient;
let root: Root;
let host: HTMLDivElement;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  fixture.get.mockReset();
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  client.clear();
  host.remove();
  vi.unstubAllGlobals();
});

const render = async (
  data: Omit<ActivityAlertsResponse, "warningLogs" | "activityRetentionDays"> &
    Partial<
      Pick<ActivityAlertsResponse, "warningLogs" | "activityRetentionDays">
    >,
  hideLogAlert = false,
) => {
  fixture.get.mockResolvedValue({
    data: { warningLogs: [], activityRetentionDays: 30, ...data },
  });
  await act(async () => {
    root.render(
      <QueryClientProvider client={client}>
        <ActivityAlerts hideLogAlert={hideLogAlert} />
      </QueryClientProvider>,
    );
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
};

it.each([
  [
    "activity",
    "activity?view=events&resolution=open&level=error",
    "Activity Log:",
  ],
] as const)("loads and links %s errors", async (errorLog, path, label) => {
  await render({ errors: 7, errorLog });
  expect(fixture.get).toHaveBeenCalledWith("/api/activity-alerts");
  expect(host.textContent).toContain(label);
  expect(host.querySelector("a")?.href).toBe(
    `https://craft5.test/admin/freeform/${path}`,
  );
  expect(host.querySelector("a")?.textContent).toBe("7 errors");
});

it("hides the banner when logging has no errors", async () => {
  await render({ errors: 0, errorLog: null });
  expect(host.children).toHaveLength(0);
});

it("handles a failed Activity alert request without crashing", async () => {
  fixture.get.mockRejectedValue(new Error("Request failed"));
  await act(async () => {
    root.render(
      <QueryClientProvider client={client}>
        <ActivityAlerts />
      </QueryClientProvider>,
    );
  });
  expect(host.children).toHaveLength(0);
});

it.each([
  [
    "activity",
    "activity?view=events&resolution=open&level=warning&category=system",
  ],
] as const)(
  "shows warning-only alerts in amber and links to %s",
  async (log, path) => {
    await render({
      errors: 0,
      errorLog: "activity",
      warningLogs: [{ log, count: 2 }],
    });
    expect(host.querySelector("li")?.dataset.type).toBe("warning");
    const labels = {
      activity: "2 warnings",
    };
    expect(host.querySelector("a")?.textContent).toBe(labels[log]);
    expect(host.querySelector("a")?.href).toBe(
      `https://craft5.test/admin/freeform/${path}`,
    );
    expect(host.textContent).not.toContain(" errors");
  },
);

it("shows separate counts and keeps the alert red when errors and warnings coexist", async () => {
  await render({
    errors: 3,
    errorLog: "activity",
    warningLogs: [{ log: "activity", count: 2 }],
  });
  expect(host.querySelector("li")?.dataset.type).toBe("log-list");
  expect(
    Array.from(host.querySelectorAll("a"), (link) => link.textContent),
  ).toEqual(["3 errors", "2 warnings"]);
});

it("uses singular wording for one warning", async () => {
  await render({
    errors: 0,
    errorLog: "activity",
    warningLogs: [{ log: "activity", count: 1 }],
  });
  expect(host.querySelector("a")?.textContent).toBe("1 warning");
});

it.each(["activity"] as const)(
  "uses singular wording for one %s error",
  async (errorLog) => {
    await render({ errors: 1, errorLog });
    expect(host.querySelector("a")?.textContent).toBe("1 error");
    expect(host.textContent).not.toContain("There are currently");
  },
);

it.each([1, 7, 90, 365])(
  "shows the configured Activity retention period of %s days",
  async (days) => {
    await render({
      errors: 3,
      errorLog: "activity",
      activityRetentionDays: days,
    });
    expect(host.textContent).toContain(
      days === 1
        ? "Recorded in the past day"
        : `Recorded in the past ${days} days`,
    );
    expect(host.textContent).not.toContain("30 days");
  },
);

it("keeps errors and warnings separately identifiable", async () => {
  await render({
    errors: 5,
    errorLog: "activity",
    warningLogs: [{ log: "activity", count: 2 }],
  });
  expect(host.querySelector('a[data-level="error"]')?.textContent).toBe(
    "5 errors",
  );
  expect(host.querySelector('a[data-level="warning"]')?.textContent).toBe(
    "2 warnings",
  );
  expect(host.querySelector("strong")?.textContent).toBe("Activity Log:");
  expect(host.querySelector("p")?.textContent).toBe(
    "Activity Log: 5 errors2 warnings",
  );
  expect(host.textContent).not.toContain("·");
});
