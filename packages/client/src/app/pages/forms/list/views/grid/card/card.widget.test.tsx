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
  host.remove();
  vi.unstubAllGlobals();
});
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
      />,
    ),
  );
};
const frame = () => host.querySelector("iframe")!;
const load = async (element: HTMLIFrameElement, url: string | null) => {
  Object.defineProperty(element, "contentDocument", {
    configurable: true,
    value: url ? { URL: url } : null,
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
