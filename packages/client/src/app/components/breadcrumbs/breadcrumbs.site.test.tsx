import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SiteCrumb } from "./breadcrumbs.site";

const { change } = vi.hoisted(() => ({ change: vi.fn() }));
vi.mock("@config/freeform/freeform.config", () => ({
  default: { sites: { enabled: true } },
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));
vi.mock("@ff-client/contexts/site/site.context", () => ({
  useSiteContext: () => ({
    current: { id: 1, handle: "english", name: "English" },
    list: [
      { id: 1, handle: "english", name: "English" },
      { id: 2, handle: "french", name: "French" },
    ],
    change,
  }),
}));

let root: Root;
let container: HTMLDivElement;

beforeEach(async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(() =>
    root.render(
      <ul>
        <SiteCrumb />
      </ul>,
    ),
  );
});

afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
  vi.clearAllMocks();
});

describe("breadcrumb site switcher", () => {
  it("uses separate keyboard-operable site buttons and restores focus after selection", async () => {
    const trigger = container.querySelector<HTMLButtonElement>(
      '[aria-controls="site-crumb-menu"]',
    )!;
    await act(() => trigger.click());
    const menu = container.querySelector("#site-crumb-menu")!;
    expect(trigger.contains(menu)).toBe(false);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(menu.querySelector("button"));
    await act(() =>
      menu.querySelectorAll<HTMLButtonElement>("button")[1].click(),
    );
    expect(change).toHaveBeenCalledWith("french");
    expect(container.querySelector("#site-crumb-menu")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("closes on Escape or an outside click", async () => {
    const trigger = container.querySelector<HTMLButtonElement>(
      '[aria-controls="site-crumb-menu"]',
    )!;
    await act(() => trigger.click());
    await act(() =>
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })),
    );
    expect(container.querySelector("#site-crumb-menu")).toBeNull();
    expect(document.activeElement).toBe(trigger);
    await act(() => trigger.click());
    await act(() => document.body.click());
    expect(container.querySelector("#site-crumb-menu")).toBeNull();
  });
});
