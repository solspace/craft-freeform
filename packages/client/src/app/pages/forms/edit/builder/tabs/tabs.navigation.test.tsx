import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type BuilderTab, TabsNavigation } from "./tabs.navigation";
import { fitTabs } from "./tabs.overflow";

vi.mock("@ff-client/utils/translations", () => ({
  default: (text: string) => text,
}));

const tabs: BuilderTab[] = [
  { to: "/forms/1", label: "Layout", end: true },
  { to: "/forms/1/notifications", label: "Notifications" },
  { to: "/forms/1/rules", label: "Rules" },
  { to: "/forms/1/integrations", label: "Integrations" },
  { to: "/forms/1/settings", label: "Settings", errors: true },
  { to: "/forms/1/preview", label: "Preview" },
];
let host: HTMLDivElement;
let root: Root;
let available: number;
let observers: Array<() => void>;
let navigate: ReturnType<typeof useNavigate>;

function Harness({ items = tabs }: { items?: BuilderTab[] }) {
  navigate = useNavigate();
  return <TabsNavigation tabs={items} />;
}

async function render(path = "/forms/1") {
  await act(async () =>
    root.render(
      <MemoryRouter initialEntries={[path]}>
        <Harness />
      </MemoryRouter>,
    ),
  );
}

async function resize(width: number) {
  available = width;
  await act(async () => {
    observers.forEach((callback) => {
      callback();
    });
  });
}

const links = () => Array.from(host.querySelectorAll(".main-tabs > a"));
const more = () =>
  host.querySelector<HTMLButtonElement>("button[aria-haspopup='menu']");
async function click(element: Element) {
  await act(async () =>
    element.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    ),
  );
}
async function key(element: Element, value: string) {
  await act(async () => {
    element.dispatchEvent(
      new KeyboardEvent("keydown", { key: value, bubbles: true }),
    );
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 40));
  });
}

beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  available = 1000;
  observers = [];
  vi.stubGlobal(
    "ResizeObserver",
    class {
      targets = new Set<Element>();
      constructor(callback: ResizeObserverCallback) {
        observers.push(() => {
          if (this.targets.size)
            callback(
              Array.from(this.targets).map(
                (target) =>
                  ({
                    target,
                    contentRect: target.getBoundingClientRect(),
                  }) as ResizeObserverEntry,
              ),
              this as unknown as ResizeObserver,
            );
        });
      }
      observe(target: Element) {
        this.targets.add(target);
      }
      unobserve(target: Element) {
        this.targets.delete(target);
      }
      disconnect() {
        this.targets.clear();
      }
    },
  );
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    function (this: HTMLElement) {
      let width = 0;
      if (this === host.firstElementChild) width = available;
      else if (this.parentElement?.hasAttribute("inert"))
        width = this.textContent?.includes("More") ? 80 : 100;
      return {
        width,
        height: 49,
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: width,
        bottom: 49,
        toJSON() {},
      };
    },
  );
});

afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("responsive builder navigation", () => {
  it("does not remeasure or replace observers on unrelated builder renders", async () => {
    await render();
    const measurements = vi.mocked(HTMLElement.prototype.getBoundingClientRect)
      .mock.calls.length;
    const observerCount = observers.length;

    for (let edit = 0; edit < 10; edit++) {
      await act(async () =>
        root.render(
          <MemoryRouter>
            <Harness items={tabs.map((tab) => ({ ...tab }))} />
          </MemoryRouter>,
        ),
      );
    }

    expect(observers).toHaveLength(observerCount);
    expect(
      vi.mocked(HTMLElement.prototype.getBoundingClientRect).mock.calls,
    ).toHaveLength(measurements);
    await resize(320);
    expect(more()).not.toBeNull();
  });

  it("shows all tabs when they fit and responds to the header width", async () => {
    await render();
    expect(links()).toHaveLength(6);
    expect(more()).toBeNull();
    await resize(320);
    expect(links().map((node) => node.textContent)).toEqual([
      "Layout",
      "Notifications",
    ]);
    expect(more()).not.toBeNull();
    await resize(1000);
    expect(links()).toHaveLength(6);
    expect(more()).toBeNull();
  });

  it("keeps the active nested section visible and reachable in navigation order", async () => {
    available = 320;
    await render("/forms/1/preview");
    expect(links().map((node) => node.textContent)).toEqual([
      "Layout",
      "Preview",
    ]);
    expect(host.querySelector("a.active")?.textContent).toBe("Preview");
    await act(async () => navigate("/forms/1/settings/general"));
    expect(host.querySelector("a.active")?.textContent).toBe("Settings");
  });

  it("marks hidden errors and promotes a selected overflow tab", async () => {
    available = 320;
    await render();
    expect(more()!.classList.contains("errors")).toBe(true);
    await click(more()!);
    const menu = document.querySelector("[role='menu']")!;
    expect(menu).not.toBeNull();
    const settings = Array.from(menu.querySelectorAll("a")).find(
      (node) => node.textContent === "Settings",
    )!;
    expect(settings.classList.contains("errors")).toBe(true);
    await click(settings);
    expect(document.querySelector("[role='menu']")).toBeNull();
    expect(host.querySelector("a.active")?.textContent).toBe("Settings");
    expect(more()!.classList.contains("errors")).toBe(false);
  });

  it("supports arrow-key navigation and Escape with focus returned to More", async () => {
    available = 320;
    await render();
    more()!.focus();
    await key(more()!, "ArrowDown");
    expect(document.activeElement?.textContent).toBe("Rules");
    await key(document.activeElement!, "ArrowDown");
    expect(document.activeElement?.textContent).toBe("Integrations");
    await key(document.activeElement!, "Escape");
    expect(document.querySelector("[role='menu']")).toBeNull();
    expect(document.activeElement).toBe(more());
  });

  it("closes overflow when resizing makes every tab visible", async () => {
    available = 320;
    await render();
    await click(more()!);
    expect(document.querySelector("[role='menu']")).not.toBeNull();
    await resize(1000);
    expect(document.querySelector("[role='menu']")).toBeNull();
    expect(links()).toHaveLength(6);
  });
});

describe("tab fitting", () => {
  it("uses actual widths, includes the active tab and preserves order", () => {
    expect(fitTabs([80, 180, 90, 160], 340, 80, 3)).toEqual([0, 3]);
    expect(fitTabs([80, 180, 90, 160], 510, 80, 3)).toEqual([0, 1, 2, 3]);
  });
  it("keeps an unusually long active label for visual truncation", () => {
    expect(fitTabs([80, 400], 160, 80, 1)).toEqual([1]);
    expect(fitTabs([], 0, 80, 0)).toEqual([]);
  });
});
