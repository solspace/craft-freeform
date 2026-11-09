import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Notices } from "./notices";
import type { NoticesResponse } from "./notices.queries";

const fixture = vi.hoisted(() => ({ feed: false, get: vi.fn() }));
vi.mock("@config/freeform/freeform.config", () => ({
  default: {
    get feed() {
      return fixture.feed;
    },
  },
}));
vi.mock("axios", () => ({ default: { get: fixture.get, delete: vi.fn() } }));
vi.mock("@ff-client/utils/urls", () => ({
  generateUrl: (path: string) => `https://craft5.test/admin/freeform/${path}`,
}));

let client: QueryClient;
let root: Root;
let host: HTMLDivElement;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  fixture.feed = false;
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

const announcement = {
  id: 1,
  message: "A Freeform announcement",
  type: "info" as const,
  dateCreated: "2026-11-06",
};
const render = async (
  data: Omit<NoticesResponse, "warningLogs" | "activityRetentionDays"> &
    Partial<Pick<NoticesResponse, "warningLogs" | "activityRetentionDays">>,
  hideLogAlert = false,
) => {
  fixture.get.mockResolvedValue({
    data: { warningLogs: [], activityRetentionDays: 30, ...data },
  });
  await act(async () => {
    root.render(
      <QueryClientProvider client={client}>
        <Notices hideLogAlert={hideLogAlert} />
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
  ["classic", "settings/error-log", "Classic logs:"],
] as const)(
  "loads and links %s errors with announcements disabled",
  async (errorLog, path, label) => {
    await render({ notices: [announcement], errors: 7, errorLog });
    expect(fixture.get).toHaveBeenCalledWith("/api/notices");
    expect(host.textContent).toContain(label);
    expect(host.textContent).not.toContain(announcement.message);
    expect(host.querySelector("a")?.href).toBe(
      `https://craft5.test/admin/freeform/${path}`,
    );
    expect(host.querySelector("a")?.textContent).toBe("7 errors");
  },
);

it("shows announcements alongside errors when enabled", async () => {
  fixture.feed = true;
  await render({ notices: [announcement], errors: 3, errorLog: "activity" });
  expect(host.textContent).toContain(announcement.message);
  expect(host.textContent).toContain("3 errors");
});

it("hides the banner when logging has no errors and announcements are disabled", async () => {
  await render({ notices: [announcement], errors: 0, errorLog: null });
  expect(host.children).toHaveLength(0);
});

it("keeps announcements visible without logged errors", async () => {
  fixture.feed = true;
  await render({ notices: [announcement], errors: 0, errorLog: null });
  expect(host.textContent).toContain(announcement.message);
  expect(host.querySelector("a")).toBeNull();
});

it("handles a failed notices request without crashing", async () => {
  fixture.get.mockRejectedValue(new Error("Request failed"));
  await act(async () => {
    root.render(
      <QueryClientProvider client={client}>
        <Notices />
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
  ["error-log", "settings/error-log"],
  ["integrations-log", "settings/integrations-log"],
  ["email-log", "settings/email-log"],
] as const)(
  "shows warning-only alerts in amber and links to %s",
  async (log, path) => {
    await render({
      notices: [],
      errors: 0,
      errorLog: log === "activity" ? "activity" : "classic",
      warningLogs: [{ log, count: 2 }],
    });
    expect(host.querySelector("li")?.dataset.type).toBe("warning");
    const labels = {
      activity: "2 warnings",
      "error-log": "2 warnings in error log",
      "integrations-log": "2 integration warnings",
      "email-log": "2 email warnings",
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
    notices: [],
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
    notices: [],
    errors: 0,
    errorLog: "activity",
    warningLogs: [{ log: "activity", count: 1 }],
  });
  expect(host.querySelector("a")?.textContent).toBe("1 warning");
});

it.each(["activity", "classic"] as const)(
  "uses singular wording for one %s error",
  async (errorLog) => {
    await render({ notices: [], errors: 1, errorLog });
    expect(host.querySelector("a")?.textContent).toBe("1 error");
    expect(host.textContent).not.toContain("There are currently");
  },
);

it.each([1, 7, 90, 365])(
  "shows the configured Activity retention period of %s days",
  async (days) => {
    await render({
      notices: [],
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

it("keeps classic log sources distinct and does not give them an Activity retention period", async () => {
  await render({
    notices: [],
    errors: 3,
    errorLog: "classic",
    activityRetentionDays: null,
    warningLogs: [
      { log: "integrations-log", count: 2 },
      { log: "email-log", count: 1 },
    ],
  });
  expect(
    Array.from(host.querySelectorAll("a"), (link) => [
      link.textContent,
      link.href,
    ]),
  ).toEqual([
    ["3 errors", "https://craft5.test/admin/freeform/settings/error-log"],
    [
      "2 integration warnings",
      "https://craft5.test/admin/freeform/settings/integrations-log",
    ],
    [
      "1 email warning",
      "https://craft5.test/admin/freeform/settings/email-log",
    ],
  ]);
  expect(host.textContent).not.toContain("Recorded in the past");
});

it("keeps errors and warnings separately identifiable", async () => {
  await render({
    notices: [],
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

it("keeps announcements visible when a health widget replaces log alerts", async () => {
  fixture.feed = true;
  await render(
    {
      notices: [announcement],
      errors: 5,
      errorLog: "activity",
      warningLogs: [{ log: "activity", count: 2 }],
    },
    true,
  );
  expect(host.textContent).toContain(announcement.message);
  expect(host.textContent).not.toContain("5 errors");
  expect(host.textContent).not.toContain("2 warnings");
});
