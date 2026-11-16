import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { DashboardWidget } from "../grid.widgets";
import { WidgetCard } from "./card.widget";

vi.mock("@components/modals/modal.context", () => ({
  useModal: () => ({ openSlideout: vi.fn() }),
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));
vi.mock("../grid.widgets", () => ({
  getExtraWidgetSizes: () => [],
  widgetKey: () => [],
  healthWidgetKey: (item: DashboardWidget, siteId: number) =>
    `${siteId}:${item.uid}:${item.revision ?? ""}`,
}));
vi.mock("./card.size-menu", () => ({
  CardSizeMenu: () => <button type="button">Card options</button>,
}));

const widget: DashboardWidget = {
  uid: "chart",
  type: "linear",
  title: "Submission overview",
  size: "2x2",
  groupUid: null,
  beforeId: null,
  revision: "first",
};
let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  healthReady.mockReset();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("Craft", {
    getCpUrl: (path: string) => `https://craft.test/admin/${path}`,
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  vi.useRealTimers();
  host.remove();
  vi.unstubAllGlobals();
});
const healthReady = vi.fn();
const render = async (item = widget, siteId = 1) => {
  await act(async () =>
    root.render(
      <WidgetCard
        widget={item}
        siteId={siteId}
        disabled={false}
        onResize={vi.fn()}
        onRemove={vi.fn()}
        onKeyboardMove={vi.fn()}
        onHealthReady={healthReady}
      />,
    ),
  );
};
const frame = () => host.querySelector("iframe")!;
const load = async (
  element: HTMLIFrameElement,
  url: string | null,
  ready = false,
) => {
  Object.defineProperty(element, "contentDocument", {
    configurable: true,
    value: url ? { URL: url, querySelector: () => (ready ? {} : null) } : null,
  });
  await act(async () => element.dispatchEvent(new Event("load")));
};

it("keeps a skeleton and busy state until the widget document loads, ignoring its initial blank load", async () => {
  await render();
  expect(host.querySelector("[role=status]")?.getAttribute("aria-label")).toBe(
    "Loading...",
  );
  expect(
    host.querySelectorAll(".react-loading-skeleton").length,
  ).toBeGreaterThan(0);
  expect(host.querySelector("h2")?.textContent).toBe(widget.title);
  expect(frame().getAttribute("aria-hidden")).toBe("true");
  await load(frame(), "about:blank");
  expect(host.querySelector("[aria-busy=true]")).not.toBeNull();
  await load(
    frame(),
    "https://craft.test/admin/freeform/api/forms/widgets/chart/body",
  );
  expect(host.querySelector("[role=status]")).toBeNull();
  expect(host.querySelector("[aria-busy=false]")).not.toBeNull();
  expect(frame().getAttribute("aria-hidden")).toBe("false");
  expect(frame().hasAttribute("tabindex")).toBe(false);
});

it("shows a fresh placeholder for changed settings and sites, without flashing on ordinary rerenders", async () => {
  await render();
  await load(frame(), "https://craft.test/widget");
  const original = frame();
  await render({ ...widget, size: "3x2" });
  expect(frame()).toBe(original);
  expect(host.querySelector("[role=status]")).toBeNull();
  await render({ ...widget, revision: "updated" });
  expect(frame()).not.toBe(original);
  expect(host.querySelector("[role=status]")).not.toBeNull();
  await load(original, "https://craft.test/stale");
  expect(host.querySelector("[role=status]")).not.toBeNull();
  await load(frame(), "https://craft.test/updated");
  await render({ ...widget, revision: "updated" }, 2);
  expect(frame().src).toContain("siteId=2");
  expect(host.querySelector("[role=status]")).not.toBeNull();
});

it("releases the placeholder when the browser finishes a document whose contents are unavailable", async () => {
  await render();
  await load(frame(), null);
  expect(host.querySelector("[role=status]")).toBeNull();
});

it("reports loading separately from health document success and failure, resetting for changed settings", async () => {
  const health = {
    ...widget,
    uid: "health",
    type: "activity-health",
    replacesBanner: true,
  };
  await render(health);
  expect(healthReady).toHaveBeenLastCalledWith("1:health:first", null);
  await load(frame(), "https://craft.test/widget", true);
  expect(healthReady).toHaveBeenLastCalledWith("1:health:first", true);
  await load(frame(), "https://craft.test/error", false);
  expect(healthReady).toHaveBeenLastCalledWith("1:health:first", false);
  await load(frame(), "https://craft.test/widget", true);
  await render({ ...health, revision: "updated" });
  expect(healthReady).toHaveBeenLastCalledWith("1:health:updated", null);
});

it("restores the fallback when a health frame stalls, and cancels the timeout after success", async () => {
  vi.useFakeTimers();
  const health = { ...widget, uid: "health", type: "activity-health" };
  await render(health);
  await act(async () => vi.advanceTimersByTime(14999));
  expect(healthReady).toHaveBeenLastCalledWith("1:health:first", null);
  await act(async () => vi.advanceTimersByTime(1));
  expect(healthReady).toHaveBeenLastCalledWith("1:health:first", false);
  await load(frame(), "https://craft.test/widget", true);
  expect(healthReady).toHaveBeenLastCalledWith("1:health:first", true);
  await render({ ...health, revision: "updated" });
  await load(frame(), "https://craft.test/updated", true);
  await act(async () => vi.advanceTimersByTime(15000));
  expect(healthReady).toHaveBeenLastCalledWith("1:health:updated", true);
});

it("shows a ready health frame before load completes and ignores other frames and origins", async () => {
  await render({ ...widget, uid: "health", type: "activity-health" });
  const send = async (
    origin: string,
    source: MessageEventSource | null,
    health = true,
  ) => {
    await act(async () =>
      window.dispatchEvent(
        new MessageEvent("message", {
          origin,
          source,
          data: { type: "freeform-widget-ready", healthReady: health },
        }),
      ),
    );
  };
  await send("https://untrusted.test", frame().contentWindow);
  await send(window.location.origin, window);
  expect(frame().getAttribute("aria-hidden")).toBe("true");
  await send(window.location.origin, frame().contentWindow);
  expect(frame().getAttribute("aria-hidden")).toBe("false");
  expect(healthReady).toHaveBeenLastCalledWith("1:health:first", true);
  await send(window.location.origin, frame().contentWindow, false);
  expect(healthReady).toHaveBeenLastCalledWith("1:health:first", false);
});

it("puts the health period and selected log links next to the widget title", async () => {
  await render({
    ...widget,
    type: "activity-health",
    navigation: {
      days: 7,
      period: "Past 7 days",
      scope: "All forms",
      links: [
        {
          label: "Open Activity Log",
          url: "https://craft.test/admin/freeform/activity?days=7",
        },
      ],
    },
  });
  const link = host.querySelector<HTMLAnchorElement>("nav a")!;
  expect(link.textContent).toBe("Open Activity Log");
  expect(link.href).toContain("activity?days=7");
  expect(link.closest("[data-health=true]")?.textContent).toContain(
    "Past 7 days",
  );
  expect(host.querySelector("nav")?.getAttribute("aria-label")).toBe(
    "Review logs",
  );
});
